import hashlib
import hmac
import json
import os
import time
import uuid
import urllib.error
import urllib.parse
import urllib.request

__all__ = ["Hapti", "HaptiError", "verify_webhook"]
__version__ = "0.2.0"

FINAL = {"succeeded", "failed", "blocked", "incomplete", "needs_person", "cancelled"}


class HaptiError(Exception):
    def __init__(self, status, body):
        err = (body or {}).get("error") or {}
        super().__init__(err.get("message") or f"Hapti answered {status}")
        self.status = status
        self.type = err.get("type")
        self.reason = err.get("reason")
        self.index = err.get("index")


def _qs(params):
    items = {k: v for k, v in params.items() if v is not None}
    return "?" + urllib.parse.urlencode(items) if items else ""


def _q(value):
    return urllib.parse.quote(str(value), safe="")


class _Group:
    def __init__(self, client):
        self._c = client


class _Tasks(_Group):
    def create(self, task, idempotency_key=None):
        return self._c.request("POST", "/v1/tasks", task, idempotency_key=idempotency_key or str(uuid.uuid4()))

    def get(self, task_id):
        return self._c.request("GET", f"/v1/tasks/{task_id}")

    def list(self, limit=None, status=None, user=None, q=None, since=None, until=None, template=None, batch=None, cursor=None):
        if isinstance(status, (list, tuple)):
            status = ",".join(status)
        return self._c.request("GET", "/v1/tasks" + _qs({"limit": limit, "status": status, "user": user, "q": q, "since": since, "until": until, "template": template, "batch": batch, "cursor": cursor}))

    def all(self, **filters):
        cursor = None
        while True:
            page = self.list(limit=100, cursor=cursor, **filters)
            yield from page["data"]
            if not page.get("has_more") or not page.get("next_cursor"):
                return
            cursor = page["next_cursor"]

    def retry(self, task_id, idempotency_key=None):
        return self._c.request("POST", f"/v1/tasks/{task_id}/retry", idempotency_key=idempotency_key)

    def stream(self, task_id, last_event_id=None, reconnect=True):
        return self._c.stream(f"/v1/tasks/{task_id}/stream", last_event_id=last_event_id, reconnect=reconnect)

    def answer(self, task_id, value, key=None):
        return self._c.request("POST", f"/v1/tasks/{task_id}/answer", {"value": value, **({"key": key} if key else {})})

    def cancel(self, task_id):
        return self._c.request("POST", f"/v1/tasks/{task_id}/cancel")

    def approve(self, task_id, approve=True, by=None):
        return self._c.request("POST", f"/v1/tasks/{task_id}/approve", {"approve": approve, **({"by": by} if by else {})})

    def estimate(self, task):
        return self._c.request("POST", "/v1/tasks/estimate", task)

    def proof(self, task_id):
        return self._c.request("GET", f"/v1/tasks/{task_id}/proof")

    def delete_proof(self, task_id):
        return self._c.request("DELETE", f"/v1/tasks/{task_id}/proof")

    def dispute(self, task_id, reason):
        return self._c.request("POST", f"/v1/tasks/{task_id}/dispute", {"reason": reason})

    def file(self, task_id, name):
        return self._c.request("GET", f"/v1/tasks/{task_id}/files/{_q(name)}", raw=True)

    def wait(self, task_id, on_waiting=None, every=2.0, timeout=3600.0, on_step=None, live=True):
        until = time.time() + timeout
        seen = [None]

        def look(t):
            if t["status"] in FINAL and t.get("finished_at"):
                return t
            if t.get("pending") and on_waiting and json.dumps(t["pending"], sort_keys=True) != seen[0]:
                seen[0] = json.dumps(t["pending"], sort_keys=True)
                reply = on_waiting(t["pending"], t)
                if reply is not None:
                    if t["pending"].get("type") == "question":
                        self.answer(task_id, str(reply), t["pending"].get("key"))
                    else:
                        self.approve(task_id, reply is True)
            return None

        if live:
            try:
                for e in self._c.stream(f"/v1/tasks/{task_id}/stream", deadline=until):
                    if e["event"] == "step" and on_step:
                        on_step(e["data"])
                    if e["event"] == "task":
                        done = look(e["data"])
                        if done:
                            return done
                    if e["event"] == "done":
                        return self.get(task_id)
            except HaptiError as err:
                if err.status < 500:
                    raise
            except (OSError, ValueError):
                pass
        while True:
            t = self.get(task_id)
            done = look(t)
            if done:
                return done
            if time.time() > until:
                raise TimeoutError(f"Hapti: task {task_id} still {t['status']} after {int(timeout)} s")
            time.sleep(every)

    def run(self, task, on_waiting=None, every=2.0, timeout=3600.0, idempotency_key=None, on_step=None):
        created = self.create(task, idempotency_key=idempotency_key)
        return self.wait(created["id"], on_waiting=on_waiting, every=every, timeout=timeout, on_step=on_step)


class _Batches(_Group):
    def create(self, batch):
        return self._c.request("POST", "/v1/batches", batch)

    def get(self, batch_id):
        return self._c.request("GET", f"/v1/batches/{batch_id}")

    def list(self, limit=None):
        return self._c.request("GET", "/v1/batches" + _qs({"limit": limit}))

    def cancel(self, batch_id):
        return self._c.request("POST", f"/v1/batches/{batch_id}/cancel")

    def tasks(self, batch_id, status=None):
        after = None
        while True:
            page = self._c.request("GET", f"/v1/batches/{batch_id}/tasks" + _qs({"status": status, "after": after, "limit": 200}))
            yield from page["data"]
            if not page.get("next") or not page["data"]:
                return
            after = page["next"]

    def wait(self, batch_id, every=5.0):
        while True:
            b = self.get(batch_id)
            if b.get("finished_at"):
                return b
            time.sleep(every)


class _Schedules(_Group):
    def create(self, schedule):
        return self._c.request("POST", "/v1/schedules", schedule)

    def get(self, schedule_id):
        return self._c.request("GET", f"/v1/schedules/{schedule_id}")

    def list(self):
        return self._c.request("GET", "/v1/schedules")

    def pause(self, schedule_id):
        return self._c.request("PATCH", f"/v1/schedules/{schedule_id}", {"paused": True})

    def resume(self, schedule_id):
        return self._c.request("PATCH", f"/v1/schedules/{schedule_id}", {"paused": False})

    def delete(self, schedule_id):
        return self._c.request("DELETE", f"/v1/schedules/{schedule_id}")

    def tasks(self, schedule_id):
        return self._c.request("GET", f"/v1/schedules/{schedule_id}/tasks")


class _Users(_Group):
    def create(self, user):
        return self._c.request("POST", "/v1/users", user)

    def get(self, user_id):
        return self._c.request("GET", f"/v1/users/{_q(user_id)}")

    def update(self, user_id, user):
        return self._c.request("PATCH", f"/v1/users/{_q(user_id)}", user)

    def list(self, limit=None):
        return self._c.request("GET", "/v1/users" + _qs({"limit": limit}))

    def forget(self, user_id):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}")

    def history(self, user_id):
        return self._c.request("GET", f"/v1/users/{_q(user_id)}/history")

    def forward(self, user_id, to):
        return self._c.request("PUT", f"/v1/users/{_q(user_id)}/forward", {"to": to})

    def stop_forward(self, user_id):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}/forward")

    def phone(self, user_id, country=None):
        return self._c.request("POST", f"/v1/users/{_q(user_id)}/phone", {"country": country} if country else {})

    def release_phone(self, user_id):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}/phone")

    def sms(self, user_id):
        return self._c.request("GET", f"/v1/users/{_q(user_id)}/sms")

    def connect_link(self, user_id, accounts=None, brand=None, return_url=None, expires_in=None):
        body = {k: v for k, v in {"accounts": accounts, "brand": brand, "return_url": return_url, "expires_in": expires_in}.items() if v is not None}
        return self._c.request("POST", f"/v1/users/{_q(user_id)}/connect", body)

    def revoke_connect_links(self, user_id):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}/connect")

    def set_limits(self, user_id, tasks_per_day=None, cents_per_month=None):
        limits = {k: v for k, v in {"tasks_per_day": tasks_per_day, "cents_per_month": cents_per_month}.items() if v is not None}
        return self._c.request("PATCH", f"/v1/users/{_q(user_id)}", {"limits": limits or None})

    def usage(self, user_id, start=None, end=None):
        return self._c.request("GET", f"/v1/users/{_q(user_id)}/usage" + _qs({"from": start, "to": end}))

    def give_mandate(self, user_id, mandate):
        return self._c.request("POST", f"/v1/users/{_q(user_id)}/mandate", mandate)

    def revoke_mandate(self, user_id):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}/mandate")

    def drop_session(self, user_id):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}/session")

    def put_account(self, user_id, account, value):
        return self._c.request("PUT", f"/v1/users/{_q(user_id)}/accounts/{_q(account)}", value)

    def accounts(self, user_id):
        return self._c.request("GET", f"/v1/users/{_q(user_id)}/accounts")

    def delete_account(self, user_id, account):
        return self._c.request("DELETE", f"/v1/users/{_q(user_id)}/accounts/{_q(account)}")


class _Endpoints(_Group):
    def list(self):
        return self._c.request("GET", "/v1/webhooks/endpoints")

    def create(self, url, events=None, description=None, headers=None):
        return self._c.request("POST", "/v1/webhooks/endpoints", {"url": url, **({"events": events} if events else {}), **({"description": description} if description else {}), **({"headers": headers} if headers else {})})

    def get(self, endpoint_id):
        return self._c.request("GET", f"/v1/webhooks/endpoints/{endpoint_id}")

    def update(self, endpoint_id, **fields):
        return self._c.request("PATCH", f"/v1/webhooks/endpoints/{endpoint_id}", fields)

    def delete(self, endpoint_id):
        return self._c.request("DELETE", f"/v1/webhooks/endpoints/{endpoint_id}")

    def secret(self, endpoint_id):
        return self._c.request("GET", f"/v1/webhooks/endpoints/{endpoint_id}/secret")["secret"]

    def roll_secret(self, endpoint_id, expires_in_hours=None):
        return self._c.request("POST", f"/v1/webhooks/endpoints/{endpoint_id}/roll-secret", {} if expires_in_hours is None else {"expires_in_hours": expires_in_hours})

    def recover(self, endpoint_id, since=None):
        return self._c.request("POST", f"/v1/webhooks/endpoints/{endpoint_id}/recover", {"since": since} if since else {})

    def test(self, endpoint_id):
        return self._c.request("POST", f"/v1/webhooks/endpoints/{endpoint_id}/test")


class _Webhooks(_Group):
    def __init__(self, client):
        super().__init__(client)
        self.endpoints = _Endpoints(client)

    def events(self):
        return self._c.request("GET", "/v1/webhooks/events")

    def list_events(self, type=None, object=None, since=None, limit=None, cursor=None):
        return self._c.request("GET", "/v1/events" + _qs({"type": type, "object": object, "since": since, "limit": limit, "cursor": cursor}))

    def get_event(self, event_id):
        return self._c.request("GET", f"/v1/events/{event_id}")

    def deliveries(self, endpoint=None, event=None, state=None, limit=None, cursor=None):
        return self._c.request("GET", "/v1/webhooks/deliveries" + _qs({"endpoint": endpoint, "event": event, "state": state, "limit": limit, "cursor": cursor}))

    def delivery(self, delivery_id):
        return self._c.request("GET", f"/v1/webhooks/deliveries/{delivery_id}")

    def resend(self, delivery_id):
        return self._c.request("POST", f"/v1/webhooks/deliveries/{delivery_id}/resend")


class _Recipes(_Group):
    def list(self):
        return self._c.request("GET", "/v1/recipes")

    def get(self, recipe_id):
        return self._c.request("GET", f"/v1/recipes/{recipe_id}")

    def rename(self, recipe_id, name):
        return self._c.request("PATCH", f"/v1/recipes/{recipe_id}", {"name": name})

    def delete(self, recipe_id):
        return self._c.request("DELETE", f"/v1/recipes/{recipe_id}")


class Hapti:
    def __init__(self, api_key=None, base_url=None, retries=3, timeout=60.0, version=None):
        self.key = api_key or os.environ.get("HAPTI_API_KEY")
        if not self.key:
            raise ValueError('Hapti: an API key is needed (Hapti("hp_test_...") or the HAPTI_API_KEY variable)')
        self.base = (base_url or os.environ.get("HAPTI_BASE_URL") or "https://api.hapti.dev").rstrip("/")
        self.retries = retries
        self.timeout = timeout
        self.version = version
        self.tasks = _Tasks(self)
        self.webhooks = _Webhooks(self)
        self.batches = _Batches(self)
        self.schedules = _Schedules(self)
        self.users = _Users(self)
        self.recipes = _Recipes(self)

    def events(self, reconnect=True):
        return self.stream("/v1/stream", reconnect=reconnect)

    def _headers(self):
        h = {"Authorization": f"Bearer {self.key}", "User-Agent": f"hapti-python/{__version__}"}
        if self.version:
            h["Hapti-Version"] = self.version
        return h

    def stream(self, path, last_event_id=None, reconnect=True, deadline=None):
        last = last_event_id
        failures = 0
        while True:
            if deadline and time.time() > deadline:
                raise TimeoutError(f"Hapti: {path} still open at the deadline")
            headers = {**self._headers(), "Accept": "text/event-stream", **({"Last-Event-ID": last} if last else {})}
            req = urllib.request.Request(self.base + path, method="GET", headers=headers)
            try:
                res = urllib.request.urlopen(req, timeout=max(30.0, self.timeout))
            except urllib.error.HTTPError as e:
                try:
                    parsed = json.loads(e.read())
                except ValueError:
                    parsed = {}
                if e.code < 500 and e.code != 429:
                    raise HaptiError(e.code, parsed) from None
                failures += 1
                if not reconnect or failures > self.retries:
                    raise HaptiError(e.code, parsed) from None
                time.sleep(0.5 * 2 ** failures)
                continue
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                failures += 1
                if not reconnect or failures > self.retries:
                    raise
                time.sleep(0.5 * 2 ** failures)
                continue
            failures = 0
            event, data = "message", None
            try:
                with res:
                    for raw in res:
                        line = raw.decode("utf-8").rstrip("\r\n")
                        if line == "":
                            if data is not None:
                                yield {"event": event, "data": json.loads(data), "id": last}
                                if event == "done":
                                    return
                            event, data = "message", None
                        elif line.startswith("event:"):
                            event = line[6:].strip()
                        elif line.startswith("id:"):
                            last = line[3:].strip()
                        elif line.startswith("data:"):
                            data = (data + "\n" if data is not None else "") + line[5:].lstrip()
                        if deadline and time.time() > deadline:
                            raise TimeoutError(f"Hapti: {path} still open at the deadline")
            except (OSError, ConnectionError):
                if not reconnect:
                    raise
            if not reconnect:
                return
            time.sleep(1)

    def balance(self):
        return self.request("GET", "/v1/billing")

    def usage(self, start=None, end=None):
        return self.request("GET", "/v1/usage" + _qs({"from": start, "to": end}))

    def usage_by_user(self, start=None, end=None):
        return self.request("GET", "/v1/usage/users" + _qs({"from": start, "to": end}))

    def request(self, method, path, body=None, idempotency_key=None, raw=False):
        data = json.dumps(body).encode() if body is not None else None
        headers = self._headers()
        if method == "POST" and not idempotency_key:
            idempotency_key = str(uuid.uuid4())
        if data is not None:
            headers["Content-Type"] = "application/json"
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        safe = method == "GET" or bool(idempotency_key)
        attempt = 0
        while True:
            req = urllib.request.Request(self.base + path, data=data, method=method, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as res:
                    payload = res.read()
                    return payload if raw else (json.loads(payload) if payload else {})
            except urllib.error.HTTPError as e:
                payload = e.read()
                if (e.code == 429 or (e.code >= 500 and safe)) and attempt < self.retries:
                    wait = e.headers.get("Retry-After")
                    time.sleep(float(wait) if wait and wait.isdigit() else 0.5 * 2 ** attempt)
                    attempt += 1
                    continue
                try:
                    parsed = json.loads(payload)
                except ValueError:
                    parsed = {}
                raise HaptiError(e.code, parsed) from None
            except (urllib.error.URLError, TimeoutError, ConnectionError):
                if safe and attempt < self.retries:
                    time.sleep(0.5 * 2 ** attempt)
                    attempt += 1
                    continue
                raise


def verify_webhook(raw_body, signature_header, secret, tolerance_seconds=300, now=None):
    pairs = [p.strip().split("=", 1) for p in (signature_header or "").split(",") if "=" in p]
    ts_raw = next((v for k, v in pairs if k == "t"), "")
    sigs = [v for k, v in pairs if k == "v1" and v]
    try:
        ts = int(ts_raw)
    except ValueError:
        return False
    if not sigs or abs((now or time.time()) - ts) > tolerance_seconds:
        return False
    body = raw_body.decode() if isinstance(raw_body, (bytes, bytearray)) else raw_body
    for s in (secret if isinstance(secret, (list, tuple)) else [secret]):
        mac = hmac.new(s.encode(), f"{ts}.{body}".encode(), hashlib.sha256).hexdigest()
        if any(hmac.compare_digest(mac, v) for v in sigs):
            return True
    return False

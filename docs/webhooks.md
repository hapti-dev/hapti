# Webhooks

> Receive Hapti events on your server, signed and retried for three days. Endpoints, event types, signature checks, retries, secret rotation and recovery.

Webhooks push each event to your server the moment it happens: a task succeeds, waits for an answer, fails. They are the right way to get results in production.

## Create an endpoint

An endpoint is an https address on your server, the events it wants, and its own signing secret. You can have up to 16 per mode.

```bash
curl https://api.hapti.dev/v1/webhooks/endpoints \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com/hooks/hapti", "events": ["task.succeeded", "task.failed", "task.waiting"], "description": "Production"}'
```

```json
{
  "id": "we_14d949df05553008",
  "object": "webhook_endpoint",
  "url": "https://api.example.com/hooks/hapti",
  "events": [
    "task.succeeded",
    "task.failed",
    "task.waiting"
  ],
  "description": "Production",
  "enabled": true,
  "disabled_reason": null,
  "disabled_at": null,
  "failing_since": null,
  "last_success_at": null,
  "headers": {},
  "mode": "test",
  "secret": "whsec_0f9c3a…",
  "previous_secret_expires_at": null,
  "created_at": "2026-11-26T15:48:59.564Z"
}
```

Keep the `secret`: it is shown here in full. You can reveal it later with `GET /v1/webhooks/endpoints/{id}/secret`. Endpoints can also be managed in the console, under **Developers, Webhooks**, where **Send a test** delivers a signed `ping` event at once and shows the answer of your server.

`events` takes event types, a family such as `user.*`, or `["*"]` for every event, including the ones added later.

## Event types

| Event | When |
| --- | --- |
| `task.created` | A task was created. |
| `task.paused` | A live task waits for credit. |
| `task.waiting` | The agent asks a question or an approval. |
| `task.succeeded` | A task succeeded. |
| `task.failed` | A task failed. |
| `task.cancelled` | A task was cancelled. |
| `batch.finished` | Every task of a batch is over. |
| `monitor.changed` | A monitored website changed. |
| `monitor.checked` | A monitor checked its website (with notify always). |
| `test_run.finished` | Every test of a test run has its verdict. |
| `test.bug` | A test found a bug, confirmed by a second run. |
| `email.received` | An email reached a person's inbox. |
| `sms.received` | A text reached a person's number. |
| `user.account_connected` | A person connected an account. |
| `user.account_removed` | A person removed an account. |
| `user.forward_started` | A person started forwarding mail. |
| `user.forward_stopped` | A person stopped forwarding mail. |
| `user.memory_forgotten` | A person erased what the agent kept. |
| `ping` | A test sent from the console or the API. |

## The payload

Every delivery is a POST with a JSON event. The same event, with the same `id`, goes to every endpoint that wants it.

```json
{
  "id": "evt_f5cf79f50d4e8015e5668120",
  "object": "event",
  "type": "task.succeeded",
  "api_version": "2026-11-22",
  "created_at": "2026-11-26T15:48:59.528Z",
  "mode": "test",
  "data": {
    "id": "tsk_08b061ed7e634e89",
    "object": "task",
    "batch": null,
    "schedule": null,
    "mode": "test",
    "status": "succeeded",
    "queue": null,
    "paused": null,
    "level": "standard",
    "price_cents": 20,
    "starting_price_cents": 10,
    "billed": true,
    "user": "customer_42",
    "url": "https://portal.example.com/claims",
    "goal": "Declare the water damage claim and give me the claim number.",
    "input": {
      "data": {
        "contract": "AX-4471",
        "date": "2026-11-20"
      },
      "files": []
    },
    "pending": null,
    "learn": true,
    "used_recipe": null,
    "template": null,
    "created_by": {
      "type": "key",
      "id": "key_f945e155abc99c61",
      "hint": "hp_test_bNt…MCx9",
      "name": "default test key",
      "owner_email": null
    },
    "recipe_chosen": null,
    "recipe": null,
    "dispute": null,
    "result": {
      "answer": "The claim is declared. Claim number SIN-2026-118.",
      "data": {
        "claim_number": "SIN-2026-118"
      }
    },
    "files": [],
    "usage": {
      "steps": 14
    },
    "created_at": "2026-11-26T15:48:59.507Z",
    "started_at": "2026-11-26T15:48:59.511Z",
    "finished_at": "2026-11-26T15:48:59.527Z"
  }
}
```

| Header | Value |
| --- | --- |
| `Hapti-Signature` | `t=` the time, then one `v1=` signature per valid secret |
| `Hapti-Event` | The event type |
| `Hapti-Event-Id` | The event id. Use it to ignore an event you already handled |
| `Hapti-Delivery` | The delivery id, as shown in the console and the API |
| `Hapti-Attempt` | 1 for the first try, then 2, 3 and so on |

## Verify the signature

Always check that a delivery comes from Hapti before you trust it. The signature is an HMAC SHA-256 of the time, a dot and the raw body, with your endpoint secret. Use the raw body exactly as received, before any JSON parsing.

:::tabs
```js JavaScript
import express from 'express';
import Hapti from 'hapti-sdk';

const app = express();
app.post('/hooks/hapti', express.raw({ type: 'application/json' }), async (req, res) => {
  const ok = await Hapti.verifyWebhook(req.body, req.get('Hapti-Signature'), process.env.HAPTI_WEBHOOK_SECRET);
  if (!ok) return res.status(400).end();
  const event = JSON.parse(req.body);
  res.status(200).end();
  await handle(event);
});
```
```python Python
import os
from flask import Flask, request
from hapti import verify_webhook

app = Flask(__name__)

@app.post("/hooks/hapti")
def hapti_hook():
    raw = request.get_data()
    if not verify_webhook(raw, request.headers.get("Hapti-Signature"), os.environ["HAPTI_WEBHOOK_SECRET"]):
        return "", 400
    handle(request.get_json())
    return "", 200
```
```js Node without the SDK
import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(raw, header, secret, tolerance = 300) {
  const parts = header.split(',').map((p) => p.split('='));
  const t = Number(parts.find(([k]) => k === 't')?.[1]);
  if (!t || Math.abs(Date.now() / 1000 - t) > tolerance) return false;
  const mac = createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return parts.filter(([k]) => k === 'v1').some(([, v]) => v.length === mac.length && timingSafeEqual(Buffer.from(v), Buffer.from(mac)));
}
```
:::

The libraries refuse a signature older than 5 minutes, which stops replays. While a secret is being rotated, a delivery carries two `v1` signatures: accept the delivery when any of them matches.

## Retries

Answer with any 2xx status within 15 seconds. Anything else is retried, up to 9 attempts over about three days: at once, then after 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours, 12 hours, 24 hours and 24 hours, with a little random spread. Every attempt is kept with its status, time and answer, in the console and in [`GET /v1/webhooks/deliveries/{id}`](api-webhooks.md#get-a-delivery).

- Deliveries to one endpoint keep their order. A slow or failing endpoint never delays the others.
- When your server answers 5xx, 429 or nothing, its endpoint rests 30 seconds before the next try.
- An event can arrive more than once, for example when your server timed out after handling it. Use `Hapti-Event-Id` to handle each event once.
- Answer fast and do the work afterwards, in a queue if it is long.

## When an endpoint keeps failing

An endpoint that has failed for three days without a single success is paused, its waiting deliveries are closed, and the owners and admins of your organisation get an email. Once your server works again:

1. Enable the endpoint again: `PATCH /v1/webhooks/endpoints/{id}` with `{"enabled": true}`.
2. Send what it missed: `POST /v1/webhooks/endpoints/{id}/recover`. Every event of the last three days that never reached it is sent once. Give `since` to go back up to 30 days.

## Rotate a secret

`POST /v1/webhooks/endpoints/{id}/roll-secret` creates a new secret. The old one stays valid for 24 hours, and every delivery carries both signatures meanwhile, so you can deploy the new secret without losing an event. Send `{"expires_in_hours": 0}` to drop the old one at once, after a leak for example.

## Custom headers

An endpoint can send up to 10 headers of your own with each delivery, for example to pass a gateway that wants an `Authorization` header. They are stored sealed and shown masked.

```json
{ "url": "https://gateway.example.com/hapti", "headers": { "Authorization": "Bearer gw_...", "X-Tenant": "acme" } }
```

## A webhook for one task

A task or a batch can also take a `webhook` address that receives the events of that task only. These deliveries are signed with your organisation secret, which you read with `GET /v1/webhook/secret` or in the console. Endpoints are the better choice for most apps: one place, chosen events, their own secrets.

## Security

Endpoints must be public https addresses. Addresses on private networks, localhost and cloud metadata services are refused when you create the endpoint and again at the moment of sending, after the name is resolved.

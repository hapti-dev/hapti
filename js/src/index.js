const FINAL = new Set(['succeeded', 'failed', 'blocked', 'incomplete', 'needs_person', 'cancelled']);
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const randomKey = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

export class HaptiError extends Error {
  constructor(status, body) {
    const e = body?.error ?? {};
    super(e.message ?? `Hapti answered ${status}`);
    this.name = 'HaptiError';
    this.status = status;
    this.type = e.type ?? null;
    this.reason = e.reason ?? null;
    this.index = e.index ?? null;
  }
}

export class Hapti {
  constructor(apiKey = globalThis.process?.env?.HAPTI_API_KEY, { baseUrl = globalThis.process?.env?.HAPTI_BASE_URL ?? 'https://api.hapti.dev', retries = 3, fetch: f = globalThis.fetch, version = null } = {}) {
    if (!apiKey) throw new Error('Hapti: an API key is needed (new Hapti("hp_test_…") or the HAPTI_API_KEY variable)');
    this.key = apiKey;
    this.base = String(baseUrl).replace(/\/$/, '');
    this.retries = retries;
    this.f = f;
    this.version = version;
    const r = (m, p, b, o) => this.request(m, p, b, o);
    this.tasks = {
      create: (task, { idempotencyKey = randomKey() } = {}) => r('POST', '/v1/tasks', task, { idempotencyKey }),
      get: (id) => r('GET', `/v1/tasks/${id}`),
      list: ({ limit, status, user, q, since, until, template, batch, cursor } = {}) => r('GET', `/v1/tasks${qs({ limit, status: Array.isArray(status) ? status.join(',') : status, user, q, since, until, template, batch, cursor })}`),
      all: (filters = {}) => this.cursorPages('/v1/tasks', filters),
      retry: (id, { idempotencyKey } = {}) => r('POST', `/v1/tasks/${id}/retry`, null, { idempotencyKey }),
      stream: (id, opts) => this.stream(`/v1/tasks/${id}/stream`, opts),
      answer: (id, value, key) => r('POST', `/v1/tasks/${id}/answer`, { value, ...(key ? { key } : {}) }),
      cancel: (id) => r('POST', `/v1/tasks/${id}/cancel`),
      approve: (id, approve = true, by) => r('POST', `/v1/tasks/${id}/approve`, { approve, ...(by ? { by } : {}) }),
      estimate: (task) => r('POST', '/v1/tasks/estimate', task),
      proof: (id) => r('GET', `/v1/tasks/${id}/proof`),
      deleteProof: (id) => r('DELETE', `/v1/tasks/${id}/proof`),
      dispute: (id, reason) => r('POST', `/v1/tasks/${id}/dispute`, { reason }),
      file: (id, name) => r('GET', `/v1/tasks/${id}/files/${encodeURIComponent(name)}`, null, { raw: true }),
      wait: (id, opts) => this.wait(id, opts),
      run: async (task, opts = {}) => this.wait((await this.tasks.create(task, opts)).id, opts),
    };
    this.batches = {
      create: (batch) => r('POST', '/v1/batches', batch),
      get: (id) => r('GET', `/v1/batches/${id}`),
      list: ({ limit } = {}) => r('GET', `/v1/batches${qs({ limit })}`),
      cancel: (id) => r('POST', `/v1/batches/${id}/cancel`),
      tasks: (id, { status } = {}) => this.pages(`/v1/batches/${id}/tasks`, { status }),
      wait: async (id, { every = 5000, signal } = {}) => {
        for (;;) {
          const b = await this.batches.get(id);
          if (b.finished_at) return b;
          if (signal?.aborted) throw signal.reason ?? new Error('aborted');
          await sleep(every);
        }
      },
    };
    this.schedules = {
      create: (s) => r('POST', '/v1/schedules', s),
      get: (id) => r('GET', `/v1/schedules/${id}`),
      list: () => r('GET', '/v1/schedules'),
      pause: (id) => r('PATCH', `/v1/schedules/${id}`, { paused: true }),
      resume: (id) => r('PATCH', `/v1/schedules/${id}`, { paused: false }),
      delete: (id) => r('DELETE', `/v1/schedules/${id}`),
      tasks: (id) => r('GET', `/v1/schedules/${id}/tasks`),
    };
    this.users = {
      create: (u) => r('POST', '/v1/users', u),
      get: (id) => r('GET', `/v1/users/${encodeURIComponent(id)}`),
      update: (id, u) => r('PATCH', `/v1/users/${encodeURIComponent(id)}`, u),
      list: ({ limit } = {}) => r('GET', `/v1/users${qs({ limit })}`),
      forget: (id) => r('DELETE', `/v1/users/${encodeURIComponent(id)}`),
      history: (id) => r('GET', `/v1/users/${encodeURIComponent(id)}/history`),
      forward: (id, to) => r('PUT', `/v1/users/${encodeURIComponent(id)}/forward`, { to }),
      forwardStatus: (id) => r('GET', `/v1/users/${encodeURIComponent(id)}/forward`),
      stopForward: (id) => r('DELETE', `/v1/users/${encodeURIComponent(id)}/forward`),
      phone: (id, country) => r('POST', `/v1/users/${encodeURIComponent(id)}/phone`, country ? { country } : {}),
      releasePhone: (id) => r('DELETE', `/v1/users/${encodeURIComponent(id)}/phone`),
      sms: (id) => r('GET', `/v1/users/${encodeURIComponent(id)}/sms`),
      connectLink: (id, options = {}) => r('POST', `/v1/users/${encodeURIComponent(id)}/connect`, options),
      revokeConnectLinks: (id) => r('DELETE', `/v1/users/${encodeURIComponent(id)}/connect`),
      setLimits: (id, limits) => r('PATCH', `/v1/users/${encodeURIComponent(id)}`, { limits }),
      usage: (id, { from, to } = {}) => r('GET', `/v1/users/${encodeURIComponent(id)}/usage${qs({ from, to })}`),
      giveMandate: (id, m) => r('POST', `/v1/users/${encodeURIComponent(id)}/mandate`, m),
      revokeMandate: (id) => r('DELETE', `/v1/users/${encodeURIComponent(id)}/mandate`),
      dropSession: (id) => r('DELETE', `/v1/users/${encodeURIComponent(id)}/session`),
      putAccount: (id, account, a) => r('PUT', `/v1/users/${encodeURIComponent(id)}/accounts/${account}`, a),
      accounts: (id) => r('GET', `/v1/users/${encodeURIComponent(id)}/accounts`),
      deleteAccount: (id, account) => r('DELETE', `/v1/users/${encodeURIComponent(id)}/accounts/${account}`),
    };
    this.recipes = {
      list: () => r('GET', '/v1/recipes'),
      get: (id) => r('GET', `/v1/recipes/${id}`),
      rename: (id, name) => r('PATCH', `/v1/recipes/${id}`, { name }),
      delete: (id) => r('DELETE', `/v1/recipes/${id}`),
    };
    this.webhooks = {
      events: () => r('GET', '/v1/webhooks/events'),
      endpoints: {
        list: () => r('GET', '/v1/webhooks/endpoints'),
        create: (e) => r('POST', '/v1/webhooks/endpoints', e),
        get: (id) => r('GET', `/v1/webhooks/endpoints/${id}`),
        update: (id, e) => r('PATCH', `/v1/webhooks/endpoints/${id}`, e),
        delete: (id) => r('DELETE', `/v1/webhooks/endpoints/${id}`),
        secret: async (id) => (await r('GET', `/v1/webhooks/endpoints/${id}/secret`)).secret,
        rollSecret: (id, { expiresInHours } = {}) => r('POST', `/v1/webhooks/endpoints/${id}/roll-secret`, expiresInHours === undefined ? {} : { expires_in_hours: expiresInHours }),
        recover: (id, { since } = {}) => r('POST', `/v1/webhooks/endpoints/${id}/recover`, since ? { since } : {}),
        test: (id) => r('POST', `/v1/webhooks/endpoints/${id}/test`),
      },
      deliveries: ({ endpoint, event, state, limit, cursor } = {}) => r('GET', `/v1/webhooks/deliveries${qs({ endpoint, event, state, limit, cursor })}`),
      delivery: (id) => r('GET', `/v1/webhooks/deliveries/${id}`),
      resend: (id) => r('POST', `/v1/webhooks/deliveries/${id}/resend`),
    };
    this.events = (opts) => this.stream('/v1/stream', opts);
    this.eventLog = {
      list: ({ type, object, since, limit, cursor } = {}) => r('GET', `/v1/events${qs({ type, object, since, limit, cursor })}`),
      get: (id) => r('GET', `/v1/events/${id}`),
      all: (filters = {}) => this.cursorPages('/v1/events', filters),
    };
    this.balance = () => r('GET', '/v1/billing');
    this.usage = ({ from, to } = {}) => r('GET', `/v1/usage${qs({ from, to })}`);
    this.usageByUser = ({ from, to } = {}) => r('GET', `/v1/usage/users${qs({ from, to })}`);
  }

  async request(method, path, body = null, { idempotencyKey = null, raw = false } = {}) {
    if (method === 'POST' && !idempotencyKey) idempotencyKey = randomKey();
    for (let attempt = 0; ; attempt++) {
      let res;
      try {
        res = await this.f(`${this.base}${path}`, { method, headers: { Authorization: `Bearer ${this.key}`, 'User-Agent': 'hapti-js/0.2.0', ...(this.version ? { 'Hapti-Version': this.version } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }, body: body ? JSON.stringify(body) : undefined });
      } catch (e) {
        if (attempt < this.retries && (method === 'GET' || idempotencyKey)) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw e;
      }
      if ((res.status === 429 || res.status >= 500) && attempt < this.retries && (method === 'GET' || idempotencyKey || res.status === 429)) {
        await sleep(Number(res.headers.get('retry-after')) * 1000 || 500 * 2 ** attempt);
        continue;
      }
      if (raw && res.ok) return new Uint8Array(await res.arrayBuffer());
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new HaptiError(res.status, data);
      return data;
    }
  }

  async wait(id, { onWaiting = null, onStep = null, every = 2000, timeoutMs = 3600000, signal, live = true } = {}) {
    const until = Date.now() + timeoutMs;
    let seen = null;
    const look = async (t) => {
      if (FINAL.has(t.status) && t.finished_at !== null) return t;
      if (t.pending && onWaiting && JSON.stringify(t.pending) !== seen) {
        seen = JSON.stringify(t.pending);
        const reply = await onWaiting(t.pending, t);
        if (reply !== undefined && reply !== null) {
          if (t.pending.type === 'question') await this.tasks.answer(id, String(reply), t.pending.key);
          else await this.tasks.approve(id, reply === true);
        }
      }
      return null;
    };
    if (live) {
      const ctl = new AbortController();
      const stop = () => ctl.abort(signal?.reason);
      signal?.addEventListener?.('abort', stop, { once: true });
      const timer = setTimeout(() => ctl.abort(new Error(`Hapti: task ${id} not finished after ${Math.round(timeoutMs / 1000)} s`)), timeoutMs);
      try {
        for await (const e of this.tasks.stream(id, { signal: ctl.signal })) {
          if (e.event === 'step' && onStep) await onStep(e.data);
          if (e.event === 'task') {
            const done = await look(e.data);
            if (done) return done;
          }
          if (e.event === 'done') return await this.tasks.get(id);
        }
      } catch (e) {
        if (ctl.signal.aborted) throw ctl.signal.reason ?? e;
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener?.('abort', stop);
      }
    }
    for (;;) {
      const t = await this.tasks.get(id);
      const done = await look(t);
      if (done) return done;
      if (Date.now() > until) throw new Error(`Hapti: task ${id} still ${t.status} after ${Math.round(timeoutMs / 1000)} s`);
      if (signal?.aborted) throw signal.reason ?? new Error('aborted');
      await sleep(every);
    }
  }

  async *stream(path, { signal, lastEventId = null, reconnect = true } = {}) {
    let last = lastEventId;
    let failures = 0;
    for (;;) {
      if (signal?.aborted) return;
      let res;
      try {
        res = await this.f(`${this.base}${path}`, { headers: { Authorization: `Bearer ${this.key}`, Accept: 'text/event-stream', 'User-Agent': 'hapti-js/0.2.0', ...(this.version ? { 'Hapti-Version': this.version } : {}), ...(last ? { 'Last-Event-ID': last } : {}) }, signal });
      } catch (e) {
        if (signal?.aborted) return;
        if (!reconnect || ++failures > this.retries) throw e;
        await sleep(500 * 2 ** failures);
        continue;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status < 500 && res.status !== 429) throw new HaptiError(res.status, data);
        if (!reconnect || ++failures > this.retries) throw new HaptiError(res.status, data);
        await sleep(Number(res.headers.get('retry-after')) * 1000 || 500 * 2 ** failures);
        continue;
      }
      failures = 0;
      const dec = new TextDecoder();
      let buf = '';
      try {
        for await (const chunk of res.body) {
          buf += dec.decode(chunk, { stream: true }).replace(/\r\n/g, '\n');
          let i;
          while ((i = buf.indexOf('\n\n')) >= 0) {
            const block = buf.slice(0, i);
            buf = buf.slice(i + 2);
            let event = 'message';
            let data = null;
            for (const line of block.split('\n')) {
              if (line.startsWith('event:')) event = line.slice(6).trim();
              else if (line.startsWith('id:')) last = line.slice(3).trim();
              else if (line.startsWith('data:')) data = (data === null ? '' : `${data}\n`) + line.slice(5).trimStart();
            }
            if (data === null) continue;
            yield { event, data: JSON.parse(data), id: last };
            if (event === 'done') return;
          }
        }
      } catch (e) {
        if (signal?.aborted) return;
        if (!reconnect) throw e;
      }
      if (!reconnect) return;
      await sleep(1000);
    }
  }

  async *cursorPages(path, params = {}) {
    let cursor = null;
    for (;;) {
      const page = await this.request('GET', `${path}${qs({ ...params, status: Array.isArray(params.status) ? params.status.join(',') : params.status, cursor, limit: 100 })}`);
      for (const item of page.data) yield item;
      if (!page.has_more || !page.next_cursor) return;
      cursor = page.next_cursor;
    }
  }

  async *pages(path, params = {}) {
    let after = null;
    for (;;) {
      const page = await this.request('GET', `${path}${qs({ ...params, after, limit: 200 })}`);
      for (const item of page.data) yield item;
      if (!page.next || !page.data.length) return;
      after = page.next;
    }
  }

  static async verifyWebhook(rawBody, signatureHeader, secret, { toleranceSeconds = 300, now = Date.now() } = {}) {
    const pairs = String(signatureHeader ?? '').split(',').map((p) => p.trim().split('='));
    const ts = Number(pairs.find(([k]) => k === 't')?.[1]);
    const sigs = pairs.filter(([k, v]) => k === 'v1' && v).map(([, v]) => v);
    if (!ts || !sigs.length || Math.abs(now / 1000 - ts) > toleranceSeconds) return false;
    const enc = new TextEncoder();
    const body = `${ts}.${typeof rawBody === 'string' ? rawBody : new TextDecoder().decode(rawBody)}`;
    for (const s of Array.isArray(secret) ? secret : [secret]) {
      const key = await globalThis.crypto.subtle.importKey('raw', enc.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const mac = Array.from(new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(body))), (x) => x.toString(16).padStart(2, '0')).join('');
      for (const v of sigs) {
        if (mac.length !== v.length) continue;
        let diff = 0;
        for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ v.charCodeAt(i);
        if (diff === 0) return true;
      }
    }
    return false;
  }
}

function qs(params) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export default Hapti;

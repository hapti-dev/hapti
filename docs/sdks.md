# Libraries

> The official Hapti libraries for JavaScript and Python. Retries, idempotency, live waiting, pagination and webhook signature checks built in.

The libraries wrap the API with the good habits built in: an idempotency key on every POST, retries of `429` and `5xx` with a growing wait, live waiting through the stream, pagination and webhook checks.

## JavaScript and TypeScript

```bash
npm install hapti-sdk
```

```js
import Hapti from 'hapti-sdk';

const hapti = new Hapti(process.env.HAPTI_API_KEY);
const task = await hapti.tasks.run(
  { url: 'https://portal.example.com', goal: 'Download my last statement.', user: 'customer_42' },
  { onWaiting: (pending) => askTheCustomer(pending.text), onStep: (s) => console.log(s.summary) },
);
```

It works in Node 18 and later, has no dependencies, and ships its TypeScript types.

## Python

```bash
pip install hapti
```

```python
from hapti import Hapti

hapti = Hapti()
task = hapti.tasks.run(
    {"url": "https://portal.example.com", "goal": "Download my last statement.", "user": "customer_42"},
    on_waiting=lambda pending, task: ask_the_customer(pending["text"]),
)
```

It has no dependencies and works with Python 3.9 and later.

## Options

| Option | JavaScript | Python | Default |
| --- | --- | --- | --- |
| API key | first argument | first argument | `HAPTI_API_KEY` |
| Base address | `baseUrl` | `base_url` | `https://api.hapti.dev` |
| Retries | `retries` | `retries` | 3 |
| API version | `version` | `version` | your pinned version |

## What they cover

| Area | JavaScript | Python |
| --- | --- | --- |
| Tasks | `tasks.create`, `get`, `list`, `all`, `run`, `wait`, `stream`, `answer`, `approve`, `cancel`, `retry`, `estimate`, `proof`, `file`, `screenshot` | `tasks.create`, `get`, `list`, `all`, `run`, `wait`, `stream`, `answer`, `approve`, `cancel`, `retry`, `estimate`, `proof`, `file`, `screenshot` |
| People | `users.create`, `get`, `update`, `forget`, `putAccount`, `revealAccount`, `connectLink`, `giveMandate`, `setLimits`, `phone` | `users.create`, `get`, `update`, `forget`, `put_account`, `reveal_account`, `connect_link`, `give_mandate`, `set_limits`, `phone` |
| Webhooks | `webhooks.endpoints.*`, `webhooks.deliveries`, `Hapti.verifyWebhook` | `webhooks.endpoints.*`, `webhooks.deliveries`, `verify_webhook` |
| Events | `eventLog.list`, `eventLog.all`, `events` (live) | `webhooks.list_events`, `events` (live) |
| Batches and schedules | `batches.*`, `schedules.*` | `batches.*`, `schedules.*` |

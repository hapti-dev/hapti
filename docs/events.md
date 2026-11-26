# Events

> Read every Hapti event of the last 30 days through the API, the same events webhooks send. Use it to catch up, reconcile or poll.

Every event Hapti sends by webhook is also stored for 30 days, and can be read through the API even if you have no webhook at all. Use it to catch up after downtime, to reconcile, or when your server cannot receive webhooks.

```bash
curl "https://api.hapti.dev/v1/events?type=task.succeeded&since=2026-11-20" \
  -H "Authorization: Bearer $HAPTI_API_KEY"
```

```json
{
  "object": "list",
  "data": [
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
  ],
  "has_more": false,
  "next_cursor": null,
  "total": 1
}
```

| Parameter | What it does |
| --- | --- |
| `type` | One event type, or a family such as `task.*` |
| `object` | Only the events of this task or object id |
| `since` | Only the events from this date |
| `limit`, `cursor` | Paging, see [Pagination](pagination.md) |

An event is the same object as a webhook payload, with the same `id`, so you can mix both and handle each event once.

## Polling with events

When you cannot receive webhooks, poll `GET /v1/events` with the `created_at` of the last event you handled as `since`, every few seconds. Events come newest first, and each one has a stable `id`.

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

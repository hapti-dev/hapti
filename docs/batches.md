# Batches and schedules

> Source: [https://hapti.dev/docs/batches](https://hapti.dev/docs/batches). This copy is updated at each release.

> Run many Hapti tasks at once with a batch, or the same task again and again on a schedule, in the time zone of your choice.

## Batches

A batch runs many tasks at once and tracks them together. Give a list of `tasks`, or one `template` and a list of `items` that each change what differs.

```bash
curl https://api.hapti.dev/v1/batches \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: invoices-2026-11" \
  -d '{
    "name": "November invoices",
    "template": {"url": "https://billing.example.com", "goal": "Download the invoice of November and give its total."},
    "items": [{"user": "customer_42"}, {"user": "customer_43"}]
  }'
```

```json
{
  "id": "bat_419f5cef31f13f12",
  "object": "batch",
  "mode": "test",
  "name": "November invoices",
  "total": 2,
  "done": 0,
  "counts": {
    "queued": 2,
    "paused": 0,
    "running": 0,
    "waiting": 0,
    "succeeded": 0,
    "failed": 0,
    "blocked": 0,
    "incomplete": 0,
    "needs_person": 0,
    "cancelled": 0
  },
  "billed_cents": 0,
  "created_at": "2026-11-26T15:48:59.546Z",
  "finished_at": null,
  "cancelled": false
}
```

- `GET /v1/batches/{id}` gives the counts per status and what was billed.
- `GET /v1/batches/{id}/tasks` lists its tasks, with `status` to filter.
- `POST /v1/batches/{id}/cancel` cancels every task that is not over.
- A `batch.finished` event is sent when every task of the batch is over.

## Schedules

A schedule creates the same task on a cron expression or every interval, in a time zone.

```bash
curl https://api.hapti.dev/v1/schedules \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monday report",
    "cron": "0 8 * * 1",
    "timezone": "Europe/Lisbon",
    "task": {"url": "https://portal.example.com/reports", "goal": "Download the weekly report."}
  }'
```

```json
{
  "id": "sch_4b6ece82587fed34",
  "object": "schedule",
  "mode": "test",
  "name": "Monday report",
  "every": null,
  "cron": "0 8 * * 1",
  "timezone": "Europe/Lisbon",
  "paused": false,
  "next_run_at": "2026-11-30T08:00:00.000Z",
  "until": null,
  "runs": 0,
  "last_task": null,
  "last_run_at": null,
  "last_error": null,
  "task": {
    "url": "https://portal.example.com/reports",
    "goal": "Download the weekly report."
  },
  "created_at": "2026-11-26T15:48:59.559Z"
}
```

Pause or resume it with `PATCH /v1/schedules/{id}` and `{"paused": true}` or `false`. Each task it creates carries the `schedule` id, so you can follow them like any other task.

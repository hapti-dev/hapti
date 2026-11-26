# Idempotency

> Source: [https://hapti.dev/docs/idempotency](https://hapti.dev/docs/idempotency). This copy is updated at each release.

> Retry any Hapti POST request safely with an Idempotency-Key, so a dropped connection never creates a task or a charge twice.

A network can drop an answer after the server has acted. If you then retry a `POST /v1/tasks`, you could start the same task twice and pay twice. An idempotency key prevents it.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-4512" \
  -d '{"url": "https://shop.example.com", "goal": "Order item 4512"}'
```

## How it works

- **Same key, same request**, within 24 hours: you get the first answer again, status and body, and nothing is done twice. The answer carries `Idempotent-Replayed: true`.
- **Same key, another request**: refused with `409` and the reason `idempotency_conflict`.
- **Same key while the first request still runs**: refused with `409` and the reason `idempotency_in_progress`. Retry in a moment.
- **A request that failed** with an error frees its key, so you can fix it and retry with the same key.

Keys work on every `POST` under `/v1`: tasks, batches, schedules, retries, webhook endpoints. They are kept apart per organisation and per mode.

## Choosing a key

Use something unique to the work, from your own system: an order id, a claim id, or a random UUID you store with the job before calling Hapti. A key has 1 to 255 visible characters, without spaces.

The official libraries add a random key to every POST by themselves, so their automatic retries are always safe. Pass your own key to also be safe across restarts of your program.

:::tabs
```js JavaScript
await hapti.tasks.create(task, { idempotencyKey: `claim-${claim.id}` });
```
```python Python
hapti.tasks.create(task, idempotency_key=f"claim-{claim['id']}")
```
:::

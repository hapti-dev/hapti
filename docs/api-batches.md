# Batches API

> Source: [https://hapti.dev/docs/api-batches](https://hapti.dev/docs/api-batches). This copy is updated at each release.

> Reference of the Hapti batches endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Create a batch

```http
POST /v1/batches
```

Many tasks at once, from a list of tasks or from one template and a list of items.

| Parameter | In | Description |
| --- | --- | --- |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

| Field | Type | Description |
| --- | --- | --- |
| `name` | string |  |
| `webhook` | string |  |
| `tasks` | array |  |
| `template` | TaskInput |  |
| `items` | array |  |

```json Response 201
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

## List batches

```http
GET /v1/batches
```

Batches, newest first.

| Parameter | In | Description |
| --- | --- | --- |
| `limit` | query | Up to 100 |

## Get a batch

```http
GET /v1/batches/{id}
```

Counts per status and what was billed.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Batch id |

## List the tasks of a batch

```http
GET /v1/batches/{id}/tasks
```

Paged with after and next.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Batch id |
| `status` | query | Filter by status |
| `after` | query | next of the previous page |
| `limit` | query | Up to 200 |

## Cancel a batch

```http
POST /v1/batches/{id}/cancel
```

Cancels every task of the batch that is not over.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Batch id |

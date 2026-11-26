# Events API

> Reference of the Hapti events endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## List events

```http
GET /v1/events
```

Every event of the last 30 days, the same objects webhooks send.

| Parameter | In | Description |
| --- | --- | --- |
| `type` | query | An event type, or a family like task.* |
| `object` | query | Only the events of this task or object id |
| `since` | query | ISO date |
| `limit` | query | Up to 100 |
| `cursor` | query | next_cursor of the previous page |

```json Response 200
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

## Get an event

```http
GET /v1/events/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Event id |

## Follow every task live

```http
GET /v1/stream
```

Server-Sent Events: a task event each time a task of the mode changes state.

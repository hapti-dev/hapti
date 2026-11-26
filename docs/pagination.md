# Pagination

> Hapti lists are paged with a cursor. Read has_more and next_cursor to get every item, even while new ones arrive.

Lists come newest first, one page at a time.

```json
{
  "object": "list",
  "data": [
    {
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
  ],
  "has_more": false,
  "next_cursor": null,
  "total": 1
}
```

| Field | What it holds |
| --- | --- |
| `data` | The items of this page |
| `has_more` | `true` when there is another page |
| `next_cursor` | What to send as `cursor` to get the next page |
| `total` | How many items match, in all |

Send `limit`, from 1 to 100, to choose the size of a page. A cursor stays valid while new items arrive: you never see an item twice or miss one.

:::tabs
```js JavaScript
for await (const task of hapti.tasks.all({ status: ['succeeded'] })) {
  console.log(task.id);
}
```
```python Python
for task in hapti.tasks.all(status=["succeeded"]):
    print(task["id"])
```
```bash cURL
curl "https://api.hapti.dev/v1/tasks?limit=100&cursor=eyJ..." -H "Authorization: Bearer $HAPTI_API_KEY"
```
:::

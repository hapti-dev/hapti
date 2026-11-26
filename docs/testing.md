# Test your integration

> Mock tasks answer at once with the result you choose, so your tests and CI run in milliseconds, never reach a website and are never billed.

Hapti gives two ways to test, for two different needs.

| | Test key, no `mock` | Test key with `mock` |
| --- | --- | --- |
| The agent works on the website | Yes, in a real browser | No, nothing is opened |
| Data is submitted to the website | Never | Never |
| Time | Like a real task | Half a second by default |
| Billed | Each action that worked | Never, and no credit is needed |
| Use it for | Checking a goal works on the real website | Unit tests, CI, building your screens and webhook handlers |

## Mock a task

Add `mock` to any task created with a test key (`hp_test_`). A live key refuses it: a live task always runs for real.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://portal.example.com",
       "goal": "Download the latest invoice and give its total and due date",
       "output": {"type": "object", "properties": {"total": {"type": "number"}, "due": {"type": "string", "format": "date"}}},
       "mock": "succeeded"}'
```

The task goes through `queued` and `running`, ends `succeeded`, sends its webhooks and its live events like any task, and its `result.data` follows your `output` schema: `{"total": 42.5, "due": "2026-01-15"}`. The values come from `example`, `examples`, `default`, `enum` or `const` in your schema when it has them, so you choose what your tests receive. Every mock task has `"mock": true`.

## Choose the outcome

`mock` takes one of these values:

| Value | What the task does |
| --- | --- |
| `succeeded` | Succeeds with data shaped by `output` |
| `failed` | Fails with `reason` set to `site_unreachable` |
| `blocked` | Ends `blocked` with `blocked_by_site` |
| `incomplete` | Ends `incomplete` with `cannot_continue` |
| `needs_person` | Ends `needs_person` with `needs_person_action` |
| `question` | Waits with a question; [answer it](tasks.md#questions-and-approvals) and it succeeds |
| `approval` | Waits for an approval; approved it succeeds, refused it ends `incomplete` |
| `takeover` | Waits for the person to take over; [handed back](tasks.md#let-the-person-take-over) it succeeds, stopped it ends `needs_person` |

Or an object, to set the exact result:

```json
{ "mock": { "status": "succeeded", "data": { "total": 129.9, "due": "2026-02-01" }, "answer": "Invoice found", "delay_ms": 0 } }
```

`delay_ms` (0 to 30000, 500 by default) sets how long the task takes, to test a spinner or a timeout. `reason` sets the [reason](tasks.md#why-a-task-did-not-succeed) of a failure.

## What a mock task does not do

It opens no browser, so it has no screenshots and its proof is empty. It never learns a recipe and never touches the person's session, inbox or vault. Mock tasks are kept in the test mode with your other test tasks.

To fire mock events from the terminal and receive webhooks on your machine, see the [command line](cli.md).

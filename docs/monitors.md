# Monitors

> Watch a website on a schedule and receive only what changed, as a webhook, with the current value always readable like an API.

A monitor checks a website on a schedule with a task, compares each result with the previous one, and tells you **only what changed**: the new items, the removed ones, and the ones whose values moved. Your application no longer runs the task, keeps the last result or compares anything. And at any time it reads the current value of the website through the monitor, as if the website had an API.

Typical monitors: new flats on an estate agency site, prices of a competitor, appointment slots that open, the status of a file on an administration portal, stock of a product, job offers, results published on a portal.

## Create a monitor

A monitor takes the fields of a task (`url`, `goal`, `output`, `user`, `data`, `files`...) and a schedule:

```bash
curl https://api.hapti.dev/v1/monitors \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.agence-exemple.fr/locations",
       "goal": "List the flats to rent in Lyon under 900 euros with their title, price and address.",
       "output": {"type": "object", "properties": {"listings": {"type": "array", "items": {"type": "object",
                  "properties": {"title": {"type": "string"}, "price": {"type": "number"}, "url": {"type": "string"}}}}}},
       "key": "url",
       "every": "1h",
       "timezone": "Europe/Paris",
       "webhook": "https://your-app.example.com/hooks/hapti"}'
```

| Field | What it does |
| --- | --- |
| `every` or `cron` | How often: `30m`, `1h`, `1d`, or a cron rule such as `0 8 * * 1-5` in `timezone` |
| `output` | The shape of the result. When it holds a list, items are compared one by one |
| `key` | The field that names an item, such as `url` or `reference`; a dotted path such as `listing.id` works. Without it, an item is known by its whole content |
| `notify` | `changes` (default): an event only when something changed. `always`: also an event after every check |
| `webhook` | An address that receives this monitor's events, besides your [webhook endpoints](webhooks.md) |
| `run_now` | `true` by default: the first check runs at once and sets the starting value |

Always give an `output` schema: without one, the value is the agent's answer in words, whose wording can change from one check to the next and look like a change. The console builds the schema for you from the fields you name.

The first check runs at once. Its `monitor.changed` event has `first` set to `true` and lists every item in `added`, so your application starts from the same state.

## What you receive

```json
{
  "type": "monitor.changed",
  "data": {
    "monitor": "mon_3f2a91c07b4d5e18",
    "task": "tsk_9f2c41a07b3d5e18",
    "first": false,
    "added": [{ "title": "T3 Lyon 7", "price": 880, "url": "https://www.agence-exemple.fr/a2" }],
    "removed": [],
    "changed": [{ "key": "https://www.agence-exemple.fr/a1", "before": { "price": 890 }, "after": { "price": 850 } }],
    "value": { "listings": [ ... ] },
    "checked_at": "2026-11-23T15:00:12.000Z"
  }
}
```

`before` and `after` hold the whole item; the example is cut. When the result is not a list, `changed` holds the previous and the new value. When nothing changed, nothing is sent.

## Read the current value

`GET /v1/monitors/{id}/latest` gives the last value read on the website, when it was read and when it last changed. `GET /v1/monitors/{id}/changes` gives the history of the changes, newest first.

## When a check fails

A check that does not succeed (the website is down, it blocks the browser) keeps the last good value, writes the reason in `last_error`, and sends no `monitor.changed`. Like any task, a check pays for the actions that worked. See [Why a task did not succeed](tasks.md#why-a-task-did-not-succeed).

## Pause, change, delete

`PATCH /v1/monitors/{id}` with `paused`, `notify`, `webhook` or `name`. `DELETE` stops the monitor and deletes its values and history.

## Cost

Each check is a task, billed per action that worked, at the usual [price](pricing.md). A monitor that runs every hour makes about 720 checks a month: choose the interval your use needs. A check that the same recipe replays goes faster.

# Monitors API

> Reference of the Hapti monitors endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Create a monitor

```http
POST /v1/monitors
```

Checks a website on a schedule with a task, compares each result with the previous one and sends monitor.changed only when something was added, removed or changed. Takes the fields of a task (url, goal, output, user, data, files...) plus every or cron.

| Parameter | In | Description |
| --- | --- | --- |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

| Field | Type | Description |
| --- | --- | --- |
| `url` (required) | string |  |
| `goal` (required) | string |  |
| `output` | object | A JSON Schema for the result. When it holds a list, items are compared one by one. |
| `key` | string | The field that names an item of the list, like url or reference; a dotted path works. Without it an item is known by its content. |
| `every` | string |  |
| `cron` | string |  |
| `timezone` | string |  |
| `notify` | string: `changes`, `always` | changes (default): monitor.changed only. always: also monitor.checked after every check. |
| `webhook` | string | An https address that receives this monitor's events, besides your webhook endpoints |
| `name` | string |  |
| `run_now` | boolean | true by default: the first check runs at once and sets the starting value |

```json Request
{
  "url": "https://www.agence-exemple.fr/locations",
  "goal": "List the flats to rent in Lyon under 900 euros with their title, price and address",
  "output": {
    "type": "object",
    "properties": {
      "listings": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "price": {
              "type": "number"
            },
            "url": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "key": "url",
  "every": "1h",
  "timezone": "Europe/Paris"
}
```

## List monitors

```http
GET /v1/monitors
```

Every monitor of the organisation.

## Get a monitor

```http
GET /v1/monitors/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Monitor id |

## Pause, resume or change a monitor

```http
PATCH /v1/monitors/{id}
```

Send paused, notify, webhook or name.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Monitor id |

| Field | Type | Description |
| --- | --- | --- |
| `paused` | boolean |  |
| `notify` | string: `changes`, `always` |  |
| `webhook` | string or null |  |
| `name` | string |  |

## Delete a monitor

```http
DELETE /v1/monitors/{id}
```

Stops it and deletes its values and history.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Monitor id |

## Read the current value

```http
GET /v1/monitors/{id}/latest
```

The last value the monitor read on the website, as an API: the website has none, the monitor gives one.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Monitor id |

## List the changes

```http
GET /v1/monitors/{id}/changes
```

What was added, removed or changed at each check that found a change, newest first.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Monitor id |

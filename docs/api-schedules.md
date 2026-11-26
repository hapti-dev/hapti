# Schedules API

> Source: [https://hapti.dev/docs/api-schedules](https://hapti.dev/docs/api-schedules). This copy is updated at each release.

> Reference of the Hapti schedules endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Create a schedule

```http
POST /v1/schedules
```

Runs the same task on a cron or every interval, in a time zone.

| Parameter | In | Description |
| --- | --- | --- |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

| Field | Type | Description |
| --- | --- | --- |
| `task` (required) | TaskInput |  |
| `cron` | string |  |
| `every` | string |  |
| `timezone` | string |  |
| `name` | string |  |
| `start_at` | string |  |
| `until` | string |  |
| `run_now` | boolean |  |

```json Response 201
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

## List schedules

```http
GET /v1/schedules
```

Every schedule of the mode.

## Get a schedule

```http
GET /v1/schedules/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Schedule id |

## Pause or resume a schedule

```http
PATCH /v1/schedules/{id}
```

Send paused true or false.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Schedule id |

| Field | Type | Description |
| --- | --- | --- |
| `paused` | boolean |  |

## Delete a schedule

```http
DELETE /v1/schedules/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Schedule id |

## List the tasks of a schedule

```http
GET /v1/schedules/{id}/tasks
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Schedule id |

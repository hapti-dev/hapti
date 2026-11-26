# Webhooks API

> Source: [https://hapti.dev/docs/api-webhooks](https://hapti.dev/docs/api-webhooks). This copy is updated at each release.

> Reference of the Hapti webhooks endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Create an endpoint

```http
POST /v1/webhooks/endpoints
```

An https address that receives the events you choose, signed with its own secret. The secret is returned once here.

| Parameter | In | Description |
| --- | --- | --- |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

| Field | Type | Description |
| --- | --- | --- |
| `url` | string |  |
| `events` | array | Event types, a family like user.*, or ["*"] for every event, including future ones. |
| `description` | string |  |
| `headers` | object | Up to 10 headers sent with each delivery. |
| `enabled` | boolean |  |

```json Response 201
{
  "id": "we_14d949df05553008",
  "object": "webhook_endpoint",
  "url": "https://api.example.com/hooks/hapti",
  "events": [
    "task.succeeded",
    "task.failed",
    "task.waiting"
  ],
  "description": "Production",
  "enabled": true,
  "disabled_reason": null,
  "disabled_at": null,
  "failing_since": null,
  "last_success_at": null,
  "headers": {},
  "mode": "test",
  "secret": "whsec_0f9c3a…",
  "previous_secret_expires_at": null,
  "created_at": "2026-11-26T15:48:59.564Z"
}
```

## List endpoints

```http
GET /v1/webhooks/endpoints
```

With their deliveries and failures of the last 7 days.

## Get an endpoint

```http
GET /v1/webhooks/endpoints/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

## Update an endpoint

```http
PATCH /v1/webhooks/endpoints/{id}
```

Address, events, description, headers, or enabled to pause and resume.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

| Field | Type | Description |
| --- | --- | --- |
| `url` | string |  |
| `events` | array | Event types, a family like user.*, or ["*"] for every event, including future ones. |
| `description` | string |  |
| `headers` | object | Up to 10 headers sent with each delivery. |
| `enabled` | boolean |  |

## Delete an endpoint

```http
DELETE /v1/webhooks/endpoints/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

## Reveal the secret

```http
GET /v1/webhooks/endpoints/{id}/secret
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

## Roll the secret

```http
POST /v1/webhooks/endpoints/{id}/roll-secret
```

A new secret; the previous one stays valid for expires_in_hours (24 by default, 0 to 168) and each delivery carries both signatures meanwhile.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

| Field | Type | Description |
| --- | --- | --- |
| `expires_in_hours` | integer |  |

## Send a test event

```http
POST /v1/webhooks/endpoints/{id}/test
```

Sends a signed ping event now and returns the delivery with the answer of your server.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

## Send missed events again

```http
POST /v1/webhooks/endpoints/{id}/recover
```

Sends once every event of the period that never reached this endpoint.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Webhook endpoint id |

| Field | Type | Description |
| --- | --- | --- |
| `since` | string | 3 days ago by default, at most 30 |

## Reveal the organisation secret

```http
GET /v1/webhook/secret
```

The secret that signs the deliveries of webhooks given on a task or a batch with the webhook field.

## List event types

```http
GET /v1/webhooks/events
```

## List deliveries

```http
GET /v1/webhooks/deliveries
```

| Parameter | In | Description |
| --- | --- | --- |
| `endpoint` | query | Endpoint id |
| `event` | query | Event type |
| `state` | query | pending, delivered or failed |
| `limit` | query | Up to 100 |
| `cursor` | query | next_cursor of the previous page |

## Get a delivery

```http
GET /v1/webhooks/deliveries/{id}
```

With every attempt, the answer of your server and the body sent.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Delivery id |

## Send a delivery again

```http
POST /v1/webhooks/deliveries/{id}/resend
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Delivery id |

# Errors

> How the Hapti API reports errors. HTTP status codes, error types, stable reason codes and what to do about each of them.

Errors come with an HTTP status and a JSON body that says what went wrong in plain words.

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": 400,
    "message": "url: an http or https address is required, or device for a task on a computer"
  }
}
```

| Field | What it holds |
| --- | --- |
| `error.type` | The family of the error, from the status |
| `error.code` | The HTTP status |
| `error.message` | What went wrong and how to fix it, for a developer |
| `error.reason` | A stable code for some errors, to test in your code |

## Status codes

| Status | Type | Meaning | Retry |
| --- | --- | --- | --- |
| `400` | `invalid_request_error` | A field is missing or wrong: read the message | No, fix the request |
| `401` | `authentication_error` | The key is missing, wrong or revoked | No |
| `402` | `billing_error` | Not enough credit, and the task was set to refuse rather than wait | After adding credit |
| `403` | `permission_error` | The key or the person may not do this | No |
| `404` | `not_found_error` | No such object in this organisation and mode | No |
| `409` | `conflict_error` | The object is not in a state that allows it, or an idempotency key is in use | Depends on the reason |
| `429` | `rate_limit_error` | Too many requests: wait for the `Retry-After` header | Yes, after the wait |
| `500` | `api_error` | An error on our side | Yes, with an idempotency key |
| `502` | `engine_error` | The browser could not be reached | Yes, with an idempotency key |
| `503` | `unavailable_error` | A service is not available for a moment | Yes |

## Reason codes

| Reason | Status | What to do |
| --- | --- | --- |
| `insufficient_credit` | 402 | Add credit, or let tasks wait with `on_insufficient_credit: "pause"` |
| `user_limit_reached` | 429 | The person reached a limit you set: see [limits per person](users.md#limits-per-person) |
| `idempotency_conflict` | 409 | The same idempotency key was used with another request: use a new key |
| `idempotency_in_progress` | 409 | A request with this key is still running: retry in a moment |
| `idempotency_key_invalid` | 400 | Use 1 to 255 visible characters, without spaces |
| `version_unknown` | 400 | `Hapti-Version` is not a known version: see [Versioning](versioning.md) |
| `live_only` | 402 | This needs a live key, for example a phone number |
| `already_disputed` | 409 | This task already has a dispute |

## Request ids

Every answer carries a `Request-Id` header. Give it to support, or find the request with its body in **Developers, Requests** in the console.

## Retrying safely

Retry `429` and `5xx` answers with a growing wait. Send an [idempotency key](idempotency.md) with every POST, so that a retry never does the work twice. The official libraries do both for you.

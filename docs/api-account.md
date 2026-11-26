# Account API

> Reference of the Hapti account endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Who am I

```http
GET /v1/me
```

The organisation and mode of the key.

## Credit and prices

```http
GET /v1/billing
```

The credit left and the prices.

## Usage by day

```http
GET /v1/usage
```

| Parameter | In | Description |
| --- | --- | --- |
| `from` | query | YYYY-MM-DD |
| `to` | query | YYYY-MM-DD |

## Usage by person

```http
GET /v1/usage/users
```

| Parameter | In | Description |
| --- | --- | --- |
| `from` | query | YYYY-MM-DD |
| `to` | query | YYYY-MM-DD |

## API versions

```http
GET /v1/versions
```

Every version and what it changed, with the one your organisation is pinned to.

```json Response 200
{
  "object": "list",
  "latest": "2026-11-22",
  "pinned": "2026-11-22",
  "current": "2026-11-22",
  "data": [
    {
      "id": "2026-11-22",
      "changes": [
        "A live task without enough credit is created paused and starts by itself once credit is added (on_insufficient_credit: refuse keeps the 402).",
        "Lists are paged with has_more, next_cursor and total.",
        "price_cents is what was billed, 0 until a live task succeeds; starting_price_cents gives the starting price."
      ]
    },
    {
      "id": "2026-11-01",
      "changes": [
        "A live task without enough credit is refused with 402 insufficient_credit."
      ]
    }
  ]
}
```

## List API requests

```http
GET /v1/logs
```

Every request made with a key of the mode in the last 30 days, secrets masked.

| Parameter | In | Description |
| --- | --- | --- |
| `status` | query | ok or error |
| `q` | query | Path or Request-Id |
| `limit` | query | Up to 100 |
| `cursor` | query | next_cursor of the previous page |

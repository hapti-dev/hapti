# Recipes API

> Source: [https://hapti.dev/docs/api-recipes](https://hapti.dev/docs/api-recipes). This copy is updated at each release.

> Reference of the Hapti recipes endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## List recipes

```http
GET /v1/recipes
```

Tasks learnt from successes and replayed faster and cheaper.

## Get a recipe

```http
GET /v1/recipes/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Recipe id |

## Rename a recipe

```http
PATCH /v1/recipes/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Recipe id |

| Field | Type | Description |
| --- | --- | --- |
| `name` | string |  |

## Delete a recipe

```http
DELETE /v1/recipes/{id}
```

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Recipe id |

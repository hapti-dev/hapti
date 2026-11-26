# Catalogue API

> Reference of the Hapti catalogue endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## List templates

```http
GET /v1/catalogue
```

Ready-made tasks: give a template id and its params instead of a url and a goal.

| Parameter | In | Description |
| --- | --- | --- |
| `lang` | query | en or fr |

```json Response 200
{
  "object": "list",
  "data": [
    {
      "id": "prendre_rdv",
      "group": "demarches",
      "name": "Book an appointment",
      "description": "On a booking site (prefecture, town hall, doctor…), books the first slot that fits.",
      "params": {
        "site": "address of the booking page",
        "reason": "reason for the appointment",
        "window": "preferred dates and times (optional)"
      }
    }
  ]
}
```

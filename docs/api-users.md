# Users API

> Source: [https://hapti.dev/docs/api-users](https://hapti.dev/docs/api-users). This copy is updated at each release.

> Reference of the Hapti users endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Create a person

```http
POST /v1/users
```

Registers a person you act for, with their country, language and time zone. Tasks with the same user share one device, one session and one memory.

| Field | Type | Description |
| --- | --- | --- |
| `id` (required) | string |  |
| `name` | string |  |
| `country` | string |  |
| `locale` | string |  |
| `timezone` | string |  |
| `mandate` | Mandate |  |

```json Response 201
{
  "object": "user",
  "id": "customer_42",
  "name": "Ana Silva",
  "created_at": "2026-11-26T15:48:59.498Z",
  "mandate": null,
  "session": null,
  "profile": null,
  "device": {
    "locale": "pt-PT",
    "timezone": "Europe/Lisbon",
    "country": "pt",
    "country_set": true,
    "since": "2026-11-26T15:48:59.500Z"
  },
  "limits": null,
  "accounts": []
}
```

## List people

```http
GET /v1/users
```

| Parameter | In | Description |
| --- | --- | --- |
| `limit` | query | Up to 100 |
| `q` | query | Search |
| `cursor` | query | next_cursor of the previous page |

## Get a person

```http
GET /v1/users/{user}
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Update a person

```http
PATCH /v1/users/{user}
```

Name, country, language, time zone and limits.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

| Field | Type | Description |
| --- | --- | --- |
| `name` | string |  |
| `country` | string |  |
| `locale` | string |  |
| `timezone` | string |  |
| `limits` | object |  |

## Forget a person

```http
DELETE /v1/users/{user}
```

Erases the person: session, memory, stored accounts, mandate, inbox and received messages.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Give a mandate

```http
POST /v1/users/{user}/mandate
```

Records what the agent may do for the person without asking each time, and who agreed to it.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

| Field | Type | Description |
| --- | --- | --- |
| `scope` (required) | string | What the agent may do for the person. |
| `given_by` (required) | string | Who gave it, or how the person agreed. |
| `sites` | array |  |
| `until` | string |  |

```json Response 200
{
  "mandate": {
    "scope": "Declare insurance claims and download invoices",
    "sites": [],
    "given_by": "Ana Silva, in the app on 2026-11-20",
    "until": null,
    "given_at": "2026-11-26T15:48:59.571Z"
  }
}
```

## Revoke the mandate

```http
DELETE /v1/users/{user}/mandate
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## List stored accounts

```http
GET /v1/users/{user}/accounts
```

Accounts the agent may sign in with for this person. Secrets are never returned.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Store an account

```http
PUT /v1/users/{user}/accounts/{account}
```

Saves sign-in details in the vault, sealed. The agent types them in the browser; the model never sees them.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |
| `account` | path |  |

| Field | Type | Description |
| --- | --- | --- |
| `origin` (required) | string |  |
| `username` | string |  |
| `password` (required) | string |  |
| `totp_secret` | string |  |

```json Response 200
{
  "account": "insurer",
  "label": "insurer",
  "origin": "https://portal.example.com",
  "has_username": true,
  "has_totp": false,
  "entered_by": "developer",
  "updated_at": "2026-11-26T15:48:59.573Z"
}
```

## Delete an account

```http
DELETE /v1/users/{user}/accounts/{account}
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |
| `account` | path |  |

## Read back a stored account

```http
POST /v1/users/{user}/accounts/{account}/reveal
```

Returns the username and password you stored, for example to show the person a password created for them. Each read is recorded in the history of the person. An account the person entered through a connect link is never shown (403).

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |
| `account` | path |  |

| Field | Type | Description |
| --- | --- | --- |
| `by` (required) | string | Who reads it and why, kept in the history |

## Create a connect link

```http
POST /v1/users/{user}/connect
```

A page where the person enters their own sign-in details. You never see them.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

| Field | Type | Description |
| --- | --- | --- |
| `accounts` | array |  |
| `brand` | string |  |
| `return_url` | string |  |
| `expires_in` | integer |  |

## Revoke connect links

```http
DELETE /v1/users/{user}/connect
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Read the memory

```http
GET /v1/users/{user}/memory
```

Lasting facts the agent kept about the person, never secrets.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Add a fact

```http
POST /v1/users/{user}/memory
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

| Field | Type | Description |
| --- | --- | --- |
| `fact` (required) | string |  |

## Erase the memory

```http
DELETE /v1/users/{user}/memory
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Open an email inbox

```http
POST /v1/users/{user}/inbox
```

An address that receives the emails sites send to the person, such as confirmation codes, which the agent reads by itself.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

| Field | Type | Description |
| --- | --- | --- |
| `username` | string |  |
| `domain` | string |  |
| `client_id` | string |  |

## List inboxes

```http
GET /v1/users/{user}/inbox
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## List received emails

```http
GET /v1/users/{user}/emails
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |
| `since` | query | ISO date |
| `limit` | query | Up to 100 |

## Give a phone number

```http
POST /v1/users/{user}/phone
```

A real number that receives the texts sites send. Live keys only, paid monthly from the credit.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

| Field | Type | Description |
| --- | --- | --- |
| `country` | string |  |

## Get the phone number

```http
GET /v1/users/{user}/phone
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Release the phone number

```http
DELETE /v1/users/{user}/phone
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## List received texts

```http
GET /v1/users/{user}/sms
```

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |

## Usage of a person

```http
GET /v1/users/{user}/usage
```

Tasks and amounts billed for this person.

| Parameter | In | Description |
| --- | --- | --- |
| `user` | path | Your own id for the person, like customer_42 |
| `from` | query | YYYY-MM-DD |
| `to` | query | YYYY-MM-DD |

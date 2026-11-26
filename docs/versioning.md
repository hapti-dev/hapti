# Versioning

> Hapti API versions are dated. Your organisation is pinned to one, so a change never breaks your app until you choose to upgrade.

Hapti versions its API with dates. When a change could break an existing app, it comes with a new version. Your organisation is pinned to the version of the day it was created, and keeps its behaviour until you choose to move.

Every answer says which version it used:

```http
Hapti-Version: 2026-11-22
```

## Try another version

Send the header on a request to use another version for that request only. This is how you test an upgrade before you switch.

```bash
curl https://api.hapti.dev/v1/tasks -H "Authorization: Bearer $HAPTI_API_KEY" -H "Hapti-Version: 2026-11-22"
```

An unknown version is refused with `400` and the reason `version_unknown`.

## Upgrade

Change the version of your organisation in the console, under **Developers, Configuration**. [`GET /v1/versions`](api-account.md#api-versions) lists every version, what it changed, and the one you are pinned to. Webhook events carry the `api_version` they were made with.

## Versions

| Version | Changes |
| --- | --- |
| `2026-11-22` | A live task without enough credit is created paused and starts by itself once credit is added (on_insufficient_credit: refuse keeps the 402). Lists are paged with has_more, next_cursor and total. price_cents is what was billed, 0 until a live task succeeds; starting_price_cents gives the starting price. |
| `2026-11-01` | A live task without enough credit is refused with 402 insufficient_credit. |

Adding a field to an answer, a new endpoint or a new event type is not a breaking change: your code should ignore fields it does not know.

# Rate limits

> Source: [https://hapti.dev/docs/limits](https://hapti.dev/docs/limits). This copy is updated at each release.

> How many requests and new tasks the Hapti API accepts per minute, and how to handle a 429 answer with its Retry-After header.

Each organisation and mode has its own limits:

| What | Limit |
| --- | --- |
| Requests | 600 per minute |
| New tasks | 60 per minute |

Over a limit, the answer is `429` with a `Retry-After` header that says how many seconds to wait. The official libraries wait and retry by themselves.

To start many tasks at once, use a [batch](batches.md): one request creates them all. If you need higher limits, write to contact@hapti.dev.

You can also set limits for each person you act for, so one end user cannot use more than you allow: see [limits per person](users.md#limits-per-person).

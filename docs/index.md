# Introduction

> Source: [https://hapti.dev/docs/](https://hapti.dev/docs/). This copy is updated at each release.

> Hapti is an API that does tasks on websites that have no API. An agent uses a real browser by sight and returns the result with proof.

Hapti does the work that software cannot reach through an API. You send a website and a goal in plain words. An agent opens a real browser, looks at the screen, clicks and types like a person, and sends back the result with every step it took as proof.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://portal.example.com/claims",
       "goal": "Declare the water damage claim and give me the claim number.",
       "data": {"contract": "AX-4471", "date": "2026-11-20"}}'
```

## When to use Hapti

Use Hapti when a job has to be done on a website and that website has no API, or an API that does not cover the job. Typical tasks:

- Book an appointment on a booking site, a town hall or a clinic.
- Fill in and submit an online form, up to the confirmation page.
- Download invoices, statements or certificates from a customer area.
- Declare a claim, cancel a contract, update contact details.
- Check the status of a file on a public administration portal.
- Publish a listing or ask for a quote on a site without integration.

When a proper API exists for the job, use that API: it will be faster and cheaper. Hapti is for everything else.

## How it works

1. **You create a task** with a starting address, a goal and the data the agent may use.
2. **An agent does it** in a real browser, by sight. It never invents a value: when one is missing, the task waits with a question that you or the person answer.
3. **You get the result** by webhook, by the live stream or by asking for the task: an answer, structured data if you asked for a schema, downloaded files, and the proof.
4. **You pay for the work done.** Each action of the agent that worked is billed, whatever the outcome; an action that fails costs nothing, in test as in live.

## What makes it reliable for production

- **People, not sessions.** Tasks for the same person share one device, one session, one memory, an email inbox and a vault of sign-in details the model never sees. See [Users and identity](users.md).
- **Structured results.** Give a JSON Schema in `output` and the result follows it, checked. See [Tasks](tasks.md).
- **Built for integration.** Idempotency keys, versioned API, signed webhooks with retries, live streaming, cursor pagination and request logs.
- **Built for agents.** A remote MCP server, an OpenAPI specification and plain Markdown docs. See [Build with AI agents](agents.md).

## Next steps

- [Quickstart](quickstart.md): your first task in five minutes.
- [Build with AI agents](agents.md): connect Claude Code, Cursor or any MCP client.
- [Tasks API](api-tasks.md): every field and response.

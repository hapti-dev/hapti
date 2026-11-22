# Hapti

**Hapti does tasks on websites that have no API.** You send a website and a goal in plain words. An agent opens a real browser, looks at the screen, clicks and types like a person, and sends back the result with every step as proof. You pay only when a task succeeds, and test mode is free.

[Documentation](https://hapti.dev/docs/) · [Quickstart](https://hapti.dev/docs/quickstart) · [API reference](https://hapti.dev/docs/api-tasks) · [For AI agents](https://hapti.dev/docs/agents) · [llms.txt](https://hapti.dev/llms.txt) · [OpenAPI](https://hapti.dev/openapi.json)

## When to use Hapti

Use Hapti when a job has to be done on a website and that website has no API, or an API that does not cover the job:

- book an appointment on a booking site, a town hall or a clinic;
- fill in and submit an online form, up to the confirmation page;
- download invoices, statements or certificates from a customer area;
- declare a claim, cancel a contract, update contact details;
- check the status of a file on an administration portal.

When a proper API exists for the job, use that API instead.

## Install

```bash
npm install hapti-sdk     # JavaScript and TypeScript
pip install hapti         # Python
```

## Run a task

```js
import Hapti from 'hapti-sdk';

const hapti = new Hapti(process.env.HAPTI_API_KEY);
const task = await hapti.tasks.run(
  {
    url: 'https://portal.example.com/claims',
    goal: 'Declare the water damage claim and give me the claim number.',
    data: { contract: 'AX-4471', date: '2026-11-20' },
    user: 'customer_42',
    output: { type: 'object', properties: { claim_number: { type: 'string' } }, required: ['claim_number'] },
  },
  { onWaiting: (pending) => askTheCustomer(pending.text) },
);
console.log(task.result.data.claim_number);
```

```python
from hapti import Hapti

hapti = Hapti()  # reads HAPTI_API_KEY
task = hapti.tasks.run(
    {"url": "https://portal.example.com/claims",
     "goal": "Declare the water damage claim and give me the claim number.",
     "data": {"contract": "AX-4471", "date": "2026-11-20"},
     "user": "customer_42"},
    on_waiting=lambda pending, task: ask_the_customer(pending["text"]),
)
print(task["result"]["answer"])
```

The agent never invents a value. When something is missing, such as a code received by text message, the task waits with a question that you or the person answer. Get a free test key at [app.hapti.dev](https://app.hapti.dev).

## Use it from an AI agent (MCP)

Hapti is a remote MCP server at `https://api.hapti.dev/mcp`, listed in the official MCP registry as `dev.hapti/hapti`.

```bash
claude mcp add --transport http hapti https://api.hapti.dev/mcp \
  --header "Authorization: Bearer hp_test_..."
```

```json
{
  "mcpServers": {
    "hapti": {
      "url": "https://api.hapti.dev/mcp",
      "headers": { "Authorization": "Bearer hp_test_..." }
    }
  }
}
```

Tools: `start_task`, `get_task`, `answer_task`, `approve_task`, `cancel_task`, `estimate_task`, `list_templates`, `list_tasks`, `list_recipes`, `get_balance`. See [Build with AI agents](https://hapti.dev/docs/agents).

## What you get

- **People, not sessions**: tasks for the same `user` share one device, one session, one memory, an email inbox and a vault of sign-in details the model never sees.
- **Structured results**: give a JSON Schema in `output` and the result follows it, or the task is not billed.
- **Built for production**: idempotency keys, a dated API version, signed webhooks retried for three days, live streaming with Server-Sent Events, cursor pagination and request logs.
- **Proof**: every step and screenshot, kept 90 days.

## This repository

| Folder | What it holds |
| --- | --- |
| [`js/`](js) | The JavaScript and TypeScript library, published as [`hapti-sdk`](https://www.npmjs.com/package/hapti-sdk) |
| [`python/`](python) | The Python library, published as [`hapti`](https://pypi.org/project/hapti/) |
| [`examples/`](examples) | Small programs: a first task, a webhook receiver |
| [`server.json`](server.json) | The MCP registry entry |

## License

MIT

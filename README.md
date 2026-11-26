# Hapti

[![mcptry](https://mcptry.com/badge/dev.hapti/hapti)](https://mcptry.com/servers/dev.hapti/hapti) [![Hapti MCP connector](https://glama.ai/mcp/connectors/dev.hapti/hapti/badges/score.svg)](https://glama.ai/mcp/connectors/dev.hapti/hapti)

**Hapti does tasks on websites that have no API.** You send a website and a goal in plain words. An agent opens a real browser, looks at the screen, clicks and types like a person, and sends back the result with every step as proof. You pay only for the actions of the agent that worked, $0.01 each, in test mode as in live mode; an action that fails costs nothing.

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

The agent never invents a value. When something is missing, such as a code received by text message, the task waits with a question that you or the person answer. Create a test key at [app.hapti.dev](https://app.hapti.dev).

## Use it from an AI agent (MCP)

Hapti is a remote MCP server at `https://api.hapti.dev/mcp`, listed in the official MCP registry as `dev.hapti/hapti`.

[![Add to Cursor](https://img.shields.io/badge/Add_to-Cursor-111111?style=for-the-badge)](https://cursor.com/install-mcp?name=hapti&config=eyJ1cmwiOiJodHRwczovL2FwaS5oYXB0aS5kZXYvbWNwIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIGhwX3Rlc3RfWU9VUl9LRVkifX0%3D) [![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=for-the-badge)](https://vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522hapti%2522%252C%2522type%2522%253A%2522http%2522%252C%2522url%2522%253A%2522https%253A%252F%252Fapi.hapti.dev%252Fmcp%2522%252C%2522headers%2522%253A%257B%2522Authorization%2522%253A%2522Bearer%2520hp_test_YOUR_KEY%2522%257D%257D)

Replace `hp_test_YOUR_KEY` with your key once the editor opens, or create a key in the [console](https://app.hapti.dev) and use its install buttons, which fill it in for you.

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

## Use it from n8n and agent frameworks

- **n8n**: install the community node [`n8n-nodes-hapti`](https://www.npmjs.com/package/n8n-nodes-hapti) ([source](https://github.com/hapti-dev/n8n-nodes-hapti)) from Settings, Community Nodes. See [Hapti for n8n](https://hapti.dev/docs/n8n).
- **LangChain, OpenAI Agents SDK, CrewAI, Vercel AI SDK**: connect to the MCP server above in a few lines. See [Agent frameworks](https://hapti.dev/docs/frameworks).

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

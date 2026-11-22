# Installing the Hapti MCP server

Hapti is a remote MCP server. There is nothing to clone, build or run locally: the client connects to a hosted address over Streamable HTTP.

- Address: `https://api.hapti.dev/mcp`
- Transport: Streamable HTTP
- Authentication: OAuth (the client opens a Hapti sign-in page), or an API key sent as `Authorization: Bearer hp_test_...`

## Steps for an agent setting it up

1. Ask the user for a Hapti API key, unless the client supports MCP OAuth. A test key starts with `hp_test_` and is free; the user creates one at https://app.hapti.dev under Developers. Never invent a key and never use a key that starts with `hp_live_` unless the user asks for real, billed tasks.
2. Add this server to the client MCP configuration, keeping the key exactly as given:

```json
{
  "mcpServers": {
    "hapti": {
      "type": "streamableHttp",
      "url": "https://api.hapti.dev/mcp",
      "headers": { "Authorization": "Bearer hp_test_..." }
    }
  }
}
```

Some clients name the type `http` or `streamable-http`, or take only `url` and `headers`: use the form your client expects.

3. Check the connection by listing the tools. You should see `start_task`, `get_task`, `answer_task`, `approve_task`, `cancel_task`, `estimate_task`, `list_templates`, `list_tasks`, `list_recipes` and `get_balance`.
4. Try it: call `start_task` with `url` set to `https://en.wikipedia.org` and `goal` set to `Find the year Ada Lovelace was born.`, then call `get_task` with `wait_seconds` until the task is over.

## Using it well

- Hapti is for tasks on websites that have no API: forms, bookings, customer areas, administration portals.
- Put the facts the task needs in `data`. The agent never invents a value: when it needs one, the task waits with a question. Relay it to the user and answer with `answer_task`.
- Test keys are free and nothing is submitted for real. Live tasks are billed only when they succeed.

Documentation: https://hapti.dev/docs/agents

# Agent frameworks

> Give an agent built with LangChain, the OpenAI Agents SDK, CrewAI or the Vercel AI SDK the Hapti tools, through the MCP server, in a few lines.

An agent you build with a framework gets the Hapti tools from the remote MCP server at `https://api.hapti.dev/mcp`. The framework lists the tools (`start_task`, `get_task`, `answer_task` and the others), and the model calls them like any other tool. Each example below was run against Hapti: it lists the tools and calls one.

Every example reads your key from `HAPTI_API_KEY`. A test key starts with `hp_test_`, see [Authentication](authentication.md).

## LangChain and LangGraph

Install the MCP adapters:

```bash
pip install langchain-mcp-adapters
```

```python
import asyncio, os
from langchain_mcp_adapters.client import MultiServerMCPClient

async def main():
    client = MultiServerMCPClient({
        "hapti": {
            "transport": "streamable_http",
            "url": "https://api.hapti.dev/mcp",
            "headers": {"Authorization": f"Bearer {os.environ['HAPTI_API_KEY']}"},
        }
    })
    tools = await client.get_tools()
    # give `tools` to your agent, for example create_react_agent(model, tools)

asyncio.run(main())
```

## OpenAI Agents SDK

Python:

```bash
pip install openai-agents
```

```python
import asyncio, os
from agents import Agent, Runner
from agents.mcp import MCPServerStreamableHttp

async def main():
    async with MCPServerStreamableHttp(
        name="Hapti",
        params={
            "url": "https://api.hapti.dev/mcp",
            "headers": {"Authorization": f"Bearer {os.environ['HAPTI_API_KEY']}"},
            "timeout": 60,
        },
    ) as hapti:
        agent = Agent(
            name="Assistant",
            instructions="Use Hapti to do tasks on websites that have no API.",
            mcp_servers=[hapti],
        )
        result = await Runner.run(agent, "Find the opening hours of the Lyon 3 town hall on lyon.fr")
        print(result.final_output)

asyncio.run(main())
```

JavaScript:

```bash
npm install @openai/agents zod
```

```javascript
import { Agent, MCPServerStreamableHttp, run } from '@openai/agents';

const hapti = new MCPServerStreamableHttp({
  name: 'Hapti',
  url: 'https://api.hapti.dev/mcp',
  requestInit: { headers: { Authorization: `Bearer ${process.env.HAPTI_API_KEY}` } },
});
await hapti.connect();
const agent = new Agent({
  name: 'Assistant',
  instructions: 'Use Hapti to do tasks on websites that have no API.',
  mcpServers: [hapti],
});
const result = await run(agent, 'Find the opening hours of the Lyon 3 town hall on lyon.fr');
console.log(result.finalOutput);
await hapti.close();
```

## CrewAI

The MCP adapter needs the `mcp` extra:

```bash
pip install "crewai-tools[mcp]"
```

```python
import os
from crewai import Agent
from crewai_tools import MCPServerAdapter

params = {
    "url": "https://api.hapti.dev/mcp",
    "transport": "streamable-http",
    "headers": {"Authorization": f"Bearer {os.environ['HAPTI_API_KEY']}"},
}

with MCPServerAdapter(params) as tools:
    agent = Agent(
        role="Web operator",
        goal="Do tasks on websites that have no API",
        backstory="You use Hapti to act on websites for people.",
        tools=tools,
    )
```

## Vercel AI SDK

```bash
npm install ai @ai-sdk/mcp
```

```javascript
import { createMCPClient } from '@ai-sdk/mcp';
import { generateText, stepCountIs } from 'ai';

const hapti = await createMCPClient({
  transport: {
    type: 'http',
    url: 'https://api.hapti.dev/mcp',
    headers: { Authorization: `Bearer ${process.env.HAPTI_API_KEY}` },
  },
});
const tools = await hapti.tools();
const { text } = await generateText({
  model: yourModel, // any AI SDK model
  tools,
  stopWhen: stepCountIs(10),
  prompt: 'Find the opening hours of the Lyon 3 town hall on lyon.fr',
});
console.log(text);
await hapti.close();
```

## How a task runs from an agent

A website task takes from a few seconds to a few minutes. The agent starts it with `start_task`, then calls `get_task` with `wait_seconds` until the task ends or waits for something. When `get_task` shows a pending question or approval, the agent asks the person and answers with `answer_task` or `approve_task`; it never invents the value. The server tells the model this itself when the connection opens, so a plain instruction such as "use Hapti for websites without an API" is enough. See [Tasks](tasks.md) for the statuses and [Build with AI agents](agents.md) for MCP clients such as Claude Code and Cursor.

## Without MCP

A framework without MCP support calls the [REST API](api-tasks.md) instead, or the [JavaScript and Python libraries](sdks.md): wrap `tasks.create` and `tasks.wait` in one tool that takes a URL and a goal.

# Give your AI agent a browser with MCP

> Connect Claude, Cursor or your own agent to the Hapti MCP server so it can book, fill in forms and download documents on websites that have no API.

An AI agent is stuck when the job lives on a website with no API. The Hapti MCP server gives it a real browser it can use by sight: the agent asks Hapti to do a task on a website, follows it, answers its questions with the person, and gets the result with proof.

## Add it in one step

The server lives at `https://api.hapti.dev/mcp`. In Claude, Cursor or VS Code, add it as a remote MCP server and sign in to Hapti when asked: nothing to copy. In Claude Code:

```bash
claude mcp add --transport http hapti https://api.hapti.dev/mcp
```

Every client is covered in [Build with AI agents](agents.md), and agent frameworks in [Agent frameworks](frameworks.md).

## What the agent can do

| Tool | What it does |
| --- | --- |
| `next_steps` | Where the person stands and what to do next, in order: a task that waits for them, credit to add, a task to follow, a failure and how to get past it, or a first task to offer. |
| `start_task` | Give a goal to a Hapti agent that operates a real web browser by sight, like a person. |
| `get_task` | State of a task. |
| `answer_task` | Answer the question a waiting task asked. |
| `approve_task` | Give or refuse the approval a waiting task asked for before a step that commits the person. |
| `connect_account` | When a task needs to sign in to a website: gives a link, valid one hour, where the person types their own sign-in. |
| `cancel_task` | Stop a task that is queued, running or waiting. |
| `estimate_task` | The price of a task before starting it, from the earlier successes of the same task and its recipe: likely_cents, at_most_cents and what it is based on. |
| `list_templates` | The ready-made tasks Hapti offers on sites that have no API (book an appointment, file a form, track an application, get invoices, cancel a subscription, place an order...), each with its id, what it does and its parameters. |
| `list_tasks` | The latest tasks of this key, newest first, optionally only one status (for example running or waiting): find a task again when you lost its id. |
| `list_recipes` | The recipes of this organisation, newest first: id, name, site, number of steps, uses. |
| `get_balance` | The credit, in cents of US dollars: balance_cents, available_cents (what new tasks can still use once the open tasks hold their starting price), held_cents and paused_tasks (tasks waiting for credit, which start by themselves once credit is added). |
| `get_account` | Start here when something does not work as expected: the organisation, the mode of this key (test or live), the API version, the credit in full (balance, available, held by open tasks, tasks paused for lack of credit, card saved, offered credit, automatic top up and its last error) and the prices. |
| `get_task_steps` | Why a task did what it did: every step the agent took, in order, with its time and summary, the questions and approvals, the sites it reached and the ones refused, and how it ended. |
| `list_requests` | The API calls made with keys of this mode in the last 30 days, newest first: method, path, HTTP status, duration and Request-Id. |
| `get_request` | One API call by its Request-Id (the Request-Id header of every answer): its parameters, the body sent and the answer given, with passwords, tokens and file contents masked. |
| `list_webhook_deliveries` | The webhook events sent to this mode's addresses, newest first: event, address, state (delivered, failed, retrying, pending), the HTTP status the receiving server answered and the number of attempts. |
| `get_webhook_delivery` | One webhook delivery: the exact body sent, every attempt with the status and answer of the receiving server, and when the next attempt is due. |
| `resend_webhook_delivery` | Send one webhook delivery again, now, to the same address and signed the same way, for example once the receiving server is fixed. |
| `get_usage` | Tasks of this mode by status, and what was billed day by day, over a period: from and to are dates like 2026-11-01, the current month by default. |
| `create_monitor` | Checks a website on a schedule with a task and reports only what changed: new items, removed items, changed values. |
| `list_monitors` | The websites being watched, with their schedule, last check, last change and last error. |
| `get_monitor` | A monitor with the current value of its website and its latest changes (what was added, removed or changed at each check). |

## Why not a raw browser tool

A raw browser tool hands the model every click, every page and every failure, and fills its context with screenshots. With Hapti the agent delegates the whole website task and gets back the result: a sentence, structured data, downloaded files and the proof. Sign-ins, codes received by email or text message, sessions kept between tasks and anti-robot pages are handled for it, and it pays only for the actions that worked.

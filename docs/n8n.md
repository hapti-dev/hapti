# n8n

> Use Hapti in n8n workflows and in the n8n AI Agent with the Hapti community node: run a task on any website and get the result in the next step.

The Hapti node for [n8n](https://n8n.io) runs website tasks from any workflow: book an appointment, fill in a form, download an invoice, check a status behind a login. It also works as a tool of the n8n AI Agent.

## Install

In n8n, open **Settings**, then **Community Nodes**, click **Install** and enter `n8n-nodes-hapti`. The package is on [npm](https://www.npmjs.com/package/n8n-nodes-hapti) and its source on [GitHub](https://github.com/hapti-dev/n8n-nodes-hapti).

Then add a **Hapti API** credential with a key from the developers screen of [the console](https://app.hapti.dev). A test key (`hp_test_`) lets the agent work on the real site without ever submitting the data you give; see [Authentication](authentication.md).

## Operations

| Operation | What it does |
| --- | --- |
| Run | Starts a task and waits until it ends, or until it needs someone (a question or an approval) |
| Start | Starts a task and returns at once, to follow it with Get or a webhook |
| Get | Reads the state and the result of a task |
| Answer | Gives the value a waiting task asked for |
| Approve or Refuse | Answers the approval a waiting task asked for |
| Cancel | Stops a task; only the actions already done are billed |

A task takes a **Website URL** and a **Goal** in plain words. The options match the [task fields](tasks.md): data, an output schema, the user the task is for, saved accounts, time and price limits, the residential proxy, the locale and a webhook.

## Watch a website: Monitor and Hapti Trigger

The **Monitor** resource checks a website on a schedule and keeps only what changed: new listings, prices that moved, slots that opened, a file status.

| Operation | What it does |
| --- | --- |
| Watch a Website | Creates a monitor: a **Website URL**, **What to Read** in plain words, and **Every** (`30m`, `1h`, `1d`) or a cron rule. Give an **Output Schema** with a list and an **Item Key** such as `url` |
| Get Current Value | The last value read on the website, as if it had an API |
| Get Changes | What was added, removed or changed at each check, newest first |
| Get Many | Every monitor with its last check and last change |
| Delete | Stops a monitor and deletes its history |

The **Hapti Trigger** node starts a workflow once for each change a monitor finds, with `added`, `removed` and `changed`. Give it a monitor ID, or leave it empty to follow every monitor. Each check is a task, billed per action that worked. See [Monitors](monitors.md).

## Handle a question in the workflow

When **Run** returns a task with `status` set to `waiting`, `pending.text` holds the question. Send it to the person (by email, Slack or a form), then use **Answer** with the task ID and their reply. The task carries on, and a later **Get** or the webhook gives the result. See [Questions and approvals](tasks.md#questions-and-approvals).

## Billing

Each action of the agent that worked is billed, whatever the outcome; an action that fails costs nothing. See [Pricing and billing](pricing.md).

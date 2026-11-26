---
name: hapti
description: Do tasks on websites that have no API with Hapti, a browser agent that works by sight. Use when a job must be done on a website without an API, such as booking an appointment, filling in and submitting a form, downloading an invoice or certificate, or checking a status behind a login.
---

# Hapti: tasks on websites that have no API

Hapti runs an agent in a real browser that works on a website by sight, like a person, and returns the result with proof. Each action of the agent that worked is billed, whatever the outcome of the task; an action that fails costs nothing.

## When to use it

Use Hapti when the job lives on a website that offers no API, or an API that does not cover the job:

- book an appointment on a clinic, town hall or booking site;
- fill in and submit an online form, up to the confirmation page;
- download invoices, statements or certificates from a customer area;
- check a status or read data behind a login.

Do not use it when the website has an API for the job, or to read a public page that a simple fetch can read.

## How to run a task

1. Call `start_task` with the starting `url`, a `goal` in plain words, and the `data` the agent may use. Add `user` for the person the task is for: they keep their browser, sign-ins, inbox and vault from task to task.
2. Call `get_task` with `wait_seconds` until the task ends or waits.
3. When the task is waiting, `pending` holds a question or an approval. Ask the person, then answer with `answer_task` or `approve_task`. Never invent a value or an approval.
4. Read the result: `result.answer`, `result.data` when an `output` schema was given, files, and the proof. A task that did not succeed carries `result.reason`, a stable code with a plain sentence.

`list_templates` lists ready-made tasks, `estimate_task` gives the likely price, and `cancel_task` stops a task that is no longer wanted. When something goes wrong, `get_account`, `get_task_steps` and `list_requests` show the cause.

## Connect

The MCP server is `https://api.hapti.dev/mcp`. Clients that support MCP authorization sign in with OAuth; others send `Authorization: Bearer hp_test_...` or `hp_live_...`. Docs: https://hapti.dev/docs/agents

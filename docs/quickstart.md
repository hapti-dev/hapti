# Quickstart

> Source: [https://hapti.dev/docs/quickstart](https://hapti.dev/docs/quickstart). This copy is updated at each release.

> Create a key, run your first Hapti task with cURL, JavaScript or Python, answer the agent when it asks, and read the result.

## 1. Get a key

Sign in to the [console](https://app.hapti.dev), open **Developers** and click "Clé test" (test key), then copy the key shown: it is shown only once. Test keys start with `hp_test_`: the agent works on the real site but never submits the data you give. Live keys start with `hp_live_` and do the task for real. Both are billed for each action of the agent that worked, from the same credit, and your first $5 are offered once you add a card. For your automated tests, a test task with `"mock": "succeeded"` answers at once and is never billed: see [Test your integration](testing.md).

```bash
export HAPTI_API_KEY=hp_test_...
```

## 2. Install a library

:::tabs
```bash cURL
# Nothing to install
```
```bash JavaScript
npm install hapti-sdk
```
```bash Python
pip install hapti
```
:::

## 3. Run a task

The simplest way is to create the task and wait for its end. The libraries follow the task live and return as soon as it is over.

:::tabs
```bash cURL
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://en.wikipedia.org", "goal": "Find the year Ada Lovelace was born."}'
```
```js JavaScript
import Hapti from 'hapti-sdk';

const hapti = new Hapti(process.env.HAPTI_API_KEY);
const task = await hapti.tasks.run({
  url: 'https://en.wikipedia.org',
  goal: 'Find the year Ada Lovelace was born.',
});
console.log(task.status, task.result.answer);
```
```python Python
import os
from hapti import Hapti

hapti = Hapti(os.environ["HAPTI_API_KEY"])
task = hapti.tasks.run({
    "url": "https://en.wikipedia.org",
    "goal": "Find the year Ada Lovelace was born.",
})
print(task["status"], task["result"]["answer"])
```
:::

With cURL, the answer is the task at the moment it was created. Ask for it again with its id until `status` is final:

```bash
curl https://api.hapti.dev/v1/tasks/tsk_... -H "Authorization: Bearer $HAPTI_API_KEY"
```

## 4. Answer the agent

The agent never invents a value. When something is missing, such as a code received by text message, the task goes to `waiting` with a `pending` question. Answer it and the agent goes on.

:::tabs
```js JavaScript
const task = await hapti.tasks.run(
  { url: 'https://bank.example.com', goal: 'Download my last statement.', user: 'customer_42' },
  { onWaiting: async (pending) => askTheCustomer(pending.text) },
);
```
```python Python
task = hapti.tasks.run(
    {"url": "https://bank.example.com", "goal": "Download my last statement.", "user": "customer_42"},
    on_waiting=lambda pending, task: ask_the_customer(pending["text"]),
)
```
```bash cURL
curl https://api.hapti.dev/v1/tasks/tsk_.../answer \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "sms_code", "value": "482913"}'
```
:::

A waiting task looks like this:

```json
{
  "id": "tsk_08b061ed7e634e89",
  "object": "task",
  "batch": null,
  "schedule": null,
  "mode": "test",
  "status": "waiting",
  "queue": null,
  "paused": null,
  "level": "standard",
  "price_cents": 0,
  "starting_price_cents": 10,
  "billed": false,
  "user": "customer_42",
  "url": "https://portal.example.com/claims",
  "goal": "Declare the water damage claim and give me the claim number.",
  "input": {
    "data": {
      "contract": "AX-4471",
      "date": "2026-11-20"
    },
    "files": []
  },
  "pending": {
    "type": "question",
    "key": "policy_holder_phone",
    "text": "Which phone number should the insurer call?",
    "action_url": "https://api.hapti.dev/act/tsk_08b061ed7e634e89.On4C9kUiLXVgYLsS.xRWmD0NbNc6WN4hRBdiaR3OQTRb1U9VZ"
  },
  "learn": true,
  "used_recipe": null,
  "template": null,
  "created_by": {
    "type": "key",
    "id": "key_f945e155abc99c61",
    "hint": "hp_test_bNt…MCx9",
    "name": "default test key",
    "owner_email": null
  },
  "recipe_chosen": null,
  "recipe": null,
  "dispute": null,
  "result": null,
  "files": [],
  "usage": null,
  "created_at": "2026-11-26T15:48:59.507Z",
  "started_at": "2026-11-26T15:48:59.511Z",
  "finished_at": null
}
```

`pending.action_url` is a page where the person can answer by themselves, without an account. Send it to them by email or text message when you prefer not to relay the answer.

## 5. Read the result

A finished task carries the answer, the structured data when you gave an `output` schema, the files the site gave and what was billed.

```json
{
  "id": "tsk_08b061ed7e634e89",
  "object": "task",
  "batch": null,
  "schedule": null,
  "mode": "test",
  "status": "succeeded",
  "queue": null,
  "paused": null,
  "level": "standard",
  "price_cents": 20,
  "starting_price_cents": 10,
  "billed": true,
  "user": "customer_42",
  "url": "https://portal.example.com/claims",
  "goal": "Declare the water damage claim and give me the claim number.",
  "input": {
    "data": {
      "contract": "AX-4471",
      "date": "2026-11-20"
    },
    "files": []
  },
  "pending": null,
  "learn": true,
  "used_recipe": null,
  "template": null,
  "created_by": {
    "type": "key",
    "id": "key_f945e155abc99c61",
    "hint": "hp_test_bNt…MCx9",
    "name": "default test key",
    "owner_email": null
  },
  "recipe_chosen": null,
  "recipe": null,
  "dispute": null,
  "result": {
    "answer": "The claim is declared. Claim number SIN-2026-118.",
    "data": {
      "claim_number": "SIN-2026-118"
    }
  },
  "files": [],
  "usage": {
    "steps": 14
  },
  "created_at": "2026-11-26T15:48:59.507Z",
  "started_at": "2026-11-26T15:48:59.511Z",
  "finished_at": "2026-11-26T15:48:59.527Z"
}
```

## Next steps

- Receive results without polling: [Webhooks](webhooks.md) or [Live updates](live.md).
- Act for your customers with their own sessions and accounts: [Users and identity](users.md).
- Let your AI agent use Hapti: [Build with AI agents](agents.md).

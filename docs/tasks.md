# Tasks

> Source: [https://hapti.dev/docs/tasks](https://hapti.dev/docs/tasks). This copy is updated at each release.

> How a Hapti task works from creation to result. Statuses, questions and approvals, structured output, budgets, languages, recipes and proof.

A task is one job done by an agent on a website. You give a starting address, a goal and the data it may use. The agent works in a real browser until the goal is reached, it needs something from a person, or it cannot go on.

## Create a task

:::tabs
```bash cURL
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: claim-AX-4471" \
  -d '{
    "url": "https://portal.example.com/claims",
    "goal": "Declare the water damage claim and give me the claim number.",
    "data": {"contract": "AX-4471", "date": "2026-11-20"},
    "user": "customer_42",
    "output": {"type": "object", "properties": {"claim_number": {"type": "string"}}, "required": ["claim_number"]}
  }'
```
```js JavaScript
const task = await hapti.tasks.create({
  url: 'https://portal.example.com/claims',
  goal: 'Declare the water damage claim and give me the claim number.',
  data: { contract: 'AX-4471', date: '2026-11-20' },
  user: 'customer_42',
  output: { type: 'object', properties: { claim_number: { type: 'string' } }, required: ['claim_number'] },
});
```
```python Python
task = hapti.tasks.create({
    "url": "https://portal.example.com/claims",
    "goal": "Declare the water damage claim and give me the claim number.",
    "data": {"contract": "AX-4471", "date": "2026-11-20"},
    "user": "customer_42",
    "output": {"type": "object", "properties": {"claim_number": {"type": "string"}}, "required": ["claim_number"]},
})
```
:::

The answer comes at once, before the agent starts:

```json
{
  "id": "tsk_08b061ed7e634e89",
  "object": "task",
  "batch": null,
  "schedule": null,
  "mode": "test",
  "status": "queued",
  "queue": {
    "reason": "waiting_for_browser",
    "behind": null,
    "ahead": 0
  },
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
  "result": null,
  "files": [],
  "usage": null,
  "created_at": "2026-11-26T15:48:59.507Z",
  "started_at": null,
  "finished_at": null
}
```

Write the goal like you would brief a colleague: what to achieve, and what to report back. The goal can be in any language. The agent uses only what you put in `data` and never invents a missing value.

## Statuses

| Status | Meaning | Final |
| --- | --- | --- |
| `queued` | Waiting for a browser | No |
| `running` | The agent is working | No |
| `waiting` | The agent needs an answer or an approval, see `pending` | No |
| `paused` | The task waits for credit and starts by itself once credit is added: show `paused.message` to the person | No |
| `succeeded` | The goal is reached | Yes |
| `failed` | A technical failure on our side | Yes |
| `blocked` | The site refused, or does not offer what the goal needs | Yes |
| `needs_person` | Only the person can do the next step, for example in person or with a device they hold | Yes |
| `incomplete` | The agent ran out of steps, budget or time before the end | Yes |
| `cancelled` | You cancelled it | Yes |

Whatever the status, a task is billed for the actions of the agent that worked, in test as in live mode; an action that fails costs nothing. See [Pricing and billing](pricing.md).

A `queued` task says why it waits in `queue`, which is `null` for any other status:

| Field | Meaning |
| --- | --- |
| `reason` | `person_busy`: the same person already has a task running, and a person's tasks run one at a time so they never share a session. `waiting_for_browser`: every browser is busy. `starting`: a browser took the task and is opening |
| `behind` | With `person_busy`, the id of the task it waits for |
| `ahead` | How many of your queued tasks start before it: those of the same person with `person_busy`, those of your organisation otherwise |

`finished_at` is set only once the task is final and its result is saved, so a task with a final status and a `finished_at` is safe to read.

## Questions and approvals

When the agent needs something, the task goes to `waiting` and `pending` says what:

- **A question** (`pending.type` is `question`): a value such as a code received by text message, or a choice between options. Answer with [`POST /v1/tasks/{id}/answer`](api-tasks.md#answer-a-question) and the `key` of the question.
- **An approval** (`pending.type` is `approval`): only when you created the task with `"approval": "required"`. The agent stops before any step that commits the person, such as paying or sending. Answer with [`POST /v1/tasks/{id}/approve`](api-tasks.md#approve-or-refuse-a-step).

- **A takeover** (`pending.type` is `takeover`): only when you created the task with `"takeover": true`. The agent reached a step that only the person can do on the site, such as confirming a sign-in in their bank app, typing a code shown on their own device, or passing a check the agent cannot pass. `pending.action_url` opens the live browser: the person clicks, types and scrolls in it, then presses **Done** and the agent goes on from where it stopped. See [Let the person take over](#let-the-person-take-over).

`pending.action_url` is a page where the person answers by themselves, once, without an account or a key. It is the simplest way to reach a customer in your app, by email or by text message.

By default the agent does not stop to ask permission: it does the final step that sends, confirms or pays. Use `"approval": "required"` when a person must confirm first, or give the person a [mandate](users.md#mandates) that says what the agent may do for them.

## Let the person take over

```json
{ "url": "https://www.my-bank.example", "goal": "Download the statement of October", "user": "claire", "takeover": true }
```

When the agent needs the person for a step, the task waits with `pending.type` set to `takeover` and sends `task.waiting`. Show `pending.action_url` to the person: in a new tab, by text message, or inside your app in an iframe:

```html
<iframe src="PENDING_ACTION_URL" style="width:100%;height:720px;border:0" allow="clipboard-write"></iframe>
```

The page shows the browser live, about twice a second, and works on a phone. The person acts on it directly, then presses **Done, the agent goes on**, or **Stop the task**. The agent then carries on from the same page, with the same session. Without an answer within 15 minutes (`"takeover": {"minutes": 1 to 60}` to change it), the task ends as without takeover, with the reason `needs_person_action`.

To build your own interface instead, read the picture with [`GET /v1/tasks/{id}/frame`](api-tasks.md), send gestures with [`POST /v1/tasks/{id}/input`](api-tasks.md) (`click`, `type`, `key`, `scroll`, `drag`, positions from 0 to 1) and end with [`POST /v1/tasks/{id}/handback`](api-tasks.md). The time the person takes is not billed: a task is billed by the actions of the agent that worked, never by time.

## Results

| Field | What it holds |
| --- | --- |
| `result.answer` | What the agent reports, in plain words |
| `result.data` | Structured data that follows your `output` schema |
| `files` | Files the site gave, such as invoices or certificates, see [Files](files.md) |
| `result.reason` | When the task did not succeed: a stable code, see below |
| `result.message` | The same reason in one plain sentence |
| `price_cents` | What was billed: $0.10 per started 10 actions that worked, whatever the outcome |
| `usage` | The number of actions the agent took |

### Why a task did not succeed

A task that ends `failed`, `blocked` or `incomplete` carries `result.reason`. Branch on the code, show `result.message` to people, and keep `result.answer` for what the agent saw. None of these tasks is billed.

| `result.reason` | What happened | What to do |
| --- | --- | --- |
| `site_unreachable` | The website did not answer, or the address is wrong | Check the `url`, then run it again later |
| `blocked_by_site` | The website blocked the browser as a robot | Run it again with `proxy` set to the person's country |
| `needs_sign_in` | The website asks to sign in and no account was usable | Save the person's account in the vault, or keep their session |
| `not_found` | What the goal asks for does not exist on the website | Change the goal |
| `needs_person_action` | The website asks for something only the person can do, such as an identity check | Ask the person to do it, then run it again |
| `cannot_continue` | The task cannot go further for another reason, told in `result.answer` | Read `result.answer` |
| `out_of_time` | `max_seconds` ran out | Raise `max_seconds` or split the goal |
| `out_of_steps` | The step budget ran out | Split the goal |
| `no_progress` | The agent stopped because it was going round in circles | Make the goal more precise |
| `output_mismatch` | The answer does not fit your `output` schema | Loosen the schema, or read `result.answer` |
| `account_unavailable` | A saved account could not be handed to the browser | Check the account in the vault |
| `credit` | The task waited too long for credit | Add credit and run it again |
| `engine_error` | An internal error on our side | Run it again |

New codes may be added later: treat an unknown code like `cannot_continue`.

### Structured output

Give a JSON Schema in `output` and `result.data` follows it. When the agent cannot fill the schema from what it saw, the task ends incomplete. Programs can trust `result.data` without parsing text.

### Languages

The agent writes its answer and its questions in the language of the goal. Set `answer_language` to choose another one, such as `pt-BR` or `wo`. The browser takes the language and time zone of the person when you give a `user`, or of `locale` and `country`. Nothing is forced to English or to any default country.

## Budget and limits

- `max_price_cents`: the agent stops before the price would go over it.
- `max_steps`: the most actions the agent may take, from 1 to 500, 80 by default.
- `max_seconds`: the longest the agent may work, from 30 to 1800 seconds (30 minutes), 600 (10 minutes) by default. The time a task waits for an answer or an approval from the person does not count.

A task that reaches one of these limits ends as `incomplete`; the actions that worked until then are billed. Its `result.answer` says what it had found and done by then.

## Queue

A person's tasks run one at a time, so they never share a session: the next one waits, `queued`, until the current one ends. When every browser is busy, new tasks wait their turn the same way. A queued task says why in `queue`, and `queue.ahead` counts the tasks that start before it. Tasks are taken in order, and a large batch of one customer never holds back the tasks of another.

## Recipes

A task that succeeds becomes a recipe: the path the agent took. The next time the same task runs for your organisation, the agent replays the recipe first, which is faster and costs fewer actions, and falls back to looking at the screen when the site has changed. Set `"learn": false` to neither learn nor replay, or `recipe` to replay a given one. See [GET /v1/recipes](api-recipes.md).

## Proof

Every step of the agent and the screenshots it saw are kept for 90 days. Read them with [`GET /v1/tasks/{id}/proof`](api-tasks.md#get-the-proof), or delete them now with `DELETE`. If a billed task is wrong, [open a dispute](api-tasks.md#dispute-a-billed-task): the proof is checked and the price is refunded when the claim is right.

## Cancel and run again

[`POST /v1/tasks/{id}/cancel`](api-tasks.md#cancel-a-task) stops a task that is not over. A cancelled task pays only the actions already done. [`POST /v1/tasks/{id}/retry`](api-tasks.md#run-a-task-again) creates a new task with the same input.

## Follow a task

Three ways, from the simplest to the most efficient:

1. **Ask for it** with [`GET /v1/tasks/{id}`](api-tasks.md#get-a-task). Fine for scripts.
2. **Stream it** with [`GET /v1/tasks/{id}/stream`](live.md): every step as it happens.
3. **Receive webhooks** on your server: see [Webhooks](webhooks.md). Best for production.

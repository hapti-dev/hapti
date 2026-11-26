# Integrate Hapti in code

> Everything a developer or a coding agent needs to call Hapti from code, in one page: the library, the exact fields, the task loop, statuses and errors.

This page is the short path for a developer or a coding agent who adds Hapti to an application. Every field below is generated from the [OpenAPI specification](https://hapti.dev/openapi.json), the same one the API is checked against, so the names are exact. Each guide linked here goes further.

## Use the library

The official libraries handle retries, idempotency, waiting and webhook signatures. Prefer them to writing HTTP calls by hand.

```bash
npm install hapti-sdk
```

```ts
import Hapti from 'hapti-sdk';

const hapti = new Hapti(process.env.HAPTI_API_KEY);
const task = await hapti.tasks.run(
  { url: 'https://portal.example.com', goal: 'Download my last statement.', user: 'customer_42' },
  { onWaiting: (pending) => askTheCustomer(pending.text), onStep: (s) => console.log(s.summary) },
);
console.log(task.status, task.result);
```

The package ships its TypeScript types and works in Node 18 and later. In Python: `pip install hapti`, then `from hapti import Hapti`. See [Libraries](sdks.md) for every method.

## Keys and modes

Every call takes `Authorization: Bearer <key>`, at `https://api.hapti.dev`.

| Key | What happens |
| --- | --- |
| `hp_test_...` | The agent works on the real website but never submits the data you give. Use it while you build. |
| `hp_live_...` | The task is done for real. |

Both modes are billed for each action of the agent that worked, from the same credit; an action that fails costs nothing. To test your code without opening a browser, a test task with `"mock": "succeeded"` (or another outcome) answers at once and is never billed: see [Test your integration](testing.md).

## The task loop

1. Create a task with `POST /v1/tasks`: a starting `url` and a `goal` in plain words, plus the `data` the agent may use.
2. Follow it until its status is final: read `GET /v1/tasks/{id}` every few seconds, or receive its events on a `webhook`, or follow it live (see [Live updates](live.md)).
3. When the status is `waiting`, the agent needs you: `pending` holds a question (answer with `POST /v1/tasks/{id}/answer`) or an approval (give it with `POST /v1/tasks/{id}/approve`). Relay it to the person; never invent the answer.
4. When the status is final, read `result`: the answer, and `result.data` when you gave an `output` schema.

| Status | Meaning | Final |
| --- | --- | --- |
| `queued` | Waiting for a browser | No |
| `running` | The agent is working | No |
| `waiting` | The agent needs an answer or an approval, see `pending` | No |
| `paused` | The task waits for credit and starts by itself once credit is added | No |
| `succeeded` | The goal is reached | Yes |
| `failed` | A technical failure on our side | Yes |
| `blocked` | The site refused, or does not offer what the goal needs | Yes |
| `needs_person` | Only the person can do the next step | Yes |
| `incomplete` | The agent ran out of steps, budget or time before the end | Yes |
| `cancelled` | You cancelled it | Yes |

## Endpoints

### Create a task

```http
POST /v1/tasks
```

Starts an agent that does the goal on the website, by sight, in a real browser. Returns at once; follow the task with GET, the live stream or webhooks.

| Parameter | In | Description |
| --- | --- | --- |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

| Field | Type | Description |
| --- | --- | --- |
| `url` | string | The page to start on. |
| `goal` | string | What to achieve and what to report back, in plain words, in any language. |
| `data` | object | The facts the agent may use. It never invents a missing value: it asks. |
| `template` | string | A catalogue template id, instead of url and goal. |
| `params` | object | The params of the template. |
| `user` | string | The person the task acts for. Gives the task their device, session, memory, inbox and stored accounts. |
| `accounts` | array | Stored accounts of the person the agent may sign in with. |
| `output` | object | A JSON Schema for result.data. A task whose answer cannot follow it ends incomplete. |
| `files` | array | Files the agent may upload on the site: up to 20, 50 MB each, 100 MB in all. |
| `webhook` | string | An https address that receives the events of this task only. |
| `approval` | string: `mandate`, `required` | required: the agent waits for your approval before any step that commits the person. |
| `max_price_cents` | integer | The agent stops before the price would go over it. |
| `max_steps` | integer |  |
| `answer_language` | string | Language of the answer and questions, like fr, pt-BR or wo. By default, the language of the goal. |
| `takeover` | object | Let the person take over the browser when the agent needs them for a step (a code in their bank app, a check it cannot pass, a sign-in only they can do): the task waits with pending.type takeover and a live page in pending.action_url, then the agent goes on. true waits up to 15 minutes; {"minutes": 1 to 60} sets the wait. Off by default: without it the task ends with needs_person_action. |
| `mock` | object | Test keys only: the task answers at once with this outcome, opens no browser and is never billed. succeeded, failed, blocked, incomplete, needs_person, question, approval, or an object with status, data, answer, reason and delay_ms. See Test your integration. |
| `locale` | string | Language of the browser, like pt-PT. |
| `country` | string | Two letters: the country the sites see the person in. |
| `proxy` | boolean | Go out through a residential address in that country, billed per GB used. |
| `memory` | boolean | true by default with a user. |
| `keep_session` | boolean | true by default with a user: the task opens the person's own browser profile as their last task left it (cookies, site storage, sign-ins) and saves it at the end. false starts a clean browser. |
| `learn` | boolean | true by default: a success becomes a recipe. |
| `recipe` | string | A recipe id to replay. |
| `on_insufficient_credit` | string: `pause`, `refuse` | pause by default: a live task without enough credit waits and starts once credit is added. |

```json Request
{
  "url": "https://portal.example.com/claims",
  "goal": "Declare the water damage claim and give me the claim number.",
  "data": {
    "contract": "AX-4471",
    "date": "2026-11-20"
  },
  "user": "customer_42"
}
```

```json Response 201
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


### Get a task

```http
GET /v1/tasks/{id}
```

The current state of a task, with its result once it is over.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

```json Response 200
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


### Answer a question

```http
POST /v1/tasks/{id}/answer
```

Gives the agent the value it asked for when the task is waiting with a pending question.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

| Field | Type | Description |
| --- | --- | --- |
| `key` | string | The pending.key of the question |
| `value` (required) | string |  |

```json Request
{
  "key": "policy_holder_phone",
  "value": "+351 912 345 678"
}
```


### Approve or refuse a step

```http
POST /v1/tasks/{id}/approve
```

Answers a pending approval: the agent goes on with approve true, and stops that step with approve false.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

| Field | Type | Description |
| --- | --- | --- |
| `approve` (required) | boolean |  |
| `by` | string | Who decided, kept with the proof |


### Cancel a task

```http
POST /v1/tasks/{id}/cancel
```

Stops a task that is queued, running, waiting or paused. A cancelled task pays only the actions it already did.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |


## Errors

An error answers with a JSON body `{"error": {"type", "code", "message", "reason"}}`: `code` is the HTTP status and `reason` a stable code to test in your code. Send an `Idempotency-Key` header on `POST /v1/tasks` so a retry never creates a second task. See [Errors](errors.md) and [Idempotency](idempotency.md).

## Going further

- [Tasks](tasks.md): output schemas, budgets, languages, recipes and proof.
- [Users and identity](users.md): act for each of your customers with their own browser, sign-ins and vault.
- [Webhooks](webhooks.md): signed events, retries and signature checks.
- [Build with AI agents](agents.md): the MCP server, for an agent that calls Hapti itself.
- The other endpoints: the API reference in the menu, or the [OpenAPI specification](https://hapti.dev/openapi.json).

# Tasks API

> Source: [https://hapti.dev/docs/api-tasks](https://hapti.dev/docs/api-tasks). This copy is updated at each release.

> Reference of the Hapti tasks endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Create a task

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

## List tasks

```http
GET /v1/tasks
```

Tasks of the key mode, newest first, paged with a cursor.

| Parameter | In | Description |
| --- | --- | --- |
| `limit` | query | 1 to 100, 25 by default |
| `cursor` | query | next_cursor of the previous page |
| `status` | query | One status or several separated by commas |
| `user` | query | Only the tasks of this person |
| `q` | query | Search the goal, the site, the person or the id |
| `since` | query | ISO date |
| `until` | query | ISO date |
| `template` | query | Catalogue template id |
| `batch` | query | Batch id |

```json Response 200
{
  "object": "list",
  "data": [
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
  ],
  "has_more": false,
  "next_cursor": null,
  "total": 1
}
```

## Estimate a task

```http
POST /v1/tasks/estimate
```

Gives the likely price of a task before you create it, from your earlier successes of the same task and its recipe.

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

```json Response 200
{
  "object": "estimate",
  "level": "standard",
  "currency": "usd",
  "recipe": null,
  "based_on": "nothing yet: this task has never succeeded here",
  "typical_actions": null,
  "likely_cents": 10,
  "at_most_cents": null,
  "minimum_cents": 10,
  "charged": "per action that worked, whatever the outcome; failed actions are free"
}
```

## Get a task

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

## Answer a question

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

## Approve or refuse a step

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

## Give the hand back to the agent

```http
POST /v1/tasks/{id}/handback
```

Ends a takeover: with done true the agent goes on from where it stopped, with done false the task stops with needs_person_action.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

| Field | Type | Description |
| --- | --- | --- |
| `done` | boolean |  |

## Act on the browser during a takeover

```http
POST /v1/tasks/{id}/input
```

Sends one gesture of the person to the browser: click, type, key, scroll or drag. Positions x and y go from 0 to 1, as a fraction of the width and height of the view. For your own interface; the page of pending.action_url does it for you.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

| Field | Type | Description |
| --- | --- | --- |
| `kind` (required) | string: `click`, `type`, `key`, `scroll`, `drag` |  |
| `x` | number |  |
| `y` | number |  |
| `double` | boolean |  |
| `text` | string |  |
| `key` | string: `Enter`, `Tab`, `Backspace`, `Delete`, `Escape`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Home`, `End`, `PageUp`, `PageDown`, `Space` |  |
| `dy` | integer |  |
| `from` | object |  |
| `to` | object |  |

```json Request
{
  "kind": "click",
  "x": 0.42,
  "y": 0.31
}
```

## Read the live picture of the browser

```http
GET /v1/tasks/{id}/frame
```

During a takeover, the latest JPEG picture of the browser, about twice a second. Pass after with the X-Frame header of the last picture: 204 means no newer picture yet.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `after` | query |  |

## Cancel a task

```http
POST /v1/tasks/{id}/cancel
```

Stops a task that is queued, running, waiting or paused. A cancelled task pays only the actions it already did.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

## Run a task again

```http
POST /v1/tasks/{id}/retry
```

Creates a new task with the same input as a finished one.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `Idempotency-Key` | header | Any unique string of 1 to 255 visible characters. The same key with the same request within 24 hours returns the first answer again instead of acting twice. |

## Watch the browser live

```http
GET /v1/tasks/{id}/live
```

An MJPEG stream of the browser of a running task: a JPEG picture each time the screen changes, about two a second at most. Nothing is sent while a saved password, username or code is in a field. 204 when the task has no browser now, 503 when too many live views are open.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

## Follow a task live

```http
GET /v1/tasks/{id}/stream
```

Server-Sent Events: task when its state changes, step for each action of the agent, screenshot for each image, done at the end. Send Last-Event-ID to resume after the last step.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `Last-Event-ID` | header |  |

## Get the proof

```http
GET /v1/tasks/{id}/proof
```

Every step of the agent and the screenshots it saw, kept 90 days.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

## Delete the proof

```http
DELETE /v1/tasks/{id}/proof
```

Erases the steps and screenshots of a finished task now.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

## Read a file given with the task

```http
GET /v1/tasks/{id}/inputs/{name}
```

A file you gave in files when you created the task, as it was stored; images come back inline. Files given by url are not stored.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `name` | path |  |

## Download a file

```http
GET /v1/tasks/{id}/files/{name}
```

A file the site gave during the task, listed in task.files.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |
| `name` | path |  |

## Dispute a billed task

```http
POST /v1/tasks/{id}/dispute
```

Asks for a check of a billed task whose result is wrong. The proof is reviewed and the price refunded when the claim is right.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Task id, like tsk_9f2c41a07b3d5e18 |

| Field | Type | Description |
| --- | --- | --- |
| `reason` (required) | string |  |

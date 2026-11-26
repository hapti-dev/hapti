# Computer use API, billed per action that works

> A managed computer use API: the model, real browsers, sign-ins and proof in one call. Send a goal, get a checked result, pay only for the actions that work.

Computer use models can operate a browser, but turning one into a product takes much more than the model: browsers to run and scale, sessions to keep, sign-ins and two-factor codes, captchas and anti-robot pages, retries, proof, and a way to know what to bill. Hapti gives you all of it behind one API, and charges only for tasks that succeed.

## What you get in one call

| You would otherwise build | With Hapti |
| --- | --- |
| A model loop that looks at screenshots and acts | Included: an agent tuned for real websites, working by sight |
| Browsers in the cloud, isolated per task | Included: one sandboxed browser per task, scaled for you |
| Sessions kept between tasks | Each person keeps their whole browser from one task to the next |
| Two-factor codes by email or text message | Each person gets an inbox and, when you give one, a phone number the agent reads itself |
| Credentials handled safely | An encrypted vault: the agent types the secret, the model never sees it |
| Knowing whether it worked | A status, a structured result, a stable failure reason and the proof |
| Paying for failed attempts | Nothing: an action that fails is never billed |

## Start a task

```python
import os
from hapti import Hapti

hapti = Hapti(os.environ["HAPTI_API_KEY"])
task = hapti.tasks.run({
    "url": "https://www.service-public.fr",
    "goal": "Find the price of the tax stamp for an adult passport.",
})
print(task["status"], task["result"]["answer"])
```

See the [Quickstart](quickstart.md) for cURL and JavaScript, and [Libraries](sdks.md) for the client libraries.

## When a task does not succeed

Every task that ends `failed`, `blocked` or `incomplete` carries `result.reason`, a stable code such as `blocked_by_site`, `needs_sign_in` or `out_of_time`, with one plain sentence. Your code can branch on it; only the actions that worked before it stopped are billed. See [Why a task did not succeed](tasks.md#why-a-task-did-not-succeed).

## For AI agents too

The same tasks are available as an MCP server at `https://api.hapti.dev/mcp`, so Claude, Cursor and any agent framework can use them. See [Build with AI agents](agents.md).

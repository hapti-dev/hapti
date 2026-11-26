# hapti

An agent that does tasks on any website by sight, in a real browser. You pay only for the actions that work.

Documentation: [hapti.dev/docs](https://hapti.dev/docs/) · API reference: [hapti.dev/docs/api-tasks](https://hapti.dev/docs/api-tasks) · For AI agents: [hapti.dev/llms.txt](https://hapti.dev/llms.txt)

```sh
npm install hapti-sdk
```

```js
import Hapti from 'hapti-sdk';

const hapti = new Hapti(process.env.HAPTI_API_KEY);

const task = await hapti.tasks.run({
  url: 'https://www.example.com',
  goal: 'Read the main title of the page',
  output: { type: 'object', required: ['title'], properties: { title: { type: 'string' } } },
});

console.log(task.result.data.title);
```

`run` starts the task and waits for its end. When the site asks for something the task does not have (a code, an answer, an approval), `onWaiting` gets it, and what it returns is sent back:

```js
await hapti.tasks.run(
  { url: 'https://portal.example.com', goal: 'Declare the claim', data: { contract: 'AX-1' }, user: 'customer-42' },
  { onWaiting: async (pending) => askMyUser(pending.text) },
);
```

`pending.action_url` is also a ready page that you may send to your user yourself: they answer or approve on it, once, without any key.

## What you get without configuring anything

- A `user` is one person of yours: they keep their session, device and mailbox from task to task.
- Every success becomes a recipe: the same task is replayed next time, faster and cheaper.
- `output` gives you `result.data`, checked against your JSON Schema; a task that cannot fit it ends incomplete.
- `files` go in (base64 or https address); files the site gives come back in `task.files`.

## Many tasks

```js
const batch = await hapti.batches.create({
  template: { url: 'https://portal.example.com', goal: 'Declare the claim' },
  items: customers.map((c) => ({ user: c.id, data: { contract: c.contract } })),
});
for await (const t of hapti.batches.tasks(batch.id)) console.log(t.id, t.status);
```

## On a schedule

```js
await hapti.schedules.create({ cron: '0 9 * * 1-5', timezone: 'Europe/Paris', task: { url: 'https://shop.example.com', goal: 'Read the price of the lamp' } });
```

## Price first

```js
const { likely_cents, at_most_cents } = await hapti.tasks.estimate({ url, goal });
```

## Webhooks

```js
const ok = await Hapti.verifyWebhook(rawBody, request.headers['hapti-signature'], process.env.HAPTI_WEBHOOK_SECRET);
```

Test keys (`hp_test_…`) never send the data to the sites; live keys (`hp_live_…`) do the task for real. Both pay for each action that worked, from the same credit.

## Your users connect their own accounts

```js
const { url } = await hapti.users.connectLink('customer-42', {
  accounts: [{ account: 'bank', origin: 'https://www.my-bank.com', label: 'My bank' }],
  brand: { name: 'Acme', color: '#2b59ff' },
});
```

Send `url` to your user yourself: they put their credentials in the vault, give their consent, see what was done for them and can erase it all. You never see their secrets. Limit and follow each user:

```js
await hapti.users.setLimits('customer-42', { tasks_per_day: 20, cents_per_month: 500 });
const { billed_cents } = await hapti.users.usage('customer-42');
```

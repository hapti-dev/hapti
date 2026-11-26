# Command line

> The hapti command forwards webhooks to your machine, fires test events, and runs tasks from the terminal, answering the agent's questions as they come.

The `hapti` command needs only Node.js 18 or later. Run it with `npx @hapti/cli`, or install it once and use `hapti`:

```bash
npm install -g @hapti/cli
export HAPTI_API_KEY=hp_test_...
```

## Receive webhooks on your machine

Your webhook handler runs on `localhost`, which Hapti cannot reach. `hapti listen` reads the events of your account and sends each one to your local address, with the same body and headers as in production:

```bash
npx @hapti/cli listen --forward-to http://localhost:3000/hooks
```

```
Ready. Forwarding test events to http://localhost:3000/hooks
Signing secret for this session: whsec_5f1c...
15:02:11  task.created       evt_8a1f... tsk_9f2c... [200] 4 ms
15:02:12  task.succeeded     evt_b310... tsk_9f2c... [200] 6 ms
```

Each request carries `Hapti-Signature`, signed with the secret shown at start: put it in your handler and [verify the signature](webhooks.md) exactly as in production. To keep your usual secret, pass `--secret whsec_...` or set `HAPTI_WEBHOOK_SECRET`. `--events task.succeeded,monitor.*` keeps only some events. Events arrive about a second after they happen.

## Fire test events

```bash
npx @hapti/cli trigger succeeded
```

creates a [mock task](testing.md) that ends with this outcome in half a second, so its events reach `hapti listen` and your webhook endpoints. Outcomes: `succeeded`, `failed`, `blocked`, `incomplete`, `needs_person`, `question`, `approval`. Mock tasks are never billed; `trigger` needs a test key.

## Run a task from the terminal

```bash
npx @hapti/cli run --url https://portal.example.com \
  --goal "Download the latest invoice and give its total" \
  --output '{"type":"object","properties":{"total":{"type":"number"}}}'
```

The command follows the task, prints each change of status, and when the agent asks a question or an approval it asks you in the terminal and sends your answer. At the end it prints the answer, the data and what was billed. `--data` gives values to use, `--user` the person the task is for, `--mock` a mock outcome, and `--json` prints the task as JSON for scripts. It exits with 0 when the task succeeded, 2 when it did not, and 3 when it waits for someone and no terminal can answer.

`npx @hapti/cli get tsk_...` shows a task.

## Test your app

`npx @hapti/cli test --url https://staging.example.com` runs the tests written in `.hapti/tests` and gives a verdict per test, with a JUnit report for your CI if you want one. See [Test your app](test-apps.md).

## Options

| Option | Default |
| --- | --- |
| `--api-key` | `HAPTI_API_KEY` |
| `--base-url` | `HAPTI_BASE_URL`, or `https://api.hapti.dev` |

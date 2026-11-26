# Test your app

> Hapti Test runs end-to-end tests written in plain words against your application, at every pull request, and gives a verdict you can trust, with proof.

Hapti Test checks your application the way a person would, at every change. You write each test in plain words, in your repository; an agent opens your app in a real browser, does the journey, checks what you asked, and tells you what works, what is broken and why, with screenshots.

There are no selectors to maintain: a button that changes its name or its place does not break a test.

## Write a test

One file per journey in `.hapti/tests/`, for example `.hapti/tests/checkout.md`:

```markdown
---
name: Checkout with VAT
start: /shop
data: {"email": "qa@example.com"}
tags: payment
---
Create an account with the email, add the Nord lamp to the cart and go to payment.

Check:
- the cart shows 1 item
- the VAT is 20 % and has its own line
- the Pay button is enabled
```

| Header field | What it does | Default |
| --- | --- | --- |
| `name` | Name shown in results | The file name |
| `start` | Path where the test starts, added to the address you test | `/` |
| `data` | Values the agent uses, as JSON | None |
| `user`, `account` | A saved account of this [user](users.md) to sign in with; the agent types it without seeing it | None |
| `timeout` | Longest time for the test, in seconds (30 to 1800) | 180 |
| `tags` | Labels to run a subset | None |

The body is the journey in plain words, then a `Check:` line (or `Vérifie :`) followed by one check per line. Each check is judged on its own.

`${NAME}` anywhere in a test file is replaced by the environment variable `NAME` when the test runs, for values that change between runs or must not be in the repository, like `data: {"code": "${PROMO_CODE}"}`. A missing variable stops the command before anything is sent. For passwords, prefer a saved `account`: the agent types it without ever seeing it.

## Run the tests

The browsers of Hapti run in the cloud, so the address you test must be reachable from the internet: the preview URL of a pull request, a staging site, or production for read-only journeys. An address of your own machine (`localhost`, `127.0.0.1`, a private network) is refused before anything is sent or billed. To test the app running on your machine, open a tunnel to it, then test the address it prints:

```bash
cloudflared tunnel --url http://localhost:3000
```

```bash
export HAPTI_API_KEY=hp_live_...
npx @hapti/cli test --url https://staging.example.com
```

```
Hapti Test  3 tests on https://staging.example.com

✓ home  14 s
✗ checkout  BUG  52 s
    the VAT is 20 % and has its own line
      expected  20 %
      observed  0 %
    proof  https://app.hapti.dev/#/tasks/tsk_9f2c41a07b3d5e18
! login  COULD NOT TEST  31 s
    the sign-in page answered 502

3 tests · 1 passed · 1 bug · 1 could not test · 1 min 38 s · $0.40
```

| Option | What it does |
| --- | --- |
| `hapti test checkout home --url …` | Only these tests (file names) |
| `--tag payment` | Only the tests with this tag |
| `--dir path/to/tests` | Another folder than `.hapti/tests` |
| `--junit report.xml` | A JUnit report, read by GitLab, Jenkins and most CI tools |
| `--json` | The whole run as JSON |
| `--markdown report.md` | A summary for a pull request comment |
| `hapti test init-ci` | Writes the GitHub Actions or GitLab CI file and a first test |

Exit codes: `0` everything passed (or was flaky), `1` a bug was confirmed, `2` a test could not run, `3` a usage error.

## Verdicts you can trust

| Verdict | Meaning | Fails the build |
| --- | --- | --- |
| Passed | The journey was done and every check held | No |
| Bug | A check failed, and failed again when the test was run a second time | Yes |
| Flaky | A check failed once, then passed on another run | No |
| Could not test | The agent could not reach the checks for a reason that is not your app (a page that never loaded, a refused sign-in) | No, but the exit code is 2 |

A failed check always comes with what was expected, what was seen and the proof of the run. A test is never called a bug from a single run: when one run finds a bug and the other could not finish, a third run decides.

## In your CI

The fastest way: `npx @hapti/cli test init-ci` writes the CI file for GitHub Actions or GitLab CI (it finds which one you use) and a first test if you have none, then tells you the two settings left, your API key as a secret and the address to test.

On GitHub, the Hapti Test action runs your tests on the preview of each pull request and posts the verdicts as a comment, updated at each run:

```yaml
name: Hapti Test
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v7
      - uses: hapti-dev/hapti/actions/test@v1
        with:
          url: ${{ env.PREVIEW_URL }}
          api-key: ${{ secrets.HAPTI_API_KEY }}
```

The job fails only on a confirmed bug; set `fail-on-could-not-test: true` to fail when a test could not run too. The same report appears in the job summary, and each bug as an annotation in the checks tab.

Anywhere else (GitLab CI, Jenkins, CircleCI), run the command and read its exit code and JUnit report:

```bash
npx @hapti/cli test --url "$PREVIEW_URL" --junit hapti.xml --markdown hapti.md
```

`--markdown` writes the same comment as on GitHub, to post wherever your team reads it. The commit and the branch are read from GitHub Actions and GitLab CI and attached to the run. Use a live key: a test run acts for real on the application you test, even with a test key, since it is your own app.

## From your code

[`POST /v1/test-runs`](api-tests.md) takes the address and the tests (`{ name, text }`, the content of a test file) and returns at once; [`GET /v1/test-runs/{id}`](api-tests.md) gives each verdict with its checks. The `test.bug` event comes for each confirmed bug and `test_run.finished` when every test has its verdict.

## Cost

Each test is a task, billed like any task for the actions that worked, at the usual [price](pricing.md). A test of about 25 actions costs $0.30. A test that fails is run once more to confirm it, and that second run is billed too.

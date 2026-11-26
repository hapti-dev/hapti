# AI end-to-end testing without selectors

> Hapti Test runs end-to-end tests written in plain words against your web app at every pull request, with confirmed verdicts and screenshots, and no selectors to maintain.

End-to-end tests catch what matters most, a broken sign-up or checkout, but scripted tests break each time a button is renamed and take hours to maintain. Hapti Test replaces the script with a sentence: an agent opens your app in a real browser, does the journey like a person and checks what you asked.

| | Scripted end-to-end tests | Hapti Test |
| --- | --- | --- |
| A test is written as | Code with selectors | Plain words in a Markdown file |
| A renamed or moved button | Breaks the test | Is still found, the test goes on |
| A failure | One run, often a flaky timeout | Run again before it is called a bug, with what was expected and what was seen |
| Maintenance | Rewriting selectors after each redesign | Editing a sentence when the journey itself changes |
| Proof | A log and a stack trace | Screenshots and every step of the agent |

## How teams use it

- **At every pull request**: `npx @hapti/cli test --url $PREVIEW_URL --junit hapti.xml` in GitHub Actions, GitLab CI or Jenkins. A confirmed bug fails the build.
- **On the journeys that make money**: sign-up, sign-in, checkout, payment, onboarding, the forms your customers fill.
- **On production, every hour**: the same tests as [monitors](monitors.md), so a broken checkout is known before customers write in.

## What you get

- Tests in your repository, reviewed in pull requests like code.
- Four verdicts that never mix up your bugs with the agent's limits: passed, bug, flaky, could not test.
- A price per action that worked, about $0.30 for a test of 25 actions. See [Pricing and billing](pricing.md).

Start with [Test your app](test-apps.md).

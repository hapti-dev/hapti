# Pricing and billing

> Source: [https://hapti.dev/docs/pricing](https://hapti.dev/docs/pricing). This copy is updated at each release.

> Hapti bills each action of the agent that worked, whatever the outcome, from a prepaid credit, in test and live mode. Failed actions are free.

## You pay for the work done

Every action of the agent that worked (a click, a typed value, a page opened) is billed, whatever the outcome of the task: succeeded, failed, blocked, incomplete or cancelled. An action that fails costs nothing, and a task where no action worked costs nothing. Hapti runs real browsers and pays for every call to the model, so the price follows the work actually done. Test tasks are billed like live ones, from the same credit: the agent and the model work just as much, only the data is never sent to the sites. Your first $5 of credit are offered once you add a card.

| | Price |
| --- | --- |
| A task | $0.10 per 10 actions of the agent that worked |
| Time spent waiting for an answer | Free |
| Residential proxy, when you ask for it | $2.90 per GB used |

A task of 1 to 10 actions that worked costs $0.10, 11 to 20 twice that, and so on. The price is in `price_cents` once the task ends. Use [`POST /v1/tasks/estimate`](api-tasks.md#estimate-a-task) to know the likely price first, and `max_price_cents` to set a ceiling.

## Credit

Live tasks are paid from a prepaid credit, in the console under **Billing**. Add a card to receive a first credit offered once, top up any amount, or turn on automatic top-up with a monthly cap.

The credit, the card and the payments belong to the organisation: all its projects draw on the same credit, so a new project never asks for a card again, and you get one bill. The Billing page shows how much each project spent this month. The offered credit is given once per organisation.

When the credit is not enough for a new task, in test as in live, the task is created `paused`. Its `paused.message` is ready to show, with the link in `paused.add_credit_at` and the credit a first card brings in `paused.offered_cents`. The task starts by itself as soon as credit is added. A paused task that never gets credit stops after 7 days, unbilled. Set `"on_insufficient_credit": "refuse"` to get a `402` instead.

## Disputes

If a billed task did not do what it should have because of Hapti, for example the agent reported a result the proof does not show, [open a dispute](api-tasks.md#dispute-a-billed-task). The proof of the task is checked and the price is refunded to your credit when the claim is right.

## Usage

[`GET /v1/usage`](api-account.md#usage-by-day) gives what was billed per day, and `GET /v1/usage/users` per person you act for.

# Users and identity

> Source: [https://hapti.dev/docs/users](https://hapti.dev/docs/users). This copy is updated at each release.

> Act for each of your customers with their own device, session, memory, email inbox, phone number and vault of sign-in details.

Most real tasks are done for someone: your customer, a patient, a tenant. Give each task the `user` it acts for, with your own id for that person. Hapti then keeps a stable identity for them from task to task, so sites see the same person coming back instead of a new robot each time.

```json
{ "url": "https://portal.example.com", "goal": "Download my last statement.", "user": "customer_42" }
```

You do not need to create the person first: the first task with a new `user` creates it. Create it explicitly to set their country, language and time zone in advance:

```json
{
  "object": "user",
  "id": "customer_42",
  "name": "Ana Silva",
  "created_at": "2026-11-26T15:48:59.498Z",
  "mandate": null,
  "session": null,
  "profile": null,
  "device": {
    "locale": "pt-PT",
    "timezone": "Europe/Lisbon",
    "country": "pt",
    "country_set": true,
    "since": "2026-11-26T15:48:59.500Z"
  },
  "limits": null,
  "accounts": []
}
```

## Test people and real people

People are kept apart by mode, like tasks. `marie` created with a test key and `marie` created with a live key are two people: their accounts, inboxes, emails, sessions, memory, mandate, limits and history never mix, and erasing one leaves the other whole. A test key never sees a real person.

- In test, create test people and store throwaway accounts for them. Do not copy the passwords of real people there.
- In live, nothing is shared with your tests. A person has to exist in live before a live task acts for them, or is created by that task.
- In the console, the Users screen follows the **Live** and **Test** switch.

## What a person keeps

| What | Default with a user | Turn it off |
| --- | --- | --- |
| **Device**: one browser profile, language, time zone and country | Always | |
| **Browser**: the person's whole browser profile, with cookies, each site's storage and sign-ins, saved at the end of a task and opened again at the next, like a person who comes back | On | `"keep_session": false` |
| **Memory**: lasting facts the agent learns about the person, never secrets | On | `"memory": false` |
| **Email inbox**: an address the agent can give sites to receive codes and links, read by itself | On | `"mailbox": false` |
| **Phone number**: receives the text messages sites send, when you gave the person one | On | `"phone": false` |
| **Stored accounts**: sign-in details the agent types without the model seeing them | When listed in `accounts` | |

## Keep the person signed in

With `keep_session` on, the person finds their browser as they left it: the cookies, what each site keeps in the browser (local storage and IndexedDB, where many apps keep the sign-in) and the site permissions. A site the person signed in to once stays signed in, like on their own computer.

`GET /v1/users/{id}` shows `session` (number of sites, last save) and `profile` (size in bytes, last save). `DELETE /v1/users/{id}/session` signs the person out everywhere: it deletes both.

## Stored accounts

Save the person's sign-in details for a site in the vault. They are sealed, and the agent types them into the browser without the model ever reading them.

```bash
curl -X PUT https://api.hapti.dev/v1/users/customer_42/accounts/insurer \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"origin": "https://portal.example.com", "username": "ana.silva", "password": "...", "totp_secret": "JBSWY3DPEHPK3PXP"}'
```

Then name the account in a task:

```json
{ "url": "https://portal.example.com", "goal": "Download my last statement.", "user": "customer_42", "accounts": ["insurer"] }
```

With `totp_secret`, the agent also fills the two-factor code. Secrets never appear in listings, task results or logs.

When you created an account for the person, for example a sign-up the agent did with a password you generated, you can read it back to show it to them:

```bash
curl -X POST https://api.hapti.dev/v1/users/customer_42/accounts/insurer/reveal \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"by": "Ana Silva, from her account page"}'
```

Each read is recorded in the person's history with `by`. An account the person typed themselves through a connect link is never shown, to you or anyone (`403`).

### Connect links

You may prefer never to hold the person's passwords at all. Create a connect link: a page, with your brand, where the person types their own details. You never see them.

```bash
curl https://api.hapti.dev/v1/users/customer_42/connect \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"accounts": [{"account": "insurer", "origin": "https://portal.example.com"}]}'
```

The answer holds a `url` to send to the person, and an `expires_at`. You receive a `user.account_connected` event once they are done.

## Mandates

A mandate records what the agent may do for the person, and how they agreed to it. It is kept with the person and with the proof of each task.

```bash
curl https://api.hapti.dev/v1/users/customer_42/mandate \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scope": "Declare insurance claims and download invoices", "given_by": "Ana Silva, in the app on 2026-11-20"}'
```

Add `sites` to limit it to some addresses and `until` to make it end. When a task must wait for a human decision before committing the person, create it with `"approval": "required"`.

## Limits per person

Protect yourself from a runaway loop or an abusive end user with limits per person:

```bash
curl -X PATCH https://api.hapti.dev/v1/users/customer_42 \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limits": {"tasks_per_day": 20, "cents_per_month": 500}}'
```

A task over a limit is refused with a clear error. Send `"limits": null` to remove them.

## Email and phone

- [`POST /v1/users/{user}/inbox`](api-users.md#open-an-email-inbox) opens a lasting address for the person, and [`GET /v1/users/{user}/emails`](api-users.md#list-received-emails) lists what it received.
- [`POST /v1/users/{user}/phone`](api-users.md#give-a-phone-number) gives the person a real number that receives texts. It needs a live key and is paid each month from your credit.

## Forget a person

[`DELETE /v1/users/{user}`](api-users.md#forget-a-person) erases the session, memory, stored accounts, mandate, inbox and received messages of the person. Use it when your customer closes their account or asks to be forgotten.

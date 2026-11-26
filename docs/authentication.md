# Authentication

> Source: [https://hapti.dev/docs/authentication](https://hapti.dev/docs/authentication). This copy is updated at each release.

> Authenticate with a bearer key. Test keys never submit your data to the sites, live keys do the task. Both pay for the actions that worked.

Every request carries an API key in the `Authorization` header:

```bash
curl https://api.hapti.dev/v1/me -H "Authorization: Bearer hp_test_..."
```

Create and revoke keys in the [console](https://app.hapti.dev), under **Developers**. A key belongs to your organisation and to one mode.

## Test and live

| | Test keys `hp_test_` | Live keys `hp_live_` |
| --- | --- | --- |
| Price | Each action that worked, from the same credit | Each action that worked |
| What the agent does | Works on the real site: opens pages, reads them, signs in with the person's stored accounts and fills forms. It holds back any request that would send the values you gave in `data`, so no form is submitted for real, and says so in its answer | Does the task for real |
| Data | Tasks, webhooks and events of the test mode only | Tasks, webhooks and events of the live mode |
| People | Test people only, with their own accounts, inboxes, sessions and memory | Real people only |

Build and test with a test key, then switch the key. Your code does not change.

## Projects

A key belongs to one project. Everything it creates (tasks, people and their stored accounts, tests, monitors, webhooks) stays in that project, and a key of another project never sees it. When you build several products on Hapti, make one project per product in the console, with its own keys: your team, your credit and your bill stay shared by the organisation. See [the console guide](console.md#create-a-project).

## OAuth for AI apps

AI apps such as Claude connect to the [MCP server](agents.md) with OAuth instead of a key: the person signs in to Hapti, chooses the organisation, one or several of its projects and the mode, and approves. The app then holds an access token that lasts one hour and renews itself, tied to that person. It stops working as soon as the connection is removed in **Developers**, or the person loses access to its projects. Hapti follows the MCP authorization specification: protected resource metadata at `/.well-known/oauth-protected-resource`, dynamic client registration, client metadata documents and PKCE.

An app sees the projects it was given and nothing else. When it was given several:

- Over MCP, it gets the tool `list_projects`, and every other tool except `list_templates` needs a `project`. A call without one is refused with the list of projects, so a task never starts in the wrong one.
- Over the REST API, it sends the id of the project in the header `Hapti-Project`.

The person also chooses what the app may do:

| Right | What it gives |
| --- | --- |
| **Use** (default) | Start and follow tasks and monitors, find out why something failed |
| **Develop**, for a coding agent | Also create projects, test keys and test webhook endpoints, test people and test accounts, and run [Hapti Test](test-apps.md) |

Limits that always apply:

- An app never has more rights than its person: a developer who cannot create a project or change webhooks in the console cannot do it through an app.
- An app never makes a live key, and never reads or changes members, invitations, payments or other connections.
- Through the REST API in live mode, an app reaches only the people created by the agents of its person. It never reveals a stored password, in either mode. The keys it makes are test keys: they see test data and test people only.
- Disconnecting an app revokes the keys it made. What it did is in the activity of the project, with its name.

## Keep keys secret

- Keep keys on your server, never in a browser, a mobile app or a public repository.
- Give each service its own key, so you can revoke one without stopping the others.
- Revoke a key at once if it leaks. Requests made with it are listed in **Developers, Requests**, with the address they came from.

A missing or wrong key gets a `401`:

```json
{
  "error": {
    "type": "authentication_error",
    "code": 401,
    "message": "a valid key is required: Authorization: Bearer hp_live_… or hp_test_…"
  }
}
```

# Hapti and the other ways to automate websites

> How Hapti compares with computer use models, cloud browsers and browser agent services, to pick the right tool for websites that have no API.

There are three families of tools for getting work done on websites that have no API. Each is the right choice for some teams. This page says plainly what each one gives you, as of November 2026; check each vendor's own pages for their current offer.

## Computer use models

OpenAI, Anthropic and Google offer models that can look at a screen and act. They are the brain only: you run the browsers, keep the sessions, handle sign-ins and codes, retry, store proof, and pay for every model call whether the task works or not.

Choose them when you want full control and have a team to build and run the rest.

## Cloud browsers

Browserbase, Steel, Hyperbrowser, Anchor Browser and others run browsers for you in the cloud, often with proxies, captcha handling and saved profiles. Some come with a framework, such as Stagehand, to write your own agent. You still write and maintain the agent logic, and you pay by browser time or usage.

Choose them when you already have an agent or scripts and need reliable browsers to run them.

## Browser agent services

Browser Use, Skyvern and Hapti give you the agent and the browsers together: you describe the task, the service does it.

What Hapti does differently:

| | Hapti |
| --- | --- |
| Billing | Only actions that worked are billed, $0.01 each; an action that fails costs nothing |
| Identity per person | Each of your users keeps their own browser, sign-ins, email inbox, phone number for codes and encrypted vault, from task to task |
| Asking the person | When a value is missing, the task waits with a question and a ready link the person can answer on, instead of guessing |
| Proof | Screenshots and the timeline of every action, for every task |
| Failure reasons | A stable code and a plain sentence when a task does not succeed |
| For AI agents | A remote MCP server with OAuth, ready for Claude, Cursor and agent frameworks |

## Which one to pick

- You need a specific click-by-click script on one site you control: a classic tool such as Playwright is enough.
- You build your own agent and want browsers: a cloud browser.
- You want the job done on websites you do not control, for real people, and to pay for results: a browser agent service such as Hapti.

Start with the [Quickstart](quickstart.md), or read [How Hapti bills](pricing.md).

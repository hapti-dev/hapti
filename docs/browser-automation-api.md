# Browser automation API for websites without an API

> Source: [https://hapti.dev/docs/browser-automation-api](https://hapti.dev/docs/browser-automation-api). This copy is updated at each release.

> Automate any website that has no API with one HTTP call. An agent uses a real browser by sight and returns the result with proof, billed for each action that works.

Many websites that matter to your users have no API: insurer and bank portals, town halls and public administrations, clinics, suppliers, utilities, marketplaces. Hapti is a browser automation API for them. You send a starting address and a goal in plain words, and an agent does the job in a real browser, like a person would, then returns the result.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://portal.example.com",
       "goal": "Download the latest invoice and give its total and due date.",
       "user": "claire",
       "output": {"type": "object", "properties": {"total": {"type": "number"}, "due_date": {"type": "string"}}}}'
```

## No selectors, no scripts to maintain

Classic browser automation (Playwright, Selenium, Puppeteer) breaks when a site changes a class name or moves a button. Hapti does not use selectors: the agent looks at the screen and acts on what it sees, so a redesign does not break your integration. You describe the outcome, not the clicks.

## Built for tasks done for real people

- **One identity per person**: each user keeps their own browser, sign-ins, email inbox, phone number for text-message codes and an encrypted vault of credentials the model never sees. See [Users and identity](users.md).
- **It asks instead of guessing**: when a value is missing, the task waits with a question that you or the person answer. See [Tasks](tasks.md).
- **Proof for every task**: screenshots and the timeline of every action. See [Proof](tasks.md#proof).
- **Structured results**: give a JSON Schema in `output` and the answer follows it, checked.
- **Files**: invoices, certificates and statements the site gives come back with the task. See [Files](files.md).

## Pay for the work done

A task pays $0.10 per 10 actions of the agent that worked, whatever its outcome. An action that fails costs nothing, in test as in live mode. See [Pricing and billing](pricing.md).

## Next steps

- [Quickstart](quickstart.md): your first task in five minutes.
- [Agent frameworks](frameworks.md): give the same power to an agent built with LangChain, the OpenAI Agents SDK, CrewAI or the Vercel AI SDK.

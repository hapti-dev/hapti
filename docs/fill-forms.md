# Fill in and submit online forms automatically

> Fill and submit online forms on websites with no API, from public administration to insurers, with the person's data, questions when something is missing and proof.

Online forms are everywhere: claims, applications, registrations, changes of address, cancellations. When the website offers no API, Hapti fills the form with the data you give, asks for what is missing, submits it and returns the confirmation.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://portal.example-insurer.com/claims",
       "goal": "Declare the water damage claim and give the claim number.",
       "user": "claire",
       "data": {"contract": "AX-4471", "date": "2026-11-20", "description": "Water leak from the upstairs flat"}}'
```

## Why it holds up in production

- **Never invents a value**: when the form asks for something that `data` does not give, the task waits with a question that you or the person answer.
- **Test mode**: with a test key the agent fills the form on the real site but never submits the data you give, so you can try a flow safely.
- **Files**: attach documents to upload with `files`.
- **Commit with care**: before an irreversible step the agent acts within the person's mandate, or asks for approval when you require it.
- **Proof**: screenshots of every step and the confirmation page.

See [Tasks](tasks.md), [Files](files.md) and [Users and identity](users.md).

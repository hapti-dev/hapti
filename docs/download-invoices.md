# Download invoices and documents from customer portals

> Fetch invoices, statements and certificates from supplier, utility and bank portals that have no API, with the files and their key figures returned to you.

Invoices and statements often sit in customer areas that offer no API or export. Hapti signs in as the person, finds the document and returns the file with the figures you need.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://customer.example-utility.com",
       "goal": "Download the latest invoice and give its number, total and due date.",
       "user": "claire",
       "accounts": ["utility"],
       "output": {"type": "object", "properties": {"number": {"type": "string"}, "total": {"type": "number"}, "due_date": {"type": "string"}}}}'
```

## How it works

- **Sign-in without exposing passwords**: save the person's credentials once in the encrypted vault and list the account in `accounts`; the agent types them, the model never sees them. See [Users and identity](users.md).
- **Two-factor codes**: codes sent by email or text message are read by the agent from the person's own inbox or number.
- **Files come back with the task**: every file the site gives is listed in `files` and can be downloaded with your key. See [Files](files.md).
- **Structured figures**: with an `output` schema, the result follows it, checked.

Run it every month with a [schedule](batches.md), each run billed for the actions of the agent that worked.

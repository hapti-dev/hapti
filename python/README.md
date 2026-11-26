# hapti

An agent that does tasks on any website by sight, in a real browser. You pay only for the actions that work.

Documentation: [hapti.dev/docs](https://hapti.dev/docs/) · API reference: [hapti.dev/docs/api-tasks](https://hapti.dev/docs/api-tasks) · For AI agents: [hapti.dev/llms.txt](https://hapti.dev/llms.txt)

```sh
pip install hapti
```

```python
from hapti import Hapti

hapti = Hapti()  # reads HAPTI_API_KEY

task = hapti.tasks.run({
    "url": "https://www.example.com",
    "goal": "Read the main title of the page",
    "output": {"type": "object", "required": ["title"], "properties": {"title": {"type": "string"}}},
})
print(task["result"]["data"]["title"])
```

When the site asks for something the task does not have, `on_waiting` gets it and what it returns is sent back:

```python
hapti.tasks.run(
    {"url": "https://portal.example.com", "goal": "Declare the claim", "data": {"contract": "AX-1"}, "user": "customer-42"},
    on_waiting=lambda pending, task: ask_my_user(pending["text"]),
)
```

`pending["action_url"]` is also a ready page you may send to your user yourself: they answer or approve on it, once, without any key.

Every `user` keeps their session, device and mailbox; every success becomes a recipe replayed next time; `output` gives `result["data"]` checked against your schema, and a task that cannot fit it ends incomplete.

```python
batch = hapti.batches.create({"template": {"url": url, "goal": goal}, "items": [{"user": c.id, "data": {"contract": c.contract}} for c in customers]})
for t in hapti.batches.tasks(batch["id"]):
    print(t["id"], t["status"])

hapti.schedules.create({"cron": "0 9 * * 1-5", "timezone": "Europe/Paris", "task": {"url": url, "goal": goal}})
hapti.tasks.estimate({"url": url, "goal": goal})
```

```python
from hapti import verify_webhook
verify_webhook(raw_body, headers["Hapti-Signature"], secret)
```

Test keys (`hp_test_...`) never send the data to the sites; live keys (`hp_live_...`) do the task for real. Both pay for each action that worked, from the same credit.

```python
link = hapti.users.connect_link("customer-42", accounts=[{"account": "bank", "origin": "https://www.my-bank.com", "label": "My bank"}], brand={"name": "Acme"})
hapti.users.set_limits("customer-42", tasks_per_day=20, cents_per_month=500)
hapti.users.usage("customer-42")["billed_cents"]
```

`link["url"]` is a page you send to your user yourself: they put their credentials in the vault and give their consent; you never see their secrets.

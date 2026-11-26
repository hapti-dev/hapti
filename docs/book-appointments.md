# Automate appointment booking on any website

> Source: [https://hapti.dev/docs/book-appointments](https://hapti.dev/docs/book-appointments). This copy is updated at each release.

> Book appointments on clinics, town halls and booking sites that have no API: the agent finds a slot, asks before committing and returns the confirmation.

Appointments live on clinic websites, town hall portals and booking platforms, and very few of them offer an API. With Hapti your application asks for the appointment in plain words and gets back the confirmation.

```bash
curl https://api.hapti.dev/v1/tasks \
  -H "Authorization: Bearer $HAPTI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example-clinic.com",
       "goal": "Book the first available appointment with a dermatologist next week, in the morning, and give the date, time and confirmation number.",
       "user": "claire",
       "data": {"first_name": "Claire", "last_name": "Martin", "phone": "+33 6 12 34 56 78"}}'
```

## What happens

1. The agent opens the site in the person's own browser, already signed in if they were before.
2. It searches, compares the slots and picks the one that fits the goal.
3. Before the step that commits the person, it acts within the [mandate](users.md) they gave you, or asks for approval when you require it.
4. A code sent by email or text message is read by the agent itself from the person's inbox or phone number.
5. You get the date, the time and the confirmation number, as text or as structured data with an `output` schema, plus the proof.

Only a booked appointment is billed. See [Tasks](tasks.md) and [Users and identity](users.md).

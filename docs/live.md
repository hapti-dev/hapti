# Live updates

> Follow a Hapti task step by step as it happens with Server-Sent Events, or every task of your organisation at once.

Hapti streams what happens with [Server-Sent Events](https://developer.mozilla.org/docs/Web/API/Server-sent_events). It is the fastest way to show progress in your app, and the libraries use it to return as soon as a task ends.

## Follow one task

:::tabs
```js JavaScript
for await (const e of hapti.tasks.stream('tsk_...')) {
  if (e.event === 'step') console.log(e.data.summary);
  if (e.event === 'task') console.log('status', e.data.status);
}
```
```python Python
for e in hapti.tasks.stream("tsk_..."):
    if e["event"] == "step":
        print(e["data"].get("summary"))
    if e["event"] == "task":
        print("status", e["data"]["status"])
```
```bash cURL
curl -N https://api.hapti.dev/v1/tasks/tsk_.../stream \
  -H "Authorization: Bearer $HAPTI_API_KEY"
```
:::

| Event | Data | When |
| --- | --- | --- |
| `task` | The full task | First, then each time its status, question, result or price changes |
| `step` | One action of the agent, with a `summary` | Each time the agent acts |
| `screenshot` | `n` and the `url` of the image | Each time a screenshot is saved |
| `done` | `id` and final `status` | Once, at the end. The stream then closes |
| `reconnect` | `reason` | After 30 minutes: connect again |

Each `step` carries an `id`. If the connection drops, connect again with the header `Last-Event-ID` set to the last id you received, and the stream resumes right after it, without gaps or repeats. The libraries do this for you.

A comment line `: ping` is sent every 15 seconds so proxies keep the connection open.

## Show the screen

To show one picture per action, download each screenshot as it arrives with `hapti.tasks.screenshot(id, n)` in JavaScript or Python, or a `GET` on its `url` with your key.

To watch the browser as it works, open the live view. It is an MJPEG stream (`multipart/x-mixed-replace`): a new JPEG picture arrives each time the screen changes, about two a second at most.

```bash
curl -N https://api.hapti.dev/v1/tasks/tsk_.../live \
  -H "Authorization: Bearer $HAPTI_API_KEY" -o live.mjpeg
```

| Answer | Meaning |
| --- | --- |
| `200` | The stream. Each part has `Content-Type: image/jpeg`, `Content-Length`, `X-Frame` (its number), `X-Frame-Width` and `X-Frame-Height` |
| `204` | The task has no browser now: it waits, or it is over |
| `503` | Too many live views are open. Try again after `Retry-After` seconds, and show the screenshots meanwhile |

- Open it only while somebody is looking, and close it when they leave: the browser sends pictures only to a live view that is open.
- A view closes when the task ends, and after 10 minutes at most: open it again.
- Pictures stop while a saved password, username or code is in a field of the page, and come back after. The live view is never stored.
- Never put your key in a web page: open the stream on your server and pass it on.

## Wait for the end with the libraries

`tasks.wait` and `tasks.run` follow the stream and return the moment the task is over. They fall back to asking for the task at intervals when a stream cannot be opened.

```js
const task = await hapti.tasks.run(
  { url: 'https://portal.example.com', goal: 'Download my last statement.' },
  { onStep: (s) => progress(s.summary) },
);
```

## Follow every task

`GET /v1/stream` sends a `task` event each time any task of the key mode changes state. Use it to keep a dashboard up to date.

```bash
curl -N https://api.hapti.dev/v1/stream -H "Authorization: Bearer $HAPTI_API_KEY"
```

> **Tip** For a server that must not miss anything, even while it is down, use [webhooks](webhooks.md) and the [events API](events.md). Streams are for live display.

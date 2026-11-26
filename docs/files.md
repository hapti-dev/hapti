# Files

> Give Hapti tasks documents to read or upload, such as screenshots, scans and PDFs, and download the documents a site gave during a task.

## Files the agent reads or uploads

Give `files` with the task. The agent uses them in two ways:

- **It reads them**: a screenshot of an email, a photo of a letter, a scanned form, a PDF or a text file. It looks at them and types the values they hold on the site, so you do not have to turn them into `data` first. Name them clearly in the goal, for example "with the details of the insurer's email screenshot".
- **It uploads them** when the site asks for documents, such as an identity card, a proof of address or an invoice.

Each file has a `name` and either its content in `base64`, or an https `url` where Hapti fetches it.

```json
{
  "url": "https://portal.example.com/apply",
  "goal": "Submit the application with the documents.",
  "files": [
    { "name": "passport.pdf", "url": "https://files.example.com/signed/abc" },
    { "name": "proof-of-address.jpg", "base64": "/9j/4AAQSkZJRg..." }
  ]
}
```

Up to 20 files, 50 MB each and 100 MB in all. Two files cannot share a name. A file given in `base64` can be read back with `GET /v1/tasks/{id}/inputs/{name}`; the console shows them on the task page. In the console, files are added on the playground by dropping them, choosing them or pasting a screenshot.

## Files the site gives

When the site gives a document during the task, the agent keeps it. A finished task lists them in `files`, each with a `url` you download with your key:

```bash
curl -OJ https://api.hapti.dev/v1/tasks/tsk_.../files/invoice-2026-11.pdf \
  -H "Authorization: Bearer $HAPTI_API_KEY"
```

Files are kept with the proof of the task, and only your organisation can download them.

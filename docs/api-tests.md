# Tests API

> Reference of the Hapti tests endpoints: parameters, fields and real responses.

Every endpoint takes a key in the Authorization header: `Authorization: Bearer hp_test_...`. Base address: `https://api.hapti.dev`. The full specification is in [openapi.json](/openapi.json).

## Run tests on your app

```http
POST /v1/test-runs
```

Runs end-to-end tests written in plain words against an application. Each test is a task; a failed check is run once more before it is called a bug. Returns at once with the run, then follow it with GET.

| Field | Type | Description |
| --- | --- | --- |
| `url` (required) | string | Address of the application to test |
| `tests` (required) | array |  |
| `commit` | string |  |
| `branch` | string |  |

```json Request
{
  "url": "https://staging.example.com",
  "tests": [
    {
      "name": "checkout",
      "text": "Add the Nord lamp to the cart and go to payment.\n\nCheck:\n- the cart shows 1 item\n- the VAT is 20 %"
    }
  ],
  "commit": "c0ffee",
  "branch": "feat/vat"
}
```

## List test runs

```http
GET /v1/test-runs
```

The latest runs, newest first.

## Get a test run

```http
GET /v1/test-runs/{id}
```

The verdict of each test, with its checks (expected, observed), proof link and cost.

| Parameter | In | Description |
| --- | --- | --- |
| `id` | path | Test run id |

# Hapti Test action

Runs the end-to-end tests of `.hapti/tests/*.md` against your app at every pull request. Each test is written in plain words; an agent does the journey in a real browser and gives a verdict with proof.

```yaml
name: Hapti Test
on: pull_request
jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v7
      - uses: hapti-dev/hapti/actions/test@v1
        with:
          url: ${{ env.PREVIEW_URL }}
          api-key: ${{ secrets.HAPTI_API_KEY }}
```

The job fails only on a confirmed bug (set `fail-on-could-not-test: true` to fail when a test could not run too). The verdicts appear as a comment on the pull request, updated at each run, in the job summary, and as annotations; a JUnit report is written to `hapti-test.xml`.

Docs: https://hapti.dev/docs/test-apps

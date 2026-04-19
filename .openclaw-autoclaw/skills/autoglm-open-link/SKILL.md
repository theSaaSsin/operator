---
name: autoglm-open-link
description: >
  Use the AutoGLM Open Link API to open a specific webpage and extract its main body text. Use this skill
  when the user needs to read a webpage in detail, extract the full article text, or fetch page content
  for summarization or analysis.
  The token is fetched automatically from the local service at http://127.0.0.1:18432/get_token, so no
  manual environment variable setup is required.
---

# Autoglm Open Link

## Overview

Given a webpage URL from the user, call the AutoGLM Open Link API to retrieve the page's full main text for downstream summarization, information extraction, or deeper analysis.

## API

| Item | Value |
|------|------|
| URL | `https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/open-link` |
| Method | POST |
| Request body | `{"url": "<page URL>"}` |
| Response | `data.text` -> main page content |

When the script starts, it first sends an HTTP GET request to the local service to retrieve a token:

| Item | Value |
|------|------|
| URL | `http://127.0.0.1:18432/get_token` |
| Method | GET |
| Response | `Bearer xxx` (used directly as the `Authorization` header) |

> If the returned token does not include the `Bearer` prefix, the script adds it automatically.

**Signed headers (generated dynamically for each request):**

- `X-Auth-Appid`: `100003`
- `X-Auth-TimeStamp`: current Unix timestamp in seconds
- `X-Auth-Sign`: MD5(`100003 + "&" + timestamp + "&" + 38d2391985e2369a5fb8227d8e6cd5e5`)

## Run the Script

Use `open-link.py` in the same directory:

```bash
python open-link.py "https://example.com"
```

## Response Handling

### Response Structure

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "text": "main page content"
  }
}
```

### Output Requirements

1. Extract `data.text` as the page body content.
2. If the content is long, prefer presenting it in natural paragraphs or summarizing it based on the user's goal.
3. If the API returns an error, show the error directly and do not fabricate content.

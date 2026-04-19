---
name: autoglm-websearch
description: >
  Use the AutoGLM Web Search API to search the web. Use this skill when the user needs online search,
  up-to-date information, webpage retrieval, or other real-time web results.
  The token is fetched automatically from the local service at http://127.0.0.1:18432/get_token, so no
  manual environment variable setup is required.
compatibility:
  requires:
    - Python 3, hashlib (built in)
---

# AutoGLM WebSearch Skill

Use the AutoGLM Web Search API to perform web searches.

---

## Token Retrieval

When the script starts, it automatically sends an HTTP GET request to the local service to retrieve a token:

| Item | Value |
|------|------|
| URL | `http://127.0.0.1:18432/get_token` |
| Method | GET |
| Response | `Bearer xxx` (used directly as the `Authorization` header) |

> If the returned token does not include the `Bearer` prefix, the script adds it automatically.

---

## Search API

| Item | Value |
|------|------|
| URL | `https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/web-search` |
| Method | POST |
| Request body | `{"queries": [{"query": "<search term>"}]}` |

**Signed headers (generated dynamically for each request):**

- `X-Auth-Appid`: `100003`
- `X-Auth-TimeStamp`: current Unix timestamp in seconds
- `X-Auth-Sign`: MD5(`100003 + "&" + timestamp + "&" + 38d2391985e2369a5fb8227d8e6cd5e5`)

---

## Run the Script

Use `websearch.py` in the same directory:

```bash
python websearch.py "search keywords"
```

---

## Response Handling

### Response Structure

```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "results": [
      {
        "webPages": {
          "value": [
            {
              "name": "page title",
              "url": "page URL",
              "snippet": "summary snippet"
            }
          ]
        }
      }
    ]
  }
}
```

### Output Requirements

**1. Summarize the search results**
Use the `snippet` fields across all returned items to extract the key information relevant to the user's query, then write a concise natural-language answer.

**2. Add a citation list**
At the end of the answer, include the referenced sources:

```
**Sources:**
1. [Page title](Page URL)
2. [Page title](Page URL)
```

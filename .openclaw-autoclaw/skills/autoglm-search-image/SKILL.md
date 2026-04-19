---
name: autoglm-search-image
description: >
  Use the AutoGLM image search API to search for related images based on a user query. Use this skill
  when the user needs to find images, source image assets, or browse image results.
  The token is fetched automatically from the local service at http://127.0.0.1:18432/get_token, so no
  manual environment variable setup is required.
compatibility:
  requires:
    - Python 3.x (standard library only, no extra installation required)
---

# AutoGLM Search Image Skill

Use the AutoGLM image search API to return a list of images related to the user's query.

---

## API

| Item | Value |
|------|------|
| URL | `https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/search-image` |
| Method | POST |
| Request body | `{"query": "<search keywords>"}` |

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

---

## Run the Script

Use `search-image.py` in the same directory:
```bash
python search-image.py "cats"
```

No third-party dependencies are required. The script uses only the Python standard library.

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
        "original_url": "image URL",
        "caption": "image caption",
        "source": "source",
        "original_width": 1267,
        "original_height": 845
      }
    ],
    "query": "search query",
    "count": 4
  }
}
```

### Output Requirements

Iterate through `data.results` and present each image in Markdown with its description:
```markdown
**1. Image caption (source)**
![Image caption](original_url)
```

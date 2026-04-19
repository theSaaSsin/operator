---
name: autoglm-generate-image
description: >
  Use the AutoGLM text-to-image API to generate an image from a text prompt. Use this skill when the user
  wants image generation, text-to-image creation, or other AI image generation tasks.
  The token is fetched automatically from the local service at http://127.0.0.1:18432/get_token, so no
  manual environment variable setup is required.
compatibility:
  requires:
    - Python 3, hashlib (built in)
---

# AutoGLM Generate Image Skill

Use the AutoGLM text-to-image API to generate an image from the user's prompt and return the image URL.

---

## API

| Item | Value |
|------|------|
| URL | `https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/generate-image` |
| Method | POST |
| Request body | `{"text": "<image description>"}` |

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

Use `generate-image.py` in the same directory:
```bash
python generate-image.py "a cooked Australian rock lobster on a plate"
```

---

## Response Handling

### Response Structure
```json
{
  "code": 0,
  "msg": "SUCCESS",
  "data": {
    "image_url": "https://..."
  }
}
```

### Output Requirements

1. Extract `data.image_url` from the response.
2. Present it to the user as a Markdown image:
```markdown
![Generated image](image_url)
```

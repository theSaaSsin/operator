#!/usr/bin/env python3
# generate-image.py — AutoGLM text-to-image
# Usage: python generate-image.py "image description"

import sys
import json
import hashlib
import time
import urllib.request

# Configuration
APP_ID  = "100003"
APP_KEY = "38d2391985e2369a5fb8227d8e6cd5e5"
URL     = "https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/generate-image"
TOKEN_URL = "http://127.0.0.1:18432/get_token"

# Step 1: Retrieve the token
try:
    with urllib.request.urlopen(TOKEN_URL) as resp:
        token = resp.read().decode("utf-8").strip()
except Exception as e:
    print(f"ERROR: Failed to retrieve token from the local service: {e}")
    sys.exit(1)

if not token:
    print("ERROR: The retrieved token is empty.")
    sys.exit(1)

if not token.lower().startswith("bearer "):
    token = f"Bearer {token}"

# Step 2: Read the image prompt
if len(sys.argv) < 2:
    print('Usage: python generate-image.py "image description"')
    sys.exit(1)

text = sys.argv[1]

# Step 3: Generate the signed headers
timestamp = str(int(time.time()))
sign_data = f"{APP_ID}&{timestamp}&{APP_KEY}"
sign      = hashlib.md5(sign_data.encode("utf-8")).hexdigest()

# Step 4: Send the request
payload = json.dumps({"text": text}).encode("utf-8")
headers = {
    "Authorization":    token,
    "Content-Type":     "application/json",
    "X-Auth-Appid":     APP_ID,
    "X-Auth-TimeStamp": timestamp,
    "X-Auth-Sign":      sign,
}

req = urllib.request.Request(URL, data=payload, headers=headers, method="POST")
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read().decode("utf-8"))
    print(json.dumps(result, ensure_ascii=False, indent=2))

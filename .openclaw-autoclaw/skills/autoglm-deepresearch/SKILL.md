---
name: autoglm-deepresearch
description: >
  Use this skill for structured deep research on a user topic. It is intended for topic exploration,
  industry research, focused analysis, and competitor research.
  Unlike plain search, deepresearch should do a small number of targeted searches and then read a small
  number of key pages in depth, showing intermediate findings before producing a final synthesis so the
  workflow stays useful without becoming slow.
  The token is fetched automatically from the local service at http://127.0.0.1:18432/get_token, so no
  manual environment variable setup is required.
compatibility:
  requires:
    - Python 3.x (standard library only, no extra installation required)
---

# AutoGLM DeepResearch Skill

Perform a small amount of targeted search plus limited deep reading, show intermediate findings first, and then produce a structured research report.

---

## Dependent APIs

### 1. Web Search

| Item | Value |
|------|------|
| URL | `https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/web-search` |
| Method | POST |
| Request body | `{"queries": [{"query": "<search term>"}]}` |
| Response | `data.results[].webPages.value[]` -> `name / url / snippet` |

### 2. Open Link

| Item | Value |
|------|------|
| URL | `https://autoglm-api.autoglm.ai/agentdr/v1/assistant/skills/open-link` |
| Method | POST |
| Request body | `{"url": "<page URL>"}` |
| Response | `data.text` -> main page content |

When the scripts start, they first send an HTTP GET request to the local service to retrieve a token:

| Item | Value |
|------|------|
| URL | `http://127.0.0.1:18432/get_token` |
| Method | GET |
| Response | `Bearer xxx` (used directly as the `Authorization` header) |

> If the returned token does not include the `Bearer` prefix, the scripts add it automatically.

Both APIs use the same signed headers:

- `X-Auth-Appid`: `100003`
- `X-Auth-TimeStamp`: current Unix timestamp in seconds
- `X-Auth-Sign`: MD5(`100003 + "&" + timestamp + "&" + 38d2391985e2369a5fb8227d8e6cd5e5`)

---

## Run the Scripts

Use the scripts in the same directory:
```bash
# Search
python web-search.py "search keywords"

# Open a page
python open-link.py "https://example.com"
```

---

## Deep Research Workflow

When the user gives you a research topic, follow these steps:

### Step 1: Break the topic into sub-questions

Break the topic into 1 or 2 key search directions. Do not expand into too many sub-questions. Prioritize the dimensions most likely to answer the user's question directly, such as:
- background and definition
- current state or key data
- representative examples, only when clearly necessary

If the user's question is already specific, go straight to search instead of creating extra sub-questions.

### Step 2: Run a small number of searches

Call `web-search.py` for **1 to 2 searches** and keep the total volume tightly controlled:

- Start with 1 search by default.
- Run a second search only if the first one is clearly insufficient, low quality, or missing an important dimension.
- Do not mechanically expand the number of searches for the sake of completeness.

After each search, organize and show intermediate findings before deciding whether to continue. At minimum, intermediate findings should include:

- the query used for this search
- 2 to 5 of the most relevant results with `name / url / snippet`
- a short judgment on whether the current information is sufficient

### Step 3: Select important pages for deep reading

Select **1 to 3** of the most relevant page URLs from the search results, then call `open-link.py` to retrieve the full page text in `data.text`.

Control rules:

- Open only 1 page by default.
- Increase to 2 or 3 pages only if the first page is insufficient, has an obvious gap, or cross-checking is needed.
- Do not open many similar sources in bulk.

Selection criteria:
- rich snippets with high relevance to the topic
- authoritative sources such as official sites, well-known media, or academic institutions
- avoid duplicate sources

After opening each page, show intermediate extracted findings before continuing. These intermediate findings should usually include:

- the page title or URL
- 3 to 6 key points
- a short note on why the page is relevant to the user's question

If the first 1 or 2 pages already answer the question, stop there.

### Step 4: Synthesize and write the report

After the limited search and limited deep reading are complete, provide a short "intermediate conclusion / current findings" section before the final synthesis.

Combine the search snippets and page text into a report with the following structure:
```
# [Topic Name] Deep Research Report

## Intermediate Findings
(List the key facts already confirmed during search and page reading, the main sources, and any remaining open questions.)

## Overview
(Summarize the core conclusion in 2 to 3 sentences.)

## Background
(Basic definition and background of the topic.)

## Current State Analysis
(Key data and current-state description.)

## Representative Cases or Viewpoints
(Concrete examples or relevant perspectives.)

## Trends
(Likely future direction or trajectory.)

## Conclusion
(Overall conclusion and recommendations.)

## Sources
1. [Page title](URL)
2. [Page title](URL)
...
```

## Execution Constraints

- Call `web-search.py` at most 2 times.
- Call `open-link.py` at most 3 times.
- Prefer fewer calls and faster turnaround. Sufficient coverage is enough; do not aim for exhaustive retrieval.
- After each search or page open, surface intermediate findings as early as possible.
- As soon as the available information is enough to answer the user's question, stop further calls and move to synthesis.

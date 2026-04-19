---
name: news-aggregator
version: 1.0.3
description: Aggregates domestic and international news on society, technology, and military. Automatically searches, filters, and summarizes key points.
license: MIT
---

# News Aggregator

Aggregates domestic and international news on society, technology, and military topics, with automatic filtering and summarization.

## News Sources

### Domestic Tech
- 36Kr (https://36kr.com/information/tech/)
- Synced / Jiqizhixin (https://www.jiqizhixin.com/)
- QbitAI (https://www.1baijia.com/)
- IT Home (https://www.ithome.com/)

### Domestic Military
- Guancha (https://www.guancha.cn/)
- The Paper (https://www.thepaper.cn/)
- QQ Military (https://new.qq.com/om/mil/)

### International Tech
- TechCrunch
- The Verge
- Wired
- Ars Technica

### International Military
- Defense News
- Jane's Defence
- Military Times

## Workflow

1. **Search** — Use tavily or web_fetch to query each source
2. **Filter** — Remove duplicates, expired items, and unreliable sources
3. **Organize** — Categorize results; each item includes title, source, and key points
4. **Output** — Generate a structured summary

## Credibility Rules

**Prioritize:**
- Official media reports
- Authoritative institutional publications

**Use caution with:**
- Forum posts
- Anonymous tips
- Second-hand reposts

## Output Format

```markdown
## Tech News

1. [Title](link)
   Source: xxx | Time: xxx
   Key point: xxx

## Military News

1. [Title](link)
   Source: xxx | Time: xxx
   Key point: xxx
```

"""
Operator Tool Kit — Scrapling sidecar
=====================================
A FastAPI service that wraps Scrapling and exposes scan endpoints
to the Node Operator server at http://localhost:4000.

Run with Pinokio (see pinokio.js one dir up) or manually:

  python -m venv .venv
  source .venv/bin/activate      # or  .venv\\Scripts\\activate  on Windows
  pip install -r requirements.txt
  uvicorn app:app --host 127.0.0.1 --port 5001
"""
from __future__ import annotations
import asyncio, time, re, urllib.parse as up
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from scrapling.fetchers import Fetcher, StealthyFetcher
    SCRAPLING_OK = True
except Exception as e:  # noqa
    SCRAPLING_OK = False
    IMPORT_ERR = repr(e)

app = FastAPI(title="Operator Tool Kit · Scrapling", version="0.1.0")

# Allow Operator (localhost:4000) + Pinokio browser + file:// to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────────────────────────────────────────────────────────────────
# Health / metadata — Operator polls this to light up the Tool Kit
# ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "scrapling",
        "version": "0.1.0",
        "scrapling_loaded": SCRAPLING_OK,
        "error": None if SCRAPLING_OK else IMPORT_ERR,
        "ts": int(time.time() * 1000),
        "capabilities": [
            "scan.generic",
            "scan.google-maps",
            "scan.yell",
            "scan.reddit",
            "scan.stealth",
        ],
    }


@app.get("/capabilities")
def capabilities():
    """Manifest — Operator uses this to render the Tool Kit UI."""
    return {
        "service": "scrapling",
        "label": "Scrapling",
        "tagline": "Stealth scraper for Lead Feed sources",
        "install_hint": "pinokio / pip install scrapling[fetchers]",
        "endpoints": [
            {"id": "generic", "path": "/scan/generic",
             "label": "Generic URL + CSS selector",
             "params": [
                 {"name": "url", "type": "url", "required": True},
                 {"name": "selector", "type": "text", "required": False,
                  "placeholder": "h2.title, .price, etc."},
                 {"name": "stealth", "type": "bool", "default": False},
             ]},
            {"id": "google_maps", "path": "/scan/google-maps",
             "label": "Google Maps local businesses",
             "params": [
                 {"name": "query", "type": "text", "required": True,
                  "placeholder": "plumbers near Manchester"},
                 {"name": "limit", "type": "int", "default": 20},
             ]},
            {"id": "yell", "path": "/scan/yell",
             "label": "Yell.com UK directory",
             "params": [
                 {"name": "query", "type": "text", "required": True},
                 {"name": "location", "type": "text", "required": False},
             ]},
            {"id": "reddit", "path": "/scan/reddit",
             "label": "Reddit intent-signal scanner (stealth)",
             "params": [
                 {"name": "keyword", "type": "text", "required": True,
                  "placeholder": "need clients, no bookings..."},
                 {"name": "limit", "type": "int", "default": 25},
             ]},
        ],
    }


# ────────────────────────────────────────────────────────────────────
# Core scan endpoints
# ────────────────────────────────────────────────────────────────────
def _require_scrapling():
    if not SCRAPLING_OK:
        raise HTTPException(
            status_code=503,
            detail=f"Scrapling not installed. Run pip install 'scrapling[fetchers]'. Err: {IMPORT_ERR}",
        )


class GenericScanBody(BaseModel):
    url: str
    selector: Optional[str] = None
    stealth: bool = False


@app.post("/scan/generic")
def scan_generic(body: GenericScanBody) -> Dict[str, Any]:
    _require_scrapling()
    t0 = time.time()
    fetcher = StealthyFetcher if body.stealth else Fetcher
    try:
        page = fetcher.fetch(body.url) if body.stealth else fetcher.get(body.url)
    except Exception as e:
        raise HTTPException(500, f"fetch failed: {e}")
    items: List[str] = []
    if body.selector:
        try:
            items = page.css(body.selector + "::text").getall() or []
        except Exception:
            items = []
    return {
        "ok": True,
        "url": body.url,
        "status": getattr(page, "status", None),
        "ms": int((time.time() - t0) * 1000),
        "title": _safe_css(page, "title::text"),
        "count": len(items),
        "items": items[:200],
        "excerpt": (page.text or "")[:600] if hasattr(page, "text") else None,
    }


@app.get("/scan/reddit")
def scan_reddit(keyword: str = Query(..., min_length=2),
                limit: int = 25) -> Dict[str, Any]:
    """Scan Reddit old.reddit search with stealth — complements Node's JSON fetch."""
    _require_scrapling()
    q = up.quote(keyword)
    url = f"https://old.reddit.com/search?q={q}&sort=new&restrict_sr=off"
    t0 = time.time()
    try:
        page = StealthyFetcher.fetch(url)
    except Exception as e:
        raise HTTPException(500, f"reddit fetch failed: {e}")
    results = []
    # old.reddit selector pattern — title, subreddit, author, time, permalink
    for link in (page.css("div.search-result-link") or [])[:limit]:
        title = _safe_css(link, "a.search-title::text")
        href  = _safe_css(link, "a.search-title::attr(href)")
        sub   = _safe_css(link, "a.search-subreddit-link::text")
        author = _safe_css(link, "a.search-author a::text")
        when  = _safe_css(link, "time::attr(title)")
        if title and href:
            results.append({
                "title": title.strip(),
                "url": href,
                "subreddit": sub,
                "author": author,
                "when": when,
            })
    return {
        "ok": True, "source": "reddit", "keyword": keyword,
        "ms": int((time.time() - t0) * 1000),
        "count": len(results), "results": results,
    }


@app.get("/scan/google-maps")
def scan_google_maps(query: str = Query(..., min_length=2),
                     limit: int = 20) -> Dict[str, Any]:
    _require_scrapling()
    q = up.quote(query)
    url = f"https://www.google.com/maps/search/{q}/"
    t0 = time.time()
    try:
        page = StealthyFetcher.fetch(url, network_idle=True)
    except TypeError:
        page = StealthyFetcher.fetch(url)
    except Exception as e:
        raise HTTPException(500, f"gmaps fetch failed: {e}")
    raw = page.text or ""
    # Google Maps embeds business data in JSON blobs — pull names & phones
    names = list(set(re.findall(r'"([A-Z][A-Za-z0-9 &\'\.\-]{3,60})"\s*,\s*null\s*,\s*\[null', raw)))[:limit]
    phones = list(set(re.findall(r'(\+?\d[\d\s\-\(\)]{8,})', raw)))[:limit]
    return {
        "ok": True, "source": "google_maps", "query": query,
        "ms": int((time.time() - t0) * 1000),
        "names": names, "phones": phones[:limit],
        "count": len(names),
    }


@app.get("/scan/yell")
def scan_yell(query: str = Query(..., min_length=2),
              location: Optional[str] = None) -> Dict[str, Any]:
    _require_scrapling()
    q = up.quote(query); loc = up.quote(location or "UK")
    url = f"https://www.yell.com/ucs/UcsSearchAction.do?keywords={q}&location={loc}"
    t0 = time.time()
    try:
        page = StealthyFetcher.fetch(url)
    except Exception as e:
        raise HTTPException(500, f"yell fetch failed: {e}")
    results = []
    for card in (page.css(".businessCapsule") or [])[:30]:
        results.append({
            "name": _safe_css(card, ".businessCapsule--name::text"),
            "phone": _safe_css(card, ".business--telephoneNumber::text"),
            "addr": _safe_css(card, ".businessCapsule--address::text"),
            "rating": _safe_css(card, ".starRating--average::text"),
        })
    results = [r for r in results if r.get("name")]
    return {"ok": True, "source": "yell", "query": query, "location": location,
            "ms": int((time.time() - t0) * 1000),
            "count": len(results), "results": results}


# ────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────
def _safe_css(node, selector):
    try:
        v = node.css(selector).get()
        return (v or "").strip() or None
    except Exception:
        return None


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)

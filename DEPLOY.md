# Landing Page Deploy — Vercel or GitHub Pages

The Operator app is **private** (runs on your machine only).
The Lovable landing (`public/studio.html`) is what goes public.
Two deploy options — pick one (or both).

---

## Option A — Vercel  (recommended, instant + free domain)

**Live URL after first deploy:** `https://thesaassin-landing.vercel.app` (or whatever you name the project)

```bash
# one-time
npm i -g vercel
vercel login
vercel link        # answer "no" to "link to existing?", then create new project
                   # framework preset: Other
                   # output dir: public  (vercel.json already sets this)

# every deploy
vercel --prod
```

**What gets deployed:** only `public/studio.html` + `public/assets/` + `public/brand/`.
Everything else (server.js, ai/, memory/, operator.*) is excluded by `.vercelignore`.

**Custom domain:**
Vercel dashboard → Project → Settings → Domains → Add (e.g. `thesaassin.com`).
DNS records Vercel gives you:
- `A    @     76.76.21.21`
- `CNAME www  cname.vercel-dns.com`

---

## Option B — GitHub Pages  (free, lives at github.io/<repo>)

**Live URL after first deploy:** `https://<your-username>.github.io/<repo-name>/`
For `theSaaSsin/thesaassin` repo → `https://thesaassin.github.io/thesaassin/`.

### One-time setup
1. Push the landing repo to GitHub (e.g. `theSaaSsin/thesaassin`).
2. GitHub → repo → **Settings → Pages → Source** = **GitHub Actions**.
3. Push to `main` (or run **Actions → Deploy Landing to GitHub Pages → Run workflow**).

The `.github/workflows/pages.yml` workflow:
- Stages `public/studio.html` as `index.html`
- Copies `assets/`, `brand/`, `favicon.ico`
- Drops a 404 fallback that lands on the marketing page
- Deploys to GitHub Pages via the official action

### Custom domain on GH Pages
1. Add a `CNAME` file containing your domain to `_site/` (or repo root for source mode).
2. DNS:
   - `A     @  185.199.108.153` (and `109/110/111`)
   - `CNAME www  <user>.github.io`

---

## Which should you pick?

| | Vercel | GitHub Pages |
|---|---|---|
| Setup time | ~2 min | ~5 min (workflow runs) |
| Custom domain | one-click | manual DNS + CNAME file |
| Free SSL | yes | yes |
| Build pipeline | optional | always via Actions |
| Best for | iterating fast | "set & forget" |

**Recommendation:** Start with **Vercel** for the speed; mirror to **Pages** later for redundancy.

---

## Privacy guarantee

Both deploys ship **only** the marketing landing.
The Operator app (`/operator.html` + `/api/*`) stays local — gated by `OPERATOR_PASSWORD`.
Verify: open the deployed URL, try `/operator.html` → it 404s on Pages and 307-redirects to `/studio.html` on Vercel.

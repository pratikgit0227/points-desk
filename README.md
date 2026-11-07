# Points Desk

Credit card reward points calculator for Indian cards. Enter your points balance and see every transfer partner ranked by ₹ value, which card gives the most for each partner, and where the points can take you (award flights from India and hotel nights), with a how-to-book guide for each of the 31 partners.

Cards: Axis Atlas, Horizon, Magnus and Magnus for Burgundy (EDGE), HDFC Infinia / Diners Club Black, HDFC Regalia Gold, Amex Membership Rewards, HSBC TravelOne, Scapia.

- Transfer ratios checked 25 Sep 2026, including Axis's 23 Sep 2026 changes
- Axis annual Group A / Group B transfer caps are applied
- ₹ value per partner point can be edited; balances and values are saved in the browser only
- Paste a statement email or bank SMS and the balances are read out of it in the browser (free, nothing is sent anywhere)

Check the current ratio on your bank's portal before transferring. Transfers can't be reversed.

## Stack

- **Next.js 16** (App Router, TypeScript), deployed on **Vercel**
- Pattern-matching reader for bank SMS/emails (`src/lib/parse-balance.ts`), with an optional AI fallback (AI SDK 7 + Vercel AI Gateway, off by default)
- **Vitest** for the calculation tests

## Project layout

```
src/
  app/
    page.tsx              the app (one page)
    layout.tsx            fonts, metadata
    globals.css           all styles (light + dark)
    api/
      extract/route.ts    POST { text } → balances via AI (optional, off unless ENABLE_AI_EXTRACT=1)
      data/route.ts       GET  all partner, card and guide data as JSON (static)
      health/route.ts     GET  liveness + whether the AI reader is on
  components/             one component per section, plus store.tsx (app state)
  lib/
    data/                 partners, cards & ratios, guides, merchants, fares  ← edit data here
    calc/                 all the maths, no UI; calc.test.ts covers it
    server/               AI extraction and rate limiting (server only)
    parse-balance.ts      free in-browser balance reader (+ tests)
    persisted.ts          localStorage-backed state
```

### Updating the data

- New transfer ratios or caps: `src/lib/data/programs.ts`
- Partner default ₹ values: `src/lib/data/partners.ts`
- Award prices and how-to steps: `src/lib/data/guides.ts`
- Weekly cash-fare snapshot: `src/lib/data/fares.ts`
- Update `DATA_CHECKED` in `src/lib/data/index.ts` and the dates in the page copy

Run `npm test` after any data change.

## Local development

Needs Node 22+.

```bash
npm install
cp .env.example .env.local   # optional, only for the AI reader
npm run dev                  # http://localhost:3000
```

Scripts: `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run check` (all three checks).

Everything works without any key. The app is free to run.

## Deploying to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). The framework (Next.js) is detected automatically; no build settings needed.
2. Click Deploy. Nothing else is needed: the app runs free on the Hobby plan.

Optional AI reader (for messages the pattern reader misses): enable AI Gateway on the project, set `ENABLE_AI_EXTRACT=1` (and optionally `EXTRACT_MODEL`), and redeploy. AI Gateway usage is billed, so leave it off to stay free. If you turn it on, add a Vercel Firewall rate-limit rule on `/api/extract`; the built-in limit (10 a minute per IP) only covers one running instance.

Every push to a branch gets a preview URL; merging to `main` deploys to production. GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests, build and typecheck on every PR.

## Not built yet

- **Gmail scan.** The original page read balances from Gmail through Claude's connector. A standalone version needs Google sign-in with the `gmail.readonly` scope, which Google treats as restricted (app verification and a security assessment). The free paste-to-read covers the same need for now.
- **Accounts and sync.** Balances live in the browser. Saving them across devices needs sign-in and a database (e.g. Clerk + Neon from the Vercel Marketplace).

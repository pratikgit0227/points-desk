# Points Desk

Credit card reward points calculator for Indian cards. Enter your points balance and see every transfer partner ranked by ₹ value, which card gives the most for each partner, and where the points can take you (award flights from India and hotel nights), with a how-to-book guide for each of the 31 partners.

Cards: Axis Atlas, Horizon, Magnus and Magnus for Burgundy (EDGE), HDFC Infinia / Diners Club Black, HDFC Regalia Gold, Amex Membership Rewards, HSBC TravelOne, Scapia.

- Transfer ratios checked 25 Sep 2026, including Axis's 23 Sep 2026 changes
- Axis annual Group A / Group B transfer caps are applied
- ₹ value per partner point can be edited; balances and values are saved in the browser only
- Paste a statement email or bank SMS and the balances are read out of it with AI

Check the current ratio on your bank's portal before transferring. Transfers can't be reversed.

## Stack

- **Next.js 16** (App Router, TypeScript), deployed on **Vercel**
- **AI SDK 7** through the **Vercel AI Gateway** for reading balances from text
- **Vitest** for the calculation tests

## Project layout

```
src/
  app/
    page.tsx              the app (one page)
    layout.tsx            fonts, metadata
    globals.css           all styles (light + dark)
    api/
      extract/route.ts    POST { text } → balances read from an email/SMS (AI)
      data/route.ts       GET  all partner, card and guide data as JSON (static)
      health/route.ts     GET  liveness + whether AI is configured
  components/             one component per section, plus store.tsx (app state)
  lib/
    data/                 partners, cards & ratios, guides, merchants, fares  ← edit data here
    calc/                 all the maths, no UI; calc.test.ts covers it
    server/               AI extraction and rate limiting (server only)
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
cp .env.example .env.local   # add AI_GATEWAY_API_KEY to try the paste-to-read feature
npm run dev                  # http://localhost:3000
```

Scripts: `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run check` (all three checks).

Everything except "read balance from text" works without a key.

## Deploying to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). The framework (Next.js) is detected automatically; no build settings needed.
2. Enable **AI Gateway** for the project. Deployments authenticate to it automatically, so no API key is needed in production.
3. Optional: set `EXTRACT_MODEL` to use a different model.
4. Optional: add a Vercel Firewall rate-limit rule on `/api/extract`. The built-in limit (10 requests a minute per IP) only covers one running instance.

Every push to a branch gets a preview URL; merging to `main` deploys to production. GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests, build and typecheck on every PR.

## Not built yet

- **Gmail scan.** The original page read balances from Gmail through Claude's connector. A standalone version needs Google sign-in with the `gmail.readonly` scope, which Google treats as restricted (app verification and a security assessment). Paste-to-read covers the same need for now.
- **Accounts and sync.** Balances live in the browser. Saving them across devices needs sign-in and a database (e.g. Clerk + Neon from the Vercel Marketplace).

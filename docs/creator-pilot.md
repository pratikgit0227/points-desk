# Creator trip pages (pilot)

Creator pages live at `/trips/<slug>`. No logins: each page is reviewed in a pull request and goes live when it's merged.

## Adding a creator's trip

1. Ask the creator for: their name and profile link, a one-line bio, the destination, why the trip (a few sentences in their words), when to go, cabin, which flight options they recommend (up to 3), where to stay, a checklist, and any links. Ask them to mark which links earn them money.
2. Add the creator to `CREATORS` in `src/lib/data/creators.ts` (once per creator).
3. Add the trip to `CREATOR_TRIPS`:
   - `dest` is a destination id from `src/lib/data/destinations*.ts`. Add the destination first if it's missing.
   - `picks` are option keys, `"<partner>|<route>"`, copied exactly from that destination's `options`.
   - Set `paid: true` on every affiliate, referral or sponsored link.
4. Run `npm run check`. Tests fail if a pick, destination or creator doesn't exist.
5. Open a PR. The owner merges it.

## Rules the page enforces

- Points prices, ratios, taxes and bag rules come from the site's checked data, never from the creator.
- Paid links are labelled and get `rel="sponsored"`. They never change the order or the numbers.
- Followers' balances stay in their browser. Creators get page views only: Vercel → Analytics, filter by `/trips/<slug>`.

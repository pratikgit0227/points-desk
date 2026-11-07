const SOURCES = [
  { href: "https://cardexpress.in/articles/axis-edge-transfer-partners-group-a-group-b", label: "Card Express (Axis, 23 Sep)" },
  { href: "https://livefromalounge.com/axis-bank-travel-edge-rewards-reshuffle-2026/", label: "Live From A Lounge" },
  { href: "https://magnify.club/guides/axis-bank-group-a-group-b-transfer-partners/", label: "Magnify (Axis groups, caps)" },
  { href: "https://pointsmath.com/hdfc-bank-points-transfer-partners/", label: "PointsMath (HDFC, 15 Aug)" },
  { href: "https://magnify.club/guides/amex-india-transfer-partners/", label: "Magnify (Amex, 18 Aug)" },
];

const CARD_FACTS = [
  { href: "https://magnify.club/guides/hsbc-travelone-credit-card-review/", label: "HSBC TravelOne" },
  { href: "https://cardadvisor.in/cards/axis-horizon", label: "Axis Horizon" },
  { href: "https://magnify.club/guides/amex-platinum-travel-devaluation-september-2026/", label: "Amex Platinum Travel (Sept 2026)" },
  { href: "https://livefromalounge.com/scapia-credit-card-review-2025/", label: "Scapia" },
  { href: "https://cardtrail.in/news/axis-atlas-discontinued-2026/", label: "Atlas closed to new applicants" },
];

function Links({ items }: { items: { href: string; label: string }[] }) {
  return items.map((s, i) => (
    <span key={s.href}>
      {i > 0 && " · "}
      <a href={s.href} target="_blank" rel="noopener noreferrer">
        {s.label}
      </a>
    </span>
  ));
}

export function Notes() {
  return (
    <section className="notes">
      <h3>About the numbers</h3>
      <div>
        Axis caps are per calendar year per customer: Atlas 30,000 Group A / 1,20,000 Group B; Magnus for Burgundy 2,00,000 / 8,00,000; Magnus 1,00,000 / 4,00,000. Values here assume the full cap is still open.
      </div>
      <div>
        Axis changed ratios again on 23 Sep 2026 (BA, Cathay, Finnair, Qatar, Vietnam and Accor now convert at the lower rate). Check the ratio on the bank&apos;s portal before every transfer; transfers can&apos;t be reversed.
      </div>
      <div>
        Award prices are the lowest (saver / off-peak) one-way prices seen in 2026. Seats at that price are limited, taxes and fuel surcharges are extra, and airlines change charts without notice. Find the seat on the airline&apos;s site first, then transfer.
      </div>
      <div>
        Card facts (fees, earn rates, milestones) checked 25 Sep 2026: <Links items={CARD_FACTS} />. HSBC and Horizon direct-redemption values are estimates.
      </div>
      <div>
        Sources: <Links items={SOURCES} />
      </div>
      <div>Balances and values you enter are saved in your browser only.</div>
    </section>
  );
}

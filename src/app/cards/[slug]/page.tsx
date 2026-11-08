import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cardFacts, cardSlug, changeDate, changesFor, destSlug, KIND_LABEL, programBySlug } from "@/lib/calc";
import { CARD_INFO, DATA_CHECKED, GUIDES, PARTNERS, PROGRAMS } from "@/lib/data";
import { fmt, inr, ratioTxt } from "@/lib/format";
import { Fact } from "@/components/Fact";
import { GuideButton, HaveCardButton } from "@/components/PageActions";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: cardSlug(p.key) }));
}

export async function generateMetadata({ params }: PageProps<"/cards/[slug]">): Promise<Metadata> {
  const prog = programBySlug((await params).slug);
  if (!prog) return {};
  const f = cardFacts(prog);
  const best = f.partners[0];
  return {
    title: `${f.name}: transfer partners and best uses`,
    description: best
      ? `${f.name} ${prog.unit} transfer to ${f.partners.length} airline and hotel partners. Best value: ${PARTNERS[best.p].n} at ${ratioTxt(best.ratio)}, about ₹${f.bestPer.toFixed(2)} a point.`
      : `${f.name} ${prog.unit} don't transfer to airlines or hotels. They're worth ₹${prog.base.v} each on ${prog.base.label}.`,
    alternates: { canonical: `/cards/${cardSlug(prog.key)}` },
  };
}

export default async function CardPage({ params }: PageProps<"/cards/[slug]">) {
  const prog = programBySlug((await params).slug);
  if (!prog) notFound();
  const f = cardFacts(prog);
  const ci = CARD_INFO[prog.key];
  const top = f.partners[0];

  return (
    <main className="wrap">
      <nav className="crumbs small" aria-label="Breadcrumb">
        <Link href="/cards">Choose a card</Link> › {f.name}
      </nav>

      <header className="page-intro">
        <div className="eyebrow">
          {prog.bank} · {prog.unit}
        </div>
        <h1>{f.name}</h1>
        {ci?.why && <p className="muted">{ci.why}</p>}
        <div className="actions">
          <HaveCardButton cardKey={prog.key} />
          <Link href="/" className="small">
            Check my balance →
          </Link>
        </div>
      </header>

      <section className="facts">
        <Fact label="Status" value={ci?.status ?? "—"} warn={!f.open} />
        <Fact label="Annual fee" value={ci ? (ci.fee ? inr(ci.fee) : "Free") : "—"} note={ci?.waive ? `Waived at ${inr(ci.waive)} spend a year` : "Incl. 18% GST"} />
        <Fact
          label="Earn per ₹100"
          value={ci?.earn ? `${ci.earn.other} pts` : "—"}
          note={ci?.earn ? `${ci.earn.travel} on travel${ci.est ? " · base rate, check the terms" : ""}` : undefined}
        />
        <Fact label="Best value a point" value={`₹${f.bestPer.toFixed(2)}`} note={top && top.per > prog.base.v ? `via ${PARTNERS[top.p].n}` : prog.base.label} />
        {f.returnPct !== undefined && <Fact label="Return on spend" value={`${f.returnPct.toFixed(1)}%`} note="Everyday spend, at the best use" />}
      </section>

      {f.partners.length > 0 ? (
        <section className="panel" aria-labelledby="partnersH">
          <h2 id="partnersH">Transfer partners ({f.partners.length})</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Ratio is card points : partner points. ₹ per point uses typical good-redemption values, which you can change on the <Link href="/learn">Learn</Link> tab.
            {prog.caps && ` Axis caps transfers each calendar year: Group A ${fmt(prog.caps.A)}, Group B ${fmt(prog.caps.B)} ${prog.unit}.`}
          </p>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Type</th>
                  <th className="r">Ratio</th>
                  <th className="r">₹ / card point</th>
                </tr>
              </thead>
              <tbody>
                {f.partners.map((r, i) => (
                  <tr key={r.p} className={i === 0 ? "top1" : undefined}>
                    <td>
                      {GUIDES[r.p] ? <GuideButton p={r.p}>{PARTNERS[r.p].n}</GuideButton> : PARTNERS[r.p].n}
                      {r.grp && <span className="grp">{r.grp}</span>}
                    </td>
                    <td>{PARTNERS[r.p].k === "air" ? "Airline" : "Hotel"}</td>
                    <td className="r num">{ratioTxt(r.ratio)}</td>
                    <td className="r num">₹{r.per.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="base">
                  <td>Direct: {prog.base.label}</td>
                  <td>—</td>
                  <td className="r">—</td>
                  <td className="r num">₹{prog.base.v.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2>No transfer partners</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Points are used directly: {prog.base.label}, at ₹{prog.base.v} a point.
          </p>
        </section>
      )}

      {f.destinations.length > 0 && (
        <section className="panel" aria-labelledby="destH">
          <h2 id="destH">Where your {prog.unit} can take you</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Cheapest one-way award from India to each city, in {prog.unit} after the transfer. Taxes are extra and seats at these prices are limited.
          </p>
          <div className="dest-grid">
            {f.destinations.map((x) => (
              <Link key={x.d.id} href={`/fly/${destSlug(x.d)}`} className="dest-tile">
                <b>{x.d.name}</b>
                <span className="num">{fmt(x.cardPts)} pts</span>
                <span className="small muted">via {PARTNERS[x.p].n}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {f.spots.length > 0 && (
        <section className="panel" aria-labelledby="spotsH">
          <h2 id="spotsH">Sweet spots</h2>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Award</th>
                  <th>Programme</th>
                  <th className="r">Partner pts</th>
                  <th className="r">{prog.unit}</th>
                </tr>
              </thead>
              <tbody>
                {f.spots.slice(0, 12).map((x) => (
                  <tr key={x.p + x.s.to + x.s.cab + x.s.from}>
                    <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                      {x.s.to} · {x.s.cab}
                      {x.s.from && <div className="small muted">From {x.s.from}</div>}
                    </td>
                    <td>
                      <GuideButton p={x.p}>{PARTNERS[x.p].n}</GuideButton>
                    </td>
                    <td className="r num">{fmt(x.s.m!)}</td>
                    <td className="r num">{fmt(x.cardPts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {changesFor([prog.key]).length > 0 && (
        <section className="panel" aria-labelledby="changesH">
          <h2 id="changesH">Recent changes</h2>
          <ul className="notes small">
            {changesFor([prog.key]).map((c) => (
              <li key={c.id}>
                <b>{changeDate(c)}</b> · {KIND_LABEL[c.kind]} · <Link href={`/changes#${c.id}`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="small muted">
        Ratios and card facts checked {DATA_CHECKED}. Banks change these often, so check the bank&apos;s site before you transfer: transfers can&apos;t be reversed. Sources are on the{" "}
        <Link href="/learn">Learn</Link> tab.
      </p>
    </main>
  );
}

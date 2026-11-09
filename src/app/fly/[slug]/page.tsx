import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cardSlug, destinationBySlug, destinationFacts, destSlug, priceBasis } from "@/lib/calc";
import { DESTINATIONS, PARTNERS, cardName } from "@/lib/data";
import { fmt, inr, ratioTxt } from "@/lib/format";
import { Fact } from "@/components/Fact";
import { FareDetails } from "@/components/FareDetails";
import { GuideButton, PlanTripButton } from "@/components/PageActions";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: destSlug(d) }));
}

export async function generateMetadata({ params }: PageProps<"/fly/[slug]">): Promise<Metadata> {
  const d = destinationBySlug((await params).slug);
  if (!d) return {};
  const f = destinationFacts(d);
  const parts = [
    f.minEco && `economy from ${fmt(f.minEco.r.eco!)} ${PARTNERS[f.minEco.p].n} points`,
    f.minBiz && `business from ${fmt(f.minBiz.r.biz!)} ${PARTNERS[f.minBiz.p].n} points`,
  ].filter(Boolean);
  return {
    title: `Fly to ${d.name} on credit card points from India`,
    description: `Every way to reach ${d.name} with Indian credit card points${parts.length ? ": " + parts.join(", ") : ""}. Which card to transfer from, and which to pay with.`,
    alternates: { canonical: `/fly/${destSlug(d)}` },
  };
}

export default async function FlyPage({ params }: PageProps<"/fly/[slug]">) {
  const d = destinationBySlug((await params).slug);
  if (!d) notFound();
  const f = destinationFacts(d);

  return (
    <main className="wrap">
      <nav className="crumbs small" aria-label="Breadcrumb">
        <Link href="/fly">Destinations</Link> › {d.name}
      </nav>

      <header className="page-intro">
        <div className="eyebrow">
          {d.country} · {d.code}
        </div>
        <h1>Fly to {d.name} on points</h1>
        <p className="muted">
          Every transfer partner that gets you to {d.name} from India, how many points each one takes, and which card to move them from.
        </p>
        <div className="actions">
          <PlanTripButton id={d.id} name={d.name} />
        </div>
      </header>

      {d.note && (
        <p className="small capnote" role="note" style={{ margin: 0, padding: "8px 12px", borderRadius: 8, background: "var(--brass-soft)", border: "1px solid var(--brass-line)" }}>
          ⚠ {d.note}
        </p>
      )}

      <section className="facts">
        {f.minEco && <Fact label="Economy, one-way" value={`${fmt(f.minEco.r.eco!)} pts`} note={`${PARTNERS[f.minEco.p].n} · ${f.minEco.r.airline}`} />}
        {f.minBiz && <Fact label="Business, one-way" value={`${fmt(f.minBiz.r.biz!)} pts`} note={`${PARTNERS[f.minBiz.p].n} · ${f.minBiz.r.airline}`} />}
        <Fact label="Typical cash fare" value={inr(d.fare.eco)} note={`Economy one-way · business about ${inr(d.fare.biz)}`} />
        {f.minEco && <Fact label="Value a point" value={`₹${(d.fare.eco / f.minEco.r.eco!).toFixed(2)}`} note="Typical economy fare ÷ cheapest award" />}
      </section>

      <section className="panel" aria-labelledby="routesH">
        <h2 id="routesH">Ways to get there with points</h2>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Programme</th>
                <th>Airline &amp; route</th>
                <th className="r">Economy</th>
                <th className="r">Business</th>
                <th>Best open card</th>
                <th>Also from</th>
              </tr>
            </thead>
            <tbody>
              {f.routes.map((x) => {
                const others = x.sources.filter((s) => s !== x.bestOpen);
                return (
                  <tr key={x.p + x.r.route}>
                    <td>
                      <GuideButton p={x.p}>{PARTNERS[x.p].n}</GuideButton>
                    </td>
                    <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                      <div>{x.r.airline}</div>
                      <div className="small muted">
                        {x.r.route} · {priceBasis(x.r).label}
                      </div>
                      <FareDetails airline={x.r.airline} cabin="eco" award={x.r.pricing !== "revenue"} />
                    </td>
                    <td className="r num">{x.r.pricing === "revenue" ? "Fare in pts" : x.r.eco ? fmt(x.r.eco) : "—"}</td>
                    <td className="r num">{x.r.pricing === "revenue" ? "—" : x.r.biz ? fmt(x.r.biz) : "—"}</td>
                    <td style={{ whiteSpace: "normal", minWidth: 160 }}>
                      {x.bestOpen ? (
                        <>
                          <Link href={`/cards/${cardSlug(x.bestOpen.prog.key)}`}>{cardName(x.bestOpen.prog)}</Link>
                          <div className="small muted">
                            {ratioTxt(x.bestOpen.ratio)}
                            {x.bestOpen.eco ? ` · ${fmt(x.bestOpen.eco)} ${x.bestOpen.prog.unit}` : ""}
                          </div>
                        </>
                      ) : (
                        <span className="small muted">No open card</span>
                      )}
                    </td>
                    <td className="small" style={{ whiteSpace: "normal", minWidth: 160 }}>
                      {others.map((s, i) => (
                        <span key={s.prog.key}>
                          {i > 0 && ", "}
                          <Link href={`/cards/${cardSlug(s.prog.key)}`}>{cardName(s.prog)}</Link> ({ratioTxt(s.ratio)})
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {f.routes.some((x) => x.r.note) && (
          <ul className="small muted notes">
            {f.routes
              .filter((x) => x.r.note)
              .map((x) => (
                <li key={x.p + x.r.route}>
                  <b>{PARTNERS[x.p].n}:</b> {x.r.note}
                </li>
              ))}
          </ul>
        )}
      </section>

      {d.nonstop.length > 0 && (
        <section className="panel" aria-labelledby="nonstopH">
          <h2 id="nonstopH">Nonstop from India</h2>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {d.nonstop.map((a) => (
              <li key={a.airline}>
                <b>{a.airline}</b>: {a.from}
              </li>
            ))}
          </ul>
          <p className="small muted" style={{ margin: 0 }}>
            Paying cash? <PlanLink /> shows which of your cards earns the most on the ticket.
          </p>
        </section>
      )}

      <p className="small muted">
        Award prices are per person, one-way, checked {d.checked}; no seat is checked or held here. Bag rules shown are each airline&apos;s general economy rule, not what a ticket includes. Taxes are extra and seats at these prices are limited. Check the seat on the airline&apos;s site before you transfer: transfers can&apos;t be
        reversed. Sources: {d.src}.
      </p>
    </main>
  );
}

function PlanLink() {
  return <Link href="/plan">Plan a trip</Link>;
}

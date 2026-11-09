import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { destPhoto, optionKey, priceBasis } from "@/lib/calc";
import { CREATORS, CREATOR_TRIPS, DESTINATIONS, PARTNERS } from "@/lib/data";
import { fmt, longDate } from "@/lib/format";
import { FareDetails } from "@/components/FareDetails";
import { PhotoBg } from "@/components/PhotoBg";
import { TripCalculator } from "@/components/TripCalculator";

export function generateStaticParams() {
  return CREATOR_TRIPS.map((t) => ({ slug: t.slug }));
}

function find(slug: string) {
  const trip = CREATOR_TRIPS.find((t) => t.slug === slug);
  if (!trip) return null;
  const creator = CREATORS.find((c) => c.id === trip.creator)!;
  const dest = DESTINATIONS.find((d) => d.id === trip.dest)!;
  return { trip, creator, dest };
}

export async function generateMetadata({ params }: PageProps<"/trips/[slug]">): Promise<Metadata> {
  const f = find((await params).slug);
  if (!f) return {};
  return {
    title: `${f.trip.title} · by ${f.creator.name}`,
    description: f.trip.intro.slice(0, 155),
    alternates: { canonical: `/trips/${f.trip.slug}` },
  };
}

export default async function CreatorTripPage({ params }: PageProps<"/trips/[slug]">) {
  const f = find((await params).slug);
  if (!f) notFound();
  const { trip, creator, dest } = f;
  const paid = trip.links.some((l) => l.paid);
  const cabin = trip.cabin === "biz" ? "business" : "economy";

  return (
    <main className="wrap">
      <nav className="crumbs small" aria-label="Breadcrumb">
        <Link href="/trips">Trips by creators</Link> › {trip.title}
      </nav>

      <PhotoBg photo={destPhoto(dest.id)} className="fly-hero" credit="link" priority>
        <div className="eyebrow">
          Creator trip · {dest.name}, {dest.country}
        </div>
        <h1>{trip.title}</h1>
        <p>
          by{" "}
          {creator.url ? (
            <a href={creator.url} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", fontWeight: 700 }}>
              {creator.name}
            </a>
          ) : (
            <b>{creator.name}</b>
          )}{" "}
          · updated {longDate(trip.updated)}
          {paid && <span className="pill unk" style={{ marginLeft: 8 }}>Contains affiliate links</span>}
        </p>
      </PhotoBg>

      <section className="panel">
        <h2>Why this trip</h2>
        <p style={{ margin: 0 }}>{trip.intro}</p>
        <p className="small muted" style={{ margin: 0 }}>
          <b>When:</b> {trip.when}
        </p>
        <p className="small muted" style={{ margin: 0 }}>
          {creator.name}: {creator.bio}
        </p>
      </section>

      <TripCalculator trip={trip} />

      <section className="panel" aria-labelledby="flightsH">
        <h2 id="flightsH">Flights in this plan</h2>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Programme</th>
                <th>Airline &amp; route</th>
                <th className="r">Points, one-way per person</th>
                <th>Bags</th>
              </tr>
            </thead>
            <tbody>
              {trip.picks.map((k) => {
                const r = dest.options.find((o) => optionKey(o) === k);
                if (!r) return null;
                return (
                  <tr key={k}>
                    <td>{PARTNERS[r.p as keyof typeof PARTNERS].n}</td>
                    <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                      <div>{r.airline}</div>
                      <div className="small muted">
                        {r.route} · {priceBasis(r).label}
                      </div>
                    </td>
                    <td className="r num">{r.pricing === "revenue" ? "Fare in points" : r[trip.cabin] ? fmt(r[trip.cabin]!) : "—"}</td>
                    <td style={{ whiteSpace: "normal", minWidth: 200 }}>
                      <FareDetails airline={r.airline} cabin={trip.cabin} award={r.pricing !== "revenue"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Prices are {cabin} one-way lows checked {dest.checked} from {dest.src}. Not live seats: check the programme&apos;s site, then transfer. Transfers can&apos;t be reversed.
        </p>
      </section>

      {trip.stays.length > 0 && (
        <section className="panel deco deco-bed">
          <h2>Where to stay</h2>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
            {trip.stays.map((s) => (
              <li key={s.name}>
                <b>{s.name}</b>
                {s.p ? ` (${PARTNERS[s.p].n})` : ""}: {s.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel">
        <h2>Checklist</h2>
        <ul className="checklist small">
          {trip.checklist.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      {trip.links.length > 0 && (
        <section className="panel">
          <h2>Links</h2>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {trip.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel={(l.paid ? "sponsored " : "") + "noopener noreferrer"}>
                  {l.label} ↗
                </a>
                {l.paid && <span className="pill unk" style={{ marginLeft: 6 }}>Affiliate link: the creator may earn a fee</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="small muted">
        How this page works: points prices, ratios and bag rules come from Suite &amp; Seat&apos;s own checked data, not the creator, and paid links never change the order or the numbers. Your
        balances stay in your browser; the creator only sees how many people viewed the page.
      </p>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { destPhoto } from "@/lib/calc";
import { CREATORS, CREATOR_TRIPS, DESTINATIONS } from "@/lib/data";
import { PhotoBg } from "@/components/PhotoBg";

export const metadata: Metadata = {
  title: "Trips by creators",
  description: "Trip plans from travel creators that you can redo with your own cards and points: where to fly, how many points, what to check before transferring.",
  alternates: { canonical: "/trips" },
};

export default function TripsPage() {
  return (
    <main className="wrap">
      <div className="page-intro">
        <h1>Trips by creators</h1>
        <p className="muted">
          Ready-made trip plans you can redo with your own cards: pick your city and travellers, and see what it costs you in points and cash. A small pilot; more trips are coming.
        </p>
      </div>
      <div className="trips">
        {CREATOR_TRIPS.map((t) => {
          const d = DESTINATIONS.find((x) => x.id === t.dest)!;
          const c = CREATORS.find((x) => x.id === t.creator)!;
          return (
            <Link key={t.slug} href={`/trips/${t.slug}`} className="trip has-photo" style={{ textDecoration: "none", color: "inherit" }}>
              <PhotoBg photo={destPhoto(d.id)} className="trip-photo">
                <div>
                  <span className="pill cab">{t.cabin === "biz" ? "Business" : "Economy"}</span>
                </div>
                <div className="to">{t.title}</div>
              </PhotoBg>
              <div className="trip-body">
                <div className="meta">by {c.name}</div>
                <div className="small muted">{t.intro.slice(0, 120)}…</div>
              </div>
            </Link>
          );
        })}
      </div>
      <p className="small muted">
        Are you a travel creator? Send your trip (where, when, which programmes, where to stay) and we&apos;ll set it up. Numbers on every page come from Suite &amp; Seat&apos;s checked data.
      </p>
    </main>
  );
}

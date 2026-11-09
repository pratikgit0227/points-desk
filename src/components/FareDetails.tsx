"use client";

import { useSyncExternalStore } from "react";
import { airlineByCode, bagGuides, bagShort, isStale, type BagGuide } from "@/lib/calc";
import type { Cabin } from "@/lib/data";
import { longDate } from "@/lib/format";

/** Today on the client; empty during the server render, so staleness is only judged in the browser. */
const noop = () => () => {};
function useToday() {
  return useSyncExternalStore(noop, () => new Date().toISOString().slice(0, 10), () => "");
}

function guidesFor(airline: string | undefined, code: string | undefined, cabin: Cabin, today: string): BagGuide[] {
  if (airline) return bagGuides(airline, cabin, today);
  const a = code ? airlineByCode(code) : undefined;
  return a ? [{ a, checkedBag: a[cabin].checked, cabinBag: a[cabin].cabin, personal: a[cabin].personal, stale: isStale(a.checked, today) }] : [];
}

/**
 * Baggage and fare-inclusion summary for one flight option: always visible as
 * one line, with the airline's general rules, source and date one tap away.
 */
export function FareDetails({ airline, code, cabin, award = false }: { airline?: string; code?: string; cabin: Cabin; award?: boolean }) {
  const today = useToday();
  const guides = guidesFor(airline, code, cabin, today);
  const g = guides[0];
  const cabinTxt = g && bagShort(g.cabinBag) ? `, cabin ${bagShort(g.cabinBag)}` : "";
  const line = g ? (bagShort(g.checkedBag) ? `checked ${bagShort(g.checkedBag)}` : "checked bag depends on fare") + cabinTxt : "";

  return (
    <div className="bags">
      <div className="small">
        <span className="pill unk">Bags not confirmed</span>{" "}
        <span className="muted">
          {g ? `${g.a.name} usually: ${line}` : "Check the fare rules"}
          {guides.length > 1 ? `; ${guides.length} airlines, the one flying each leg sets the rule` : ""}
        </span>
      </div>
      <details>
        <summary className="small">Bags and fare rules</summary>
        <p className="small" style={{ margin: "0 0 6px" }}>
          For this ticket, checked bag, cabin bag, seat choice, changes and meals are <b>not confirmed</b>: they depend on the exact fare{award ? ", the award type" : ""}, route and the airline flying it. Check them on the {award ? "programme's" : "booking"} site before you {award ? "transfer points" : "pay"}.
        </p>
        {guides.map((x) => (
          <div key={x.a.id} className="bag-rule small">
            <div>
              <b>{x.a.name}</b>, general rule for {cabin === "biz" ? "business" : "economy"} (not your ticket):
            </div>
            <dl>
              <dt>Checked</dt>
              <dd>{x.checkedBag.text}</dd>
              <dt>Cabin</dt>
              <dd>
                {x.cabinBag.text}
                {x.cabinBag.dims ? ` (${x.cabinBag.dims})` : ""}
              </dd>
              {x.personal && (
                <>
                  <dt>Personal item</dt>
                  <dd>{x.personal.text}</dd>
                </>
              )}
              {award && x.a.award && (
                <>
                  <dt>Award tickets</dt>
                  <dd>{x.a.award}</dd>
                </>
              )}
              <dt>Depends on</dt>
              <dd>{x.a.varies}</dd>
            </dl>
            <div className="muted">
              Source:{" "}
              <a href={x.a.url} target="_blank" rel="noopener noreferrer">
                {x.a.source} ↗
              </a>
              , read {longDate(x.a.checked)}
              {x.a.confidence === "medium" && <span className="capnote"> · not read on the airline&apos;s own page; check before relying on it</span>}
              {x.stale && <span className="capnote"> · may be out of date, check the airline</span>}
            </div>
          </div>
        ))}
        {!guides.length && <p className="small muted">We don&apos;t have this airline&apos;s baggage rules yet. The booking site&apos;s fare rules say what&apos;s included.</p>}
      </details>
    </div>
  );
}

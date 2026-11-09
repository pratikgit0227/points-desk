"use client";

import { useState, useSyncExternalStore } from "react";
import { compareOptions, decodeShare, encodeShare, recommend, shareFields, STATUSES, type CompareRow, type PlanStatus, type SharedTrip, type TripCore, type TripPlan } from "@/lib/calc";
import { DESTINATIONS, ORIGINS } from "@/lib/data";
import { fmt, inr, longDate } from "@/lib/format";
import { usePersisted } from "@/lib/persisted";
import { FareDetails } from "./FareDetails";
import { useStore, type TripState } from "./store";

const NO_PLANS: TripPlan[] = [];
const noop = () => () => {};
const today = () => new Date().toISOString().slice(0, 10);
const newId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function coreOf(t: TripState): TripCore {
  return { dest: t.id, from: t.from, date: t.date, flex: t.flex || 0, cabin: t.cabin, pax: t.pax || 1, legs: t.legs || 2, fare: t.fare, picks: t.picks ?? [] };
}

/** The trip fields of a plan or shared link, in a fixed order (for saving and comparing). */
function pickCore(c: TripCore): TripCore {
  return { dest: c.dest, from: c.from, date: c.date, flex: c.flex, cabin: c.cabin, pax: c.pax, legs: c.legs, fare: c.fare, picks: [...c.picks] };
}

function tripOf(c: TripCore | SharedTrip): Partial<TripState> {
  const d = DESTINATIONS.find((x) => x.id === c.dest);
  return { id: c.dest, q: d?.name ?? "", from: c.from, date: c.date, flex: c.flex, cabin: c.cabin, pax: c.pax, legs: c.legs, fare: c.fare, picks: c.picks, airline: 0 };
}

/** "Dubai · return · 2 travellers · economy · 14 Jan 2027 ± 3 days · from DEL" */
function summary(c: TripCore): string {
  const d = DESTINATIONS.find((x) => x.id === c.dest);
  return [
    d?.name ?? c.dest,
    c.legs === 2 ? "return" : "one-way",
    `${c.pax} traveller${c.pax > 1 ? "s" : ""}`,
    c.cabin === "biz" ? "business" : "economy",
    c.date ? longDate(c.date) + (c.flex ? ` ± ${c.flex} days` : "") : "date not set",
    "from " + (ORIGINS.find((o) => o.code === c.from)?.name ?? c.from),
  ].join(" · ");
}

function scrollToFinder() {
  document.getElementById("destH")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Save, compare and share trip plans. Plans stay in this browser. */
export function SavedPlans() {
  const { trip, setTrip, balances, values, mine } = useStore();
  const [plans, setPlans] = usePersisted("pd_plans", NO_PLANS);
  const [active, setActive] = useState("");
  const core = coreOf(trip);
  const rows = compareOptions(core, balances, values, mine);
  const rec = recommend(rows, values);
  const dest = DESTINATIONS.find((d) => d.id === core.dest);
  const open = plans.find((p) => p.id === active);
  const changed = open ? JSON.stringify(pickCore(open)) !== JSON.stringify(core) : false;

  const update = (id: string, patch: Partial<TripPlan>) => setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch, updated: today() } : p)));

  const save = () => {
    const id = newId();
    const name = `${dest?.name ?? "Trip"}${core.date ? " · " + longDate(core.date).replace(/^\d+ /, "") : ""}`;
    setPlans((prev) => [{ ...core, id, name, status: "exploring", notes: "", updated: today() }, ...prev]);
    setActive(id);
  };

  return (
    <section className="panel" aria-labelledby="plansH">
      <h2 id="plansH">Your trip plans</h2>
      <p className="small muted" style={{ margin: 0 }}>
        Plans are saved in this browser only, like your balances. Nothing is sent to us, and clearing your browser data removes them.
      </p>

      <h3 style={{ margin: "6px 0 0" }}>Compare: {dest?.name}</h3>
      <p className="small muted" style={{ margin: 0 }}>
        {summary(core)}. Totals are for everyone, both ways{core.legs === 2 ? " (same award price assumed each way)" : ""}. Tick &quot;Compare&quot; on up to 3 options above to add them.
      </p>
      <CompareTable rows={rows} recKey={rec?.row.key} cabin={core.cabin} />
      {rec && (
        <p className="small" style={{ margin: 0 }}>
          <span className="pill ok">Suggested</span> <b>{rec.row.title}</b>: {rec.why}. Check the seats{core.pax > 1 ? ` (${core.pax} together)` : ""} and the bags before you transfer anything.
        </p>
      )}
      <p className="small muted" style={{ margin: 0 }}>
        Bags aren&apos;t confirmed for any option, so a cheap fare without a checked bag isn&apos;t like-for-like: check each fare&apos;s rules.
        {core.pax > 1 ? ` Award seats for ${core.pax} on one flight are often scarce; if you can't find them, split across dates or programmes.` : ""}
      </p>

      <div className="plan-actions">
        <button type="button" className="primary" onClick={save}>
          Save this trip as a plan
        </button>
        {open && changed && (
          <button type="button" onClick={() => update(open.id, core)}>
            Save changes to &quot;{open.name}&quot;
          </button>
        )}
      </div>

      {plans.length > 0 && (
        <div className="plans-list">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              on={p.id === active}
              onOpen={() => {
                setTrip(tripOf(p));
                setActive(p.id);
                scrollToFinder();
              }}
              onChange={(patch) => update(p.id, patch)}
              onDelete={() => {
                setPlans((prev) => prev.filter((x) => x.id !== p.id));
                if (active === p.id) setActive("");
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CompareTable({ rows, recKey, cabin }: { rows: CompareRow[]; recKey?: string; cabin: TripCore["cabin"] }) {
  const cash = rows.find((r) => r.kind === "cash")?.cashPaid ?? 0;
  return (
    <div className="tbl-wrap">
      <table className="cmp-table">
        <thead>
          <tr>
            <th>Option</th>
            <th className="r">Cash you pay</th>
            <th className="r">Points used</th>
            <th className="r">Saves vs cash</th>
            <th>Bags</th>
            <th>How sure</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={r.key === recKey ? "rec" : undefined}>
              <td>
                <b>{r.title}</b>
                <div className="small muted">{r.sub}</div>
              </td>
              <td className="r num">
                {inr(r.cashPaid)}
                {r.kind === "transfer" && <div className="small muted">taxes, est.</div>}
              </td>
              <td className="r num">
                {r.prog ? (
                  <>
                    {fmt(r.cardPts)} <span className="small muted">{r.prog.unit}</span>
                    {r.partner && r.kind === "transfer" && <div className="small muted">= {fmt(r.partnerPts)} partner pts</div>}
                    {r.short > 0 && <div className="small capnote">Short by {fmt(r.short)}</div>}
                    {r.capLimited && <div className="small capnote">Over the yearly cap</div>}
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="r num">
                {r.kind === "cash" ? "—" : inr(r.saved)}
                {r.cardPts > 0 && <div className="small muted">₹{r.perCardPt.toFixed(2)} a card pt</div>}
              </td>
              <td className="small" style={{ minWidth: 170 }}>
                {r.airline ? <FareDetails airline={r.airline} cabin={cabin} award={r.kind === "transfer"} /> : <span><span className="pill unk">Not confirmed</span> depends on the fare you buy</span>}
              </td>
              <td className="small muted" style={{ minWidth: 150 }}>
                {r.basis}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {cash > 0 && rows.length === 1 && <p className="small muted">No points option to compare yet: enter balances on My Wallet or tick options above.</p>}
    </div>
  );
}

function PlanCard({ plan, on, onOpen, onChange, onDelete }: { plan: TripPlan; on: boolean; onOpen: () => void; onChange: (patch: Partial<TripPlan>) => void; onDelete: () => void }) {
  const [sharing, setSharing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className={"plan-card" + (on ? " on" : "")}>
      <div className="plan-head">
        <input type="text" aria-label="Plan name" value={plan.name} maxLength={80} onChange={(e) => onChange({ name: e.target.value })} />
        <select aria-label="Status" value={plan.status} onChange={(e) => onChange({ status: e.target.value as PlanStatus })} style={{ width: "auto" }}>
          {STATUSES.map((s) => (
            <option key={s.s} value={s.s}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="small muted">
        {summary(plan)} · {plan.picks.length} option{plan.picks.length === 1 ? "" : "s"} picked · saved {longDate(plan.updated)}
      </div>
      <textarea aria-label="Notes" rows={2} placeholder="Notes (private unless you choose to share them)" value={plan.notes} maxLength={500} onChange={(e) => onChange({ notes: e.target.value })} />
      <div className="plan-actions">
        <button type="button" className={on ? "" : "primary"} onClick={onOpen}>
          {on ? "Open now" : "Open"}
        </button>
        <button type="button" aria-expanded={sharing} onClick={() => setSharing((x) => !x)}>
          Share
        </button>
        {confirmDel ? (
          <>
            <button type="button" onClick={onDelete} style={{ color: "var(--bad)" }}>
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmDel(false)}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmDel(true)}>
            Delete
          </button>
        )}
      </div>
      {sharing && <ShareBox plan={plan} />}
    </div>
  );
}

function ShareBox({ plan }: { plan: TripPlan }) {
  const [withNotes, setWithNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = shareFields(plan, withNotes);
  const origin = useSyncExternalStore(noop, () => location.origin, () => "");
  const url = `${origin}/plan?trip=${encodeShare(s)}`;
  return (
    <div className="share-box small">
      <b>The link shares exactly this:</b>
      <ul>
        <li>Name: {s.name}</li>
        <li>{summary(s)}</li>
        <li>Cash fare: {s.fare ? inr(s.fare) + " per person" : "typical fare"}</li>
        <li>{s.picks.length ? `${s.picks.length} picked option${s.picks.length > 1 ? "s" : ""}: ${s.picks.map((k) => k.split("|")[1]).join("; ")}` : "No options picked"}</li>
        {s.notes && <li>Notes: {s.notes}</li>}
      </ul>
      <p style={{ margin: "4px 0" }}>Never shared: your balances, your cards, your point values or the plan&apos;s status. Whoever opens it sees the maths with their own cards.</p>
      {plan.notes.trim() && (
        <label style={{ display: "flex", gap: 6, alignItems: "center", margin: "4px 0" }}>
          <input type="checkbox" checked={withNotes} onChange={(e) => setWithNotes(e.target.checked)} style={{ width: "auto" }} /> Include my notes
        </label>
      )}
      <div className="share-url">
        <input type="text" readOnly value={url} aria-label="Share link" onFocus={(e) => e.target.select()} />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(url).then(
              () => setCopied(true),
              () => setCopied(false),
            );
          }}
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

/** Shown when someone opens a shared trip link: load it with your own cards, or save it. */
export function SharedTripBanner() {
  const { setTrip } = useStore();
  const [, setPlans] = usePersisted("pd_plans", NO_PLANS);
  const [done, setDone] = useState(false);
  const search = useSyncExternalStore(noop, () => location.search, () => "");
  const param = new URLSearchParams(search).get("trip");
  const s = param ? decodeShare(param) : null;
  if (!param || done) return null;

  const clearUrl = () => {
    history.replaceState(null, "", location.pathname);
    setDone(true);
  };

  if (!s)
    return (
      <div className="shared-banner small">
        This shared trip link is broken or out of date.{" "}
        <button type="button" className="link" onClick={clearUrl}>
          Dismiss
        </button>
      </div>
    );

  return (
    <div className="shared-banner">
      <div style={{ flex: "1 1 260px" }}>
        <b>Shared trip: {s.name}</b>
        <div className="small muted">{summary(s)}</div>
        {s.notes && <div className="small">Their notes: {s.notes}</div>}
        <div className="small muted">The points maths uses your own cards and balances, which stay in your browser.</div>
      </div>
      <div className="plan-actions">
        <button
          type="button"
          className="primary"
          onClick={() => {
            setTrip(tripOf(s));
            clearUrl();
            scrollToFinder();
          }}
        >
          Open with my cards
        </button>
        <button
          type="button"
          onClick={() => {
            const id = newId();
            setPlans((prev) => [{ ...pickCore(s), id, name: s.name, status: "exploring", notes: s.notes ?? "", updated: today() }, ...prev]);
            setTrip(tripOf(s));
            clearUrl();
          }}
        >
          Save as my plan
        </button>
        <button type="button" className="link" onClick={clearUrl}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

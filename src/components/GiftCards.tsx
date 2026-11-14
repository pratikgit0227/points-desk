"use client";

import { voucherBurnRows, voucherEarnRows } from "@/lib/calc";
import { PROGRAMS, VOUCHER_NO_EARN, VOUCHER_UNKNOWN, type GiftSource } from "@/lib/data";
import { fmt, inr, longDate, shortBank } from "@/lib/format";
import { usePersisted } from "@/lib/persisted";
import { Icon } from "./Icons";
import { useStore } from "./store";

const SPEND = 20000;

function Sources({ items }: { items: GiftSource[] }) {
  return (
    <span className="small muted">
      Source{items.length > 1 ? "s" : ""}:{" "}
      {items.map((s, i) => (
        <span key={s.url + i}>
          {i > 0 && "; "}
          <a href={s.url} target="_blank" rel="noopener">
            {s.label}
          </a>
          {s.date ? ` (${longDate(s.date)})` : ""}
        </span>
      ))}
    </span>
  );
}

function Conf({ c }: { c: "high" | "medium" }) {
  return c === "high" ? <span className="pill ok">Confirmed</span> : <span className="pill unk">Check before you buy</span>;
}

/** "HDFC Infinia / Diners Club Black", or "ICICI Times Black" when the row is for some cards only */
function programLabel(key: string, cards?: string): string {
  const p = PROGRAMS.find((x) => x.key === key);
  return p ? `${shortBank(p.bank)} ${cards ?? p.card}` : key;
}

/** Earn: buy vouchers through the bank's portal for extra points, within monthly caps. */
export function VoucherEarn() {
  const { values, mine, cardAs } = useStore();
  const [spend, setSpend] = usePersisted("pd_gift_spend", SPEND);
  const rows = voucherEarnRows(spend, values, mine, cardAs);
  return (
    <section className="panel" aria-labelledby="gEarnH">
      <h2 id="gEarnH" className="with-icon">
        <Icon name="card" size={20} /> Earn more: buy vouchers through your bank
      </h2>
      <p className="small muted" style={{ margin: 0 }}>
        Some banks give extra points when you buy brand gift vouchers (Amazon, Flipkart, Myntra and others) on their own portal, then spend the voucher as usual. Only worth it for money you&apos;d spend at that brand anyway, and only up to the monthly cap.
      </p>
      <label className="small" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        Vouchers you&apos;d buy a month (₹)
        <input type="number" min={0} step={1000} value={spend || ""} style={{ width: 130 }} onChange={(e) => setSpend(Math.max(0, +e.target.value || 0))} />
      </label>
      <div className="tbl-wrap">
        <table className="cmp-table">
          <thead>
            <tr>
              <th>Card and portal</th>
              <th className="r">Points a month</th>
              <th className="r">Worth</th>
              <th>Cap and things to know</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.e.card} className={r.mine ? "rec" : undefined}>
                <td>
                  <b>{r.e.name}</b> {r.mine && <span className="pill mine">Your card</span>}
                  <div className="small muted">
                    {r.e.portal}: {r.e.mult}, {r.e.per100} points per ₹100
                  </div>
                </td>
                <td className="r num">
                  {fmt(r.pts)}
                  <div className="small muted">normally {fmt(r.normal)}</div>
                </td>
                <td className="r num">
                  {inr(r.worth)}
                  <div className="small muted">{r.pct.toFixed(1)}% back</div>
                </td>
                <td className="small" style={{ minWidth: 240 }}>
                  <div>
                    {r.e.cap.text}.{" "}
                    {r.capped ? (
                      <b>
                        Cap reached at about {inr(r.fillAt)}: spend above that earns {r.e.cap.kind === "bonus" ? "the normal rate" : "nothing extra we can confirm"}.
                      </b>
                    ) : (
                      <span className="muted">Cap reached at about {inr(r.fillAt)}.</span>
                    )}
                  </div>
                  <ul className="g-notes">
                    {r.e.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                  <div className="small muted">
                    Points valued at ₹{r.per.toFixed(2)} each: {r.via}.
                  </div>
                  <Conf c={r.e.conf} /> <Sources items={r.e.src} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {VOUCHER_NO_EARN.map((n) => (
        <p key={n.bank} className="small" style={{ margin: 0 }}>
          <b>{n.bank}:</b> {n.text} <Sources items={n.src} />
        </p>
      ))}
      <p className="small muted" style={{ margin: 0 }}>
        Before you buy: vouchers expire and usually can&apos;t be refunded; some brands carry a fee when paid by card; and caps reset monthly, so check the portal&apos;s current offer page. Heavy voucher buying can also get a card reviewed by the bank.
      </p>
    </section>
  );
}

/** Burn: points spent on vouchers against transferring them. */
export function VoucherBurn() {
  const { values, mine } = useStore();
  const rows = voucherBurnRows(values, mine);
  return (
    <section className="panel" aria-labelledby="gBurnH">
      <h2 id="gBurnH" className="with-icon">
        <Icon name="bag" size={20} /> Spend points: vouchers or transfer?
      </h2>
      <p className="small muted" style={{ margin: 0 }}>
        What a point gets you as a voucher, against the best airline or hotel transfer at your point values.{mine?.length ? " Showing your cards only." : ""}
      </p>
      {rows.length === 0 ? (
        <p className="small muted">No voucher values listed for your cards yet.</p>
      ) : (
        <div className="tbl-wrap">
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Redemption</th>
                <th className="r">As a voucher</th>
                <th className="r">Best transfer</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.b.program + r.b.what + (r.b.cards ?? "")} className={r.voucherWins ? "rec" : undefined}>
                  <td>
                    <b>{r.b.what}</b>
                    <div className="small muted">
                      {programLabel(r.b.program, r.b.cards)} · {r.b.example}
                    </div>
                    {r.b.limits && <div className="small muted">{r.b.limits}</div>}
                  </td>
                  <td className="r num">₹{r.b.v.toFixed(2)}</td>
                  <td className="r num">
                    {r.transfer ? (
                      <>
                        ₹{r.transfer.per.toFixed(2)}
                        <div className="small muted">{r.transfer.via}</div>
                      </>
                    ) : (
                      <span className="small muted">No transfers</span>
                    )}
                  </td>
                  <td className="small" style={{ minWidth: 200 }}>
                    {!r.transfer ? "Vouchers or credit are the only way to use these points." : r.voucherWins ? <b>The voucher is as good or better.</b> : `Transferring gets ${(r.transfer.per / r.b.v).toFixed(1)}× more, if you'll use the miles.`}
                    <div>
                      <Conf c={r.b.conf} /> <Sources items={r.b.src} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted" style={{ margin: 0 }}>
        {VOUCHER_UNKNOWN} Transfers only beat vouchers if you find an award seat to use the miles on; set your own point values on Learn to change the comparison.
      </p>
    </section>
  );
}

"use client";

import { walletSummary, type Balance } from "@/lib/calc";
import { CARD_INFO, PARTNERS, PROGRAMS, type Program } from "@/lib/data";
import { fmt, inr, ratioTxt } from "@/lib/format";
import { PartnerLink } from "./PartnerLink";
import { useStore } from "./store";

export function Wallets() {
  return (
    <div className="wallets">
      {PROGRAMS.map((prog) => (
        <Wallet key={prog.key} prog={prog} />
      ))}
    </div>
  );
}

function sourceTag(b: Balance) {
  if (b.src === "mail") return { cls: "src mail", txt: "From email" + (b.asOf ? " · " + b.asOf : "") };
  if (b.src === "ex") return { cls: "src ex", txt: "Example" };
  return { cls: "src", txt: "Entered" };
}

function Wallet({ prog }: { prog: Program }) {
  const { balances, values, filter, setBalance, openGuide } = useStore();
  const b = balances[prog.key] || { n: 0, src: "manual" };
  const w = walletSummary(prog, { balances, values, filter });
  const { best, base } = w;
  const ci = CARD_INFO[prog.key];
  const tag = sourceTag(b);
  const maxPer = Math.max(base.per, ...w.options.map((r) => r.per), 0.01);
  const rows = [...w.options.map((r) => ({ ...r, isBase: false as const })), { isBase: true as const, per: base.per, worth: base.worth }].sort((x, y) => y.per - x.per);

  return (
    <article className={"wallet" + (b.n ? "" : " zero")}>
      <div className="w-head">
        <div>
          <div className="w-bank">{prog.bank}</div>
          <h3>{prog.card}</h3>
          {ci && (
            <div className={"w-status" + (/closed/i.test(ci.status) ? " closed" : "")}>
              {ci.status + (ci.fee ? " · fee " + inr(ci.fee) + "/yr" : "")}
            </div>
          )}
        </div>
        <span className={tag.cls} title={b.subject || undefined}>
          {tag.txt}
        </span>
      </div>
      <div className="bal">
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="0"
          aria-label={`${prog.card} balance in ${prog.unit}`}
          value={b.n || ""}
          onChange={(e) => setBalance(prog.key, +e.target.value)}
        />
        <span className="unit">{prog.unit}</span>
      </div>

      <div className="best">
        <div className="label">Best move</div>
        {!b.n ? (
          <>
            <div className="small muted">Enter a balance to see the best transfer.</div>
            {best && <div className="vs">{`Top rate: ${PARTNERS[best.p].n} at ₹${best.per.toFixed(2)} per point`}</div>}
          </>
        ) : w.directWins || !best ? (
          <>
            <div className="partner">Redeem directly: {prog.base.label}</div>
            <div className="line">
              <span className="val num">{inr(base.worth)}</span>
            </div>
            <div className="vs">No partner beats ₹{prog.base.v} per point for this filter.</div>
          </>
        ) : (
          <>
            <div className="partner">{PARTNERS[best.p].n}</div>
            <div className="line">
              <span className="num">{`${fmt(best.usable)} → ${fmt(best.got)} pts (${ratioTxt(best.ratio)})`}</span>
              <span className="val num">{inr(best.worth)}</span>
            </div>
            <div className="vs">
              {`₹${best.per.toFixed(2)} per point · ${(base.per ? best.per / base.per : 0).toFixed(1)}× the ${prog.base.label} value of ${inr(base.worth)}`}
            </div>
            <button type="button" className="how" onClick={() => openGuide(best.p)}>
              How to use {PARTNERS[best.p].n} →
            </button>
            {best.capped && best.grp && prog.caps && (
              <div className="capnote">
                Group {best.grp} cap is {fmt(prog.caps[best.grp])} a year. Send the remaining {fmt(b.n - best.usable)} to the next-best option below.
              </div>
            )}
          </>
        )}
      </div>

      <details>
        <summary>All {w.options.length} options</summary>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Partner</th>
                <th className="r">Ratio</th>
                <th className="r">You get</th>
                <th className="r">₹ / card pt</th>
                <th className="r">Worth</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.isBase ? "base" : r.p} className={[i === 0 && b.n ? "top1" : "", r.isBase ? "base" : ""].join(" ").trim() || undefined}>
                  {r.isBase ? (
                    <>
                      <td>Direct: {prog.base.label}</td>
                      <td className="r">—</td>
                      <td className="r">—</td>
                    </>
                  ) : (
                    <>
                      <td>
                        <PartnerLink p={r.p} />
                        {r.grp && <span className="grp">{r.grp}</span>}
                      </td>
                      <td className="r num">{ratioTxt(r.ratio)}</td>
                      <td className="r num">{b.n ? fmt(r.got) + (r.capped ? "*" : "") : "—"}</td>
                    </>
                  )}
                  <td className="r bar-cell">
                    <span className="fill" style={{ width: Math.round((70 * r.per) / maxPer) + "px" }} />
                    <span className="t num">₹{r.per.toFixed(2)}</span>
                  </td>
                  <td className="r num">{b.n ? inr(r.worth) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}

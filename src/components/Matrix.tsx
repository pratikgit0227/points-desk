"use client";

import { useMemo } from "react";
import { transferMatrix } from "@/lib/calc";
import { PROGRAMS } from "@/lib/data";
import { PartnerLink } from "./PartnerLink";

export function Matrix() {
  const rows = useMemo(() => transferMatrix("all"), []);
  return (
    <section className="panel" aria-labelledby="mxH">
      <h2 id="mxH">Which card to use for each partner</h2>
      <p className="small muted" style={{ margin: 0 }}>
        Partner points you get per 1 card point. Highlighted cell is the card that gives the most for that partner.
      </p>
      <div className="tbl-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th>Partner</th>
              {PROGRAMS.map((p) => (
                <th key={p.key} className="r prog">
                  {p.card}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.p}>
                <td>
                  <PartnerLink p={row.p} />
                </td>
                {row.rates.map((r, i) =>
                  r == null ? (
                    <td key={i} className="r num na">
                      —
                    </td>
                  ) : (
                    <td key={i} className={"r num" + (r === row.best ? " best-cell" : "")}>
                      {(+r.toFixed(2)).toString()}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { FoundBalance } from "@/lib/calc";
import { findProgram } from "@/lib/data";
import { fmt } from "@/lib/format";
import { parseBalances } from "@/lib/parse-balance";
import { useStore } from "./store";

/** Paste a statement email or SMS; the server reads the balances out of it with AI. */
export function BalanceImport() {
  const { found, addFound, applyFound, balances } = useStore();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({
    msg: "Paste a statement email or bank SMS and the balances are read out of it. Or type each balance straight into its card below.",
  });

  const known = found.filter((x) => findProgram(x.program));

  async function read() {
    const t = text.trim();
    if (!t) return setStatus({ msg: "Paste some text first.", err: true });
    const done = (list: FoundBalance[]) => {
      addFound(list);
      const n = list.length;
      setStatus({ msg: `Found ${n} balance${n > 1 ? "s" : ""}. Apply below.` });
    };
    const notFound = {
      msg: "No balance found in that text. Paste the line that names the card and its points balance, or type it into the card below.",
      err: true,
    };

    // Free, in-browser reading first: the text doesn't leave the device.
    const local = parseBalances(t);
    if (local.length) return done(local);

    // Optional AI fallback, only if it's switched on for this deployment.
    setBusy(true);
    setStatus({ msg: "Reading the pasted text…" });
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const data = (await res.json().catch(() => ({}))) as { balances?: FoundBalance[]; error?: string };
      if (res.status === 501) return setStatus(notFound);
      if (!res.ok || !data.balances) throw new Error(data.error || "Reading the text failed. Try again.");
      if (data.balances.length) done(data.balances);
      else setStatus(notFound);
    } catch (e) {
      setStatus({ msg: e instanceof Error ? e.message : "Reading the text failed. Try again.", err: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sync" aria-labelledby="syncH">
      <div className="sync-row">
        <h2 id="syncH" style={{ fontSize: 17 }}>
          Your balances
        </h2>
      </div>
      <div className="sync-row">
        <div className={"status" + (status.err ? " err" : "")} role="status">
          {status.msg}
        </div>
      </div>
      {known.length > 0 && (
        <div className="found">
          {known.map((x) => {
            const prog = findProgram(x.program)!;
            const cur = balances[x.program];
            const applied = cur?.src === "mail" && cur.n === x.balance;
            return (
              <div className="found-item" key={x.program}>
                <div>
                  <strong>{prog.card}: </strong>
                  <span className="num">
                    {fmt(x.balance)} {prog.unit}
                  </span>
                  {x.asOf && <span className="muted small">{"  as of " + x.asOf}</span>}
                </div>
                <button type="button" disabled={applied} onClick={() => applyFound([x])}>
                  {applied ? "Applied" : "Use this"}
                </button>
                <div className="ev">{(x.subject ? x.subject + " — " : "") + (x.evidence || "")}</div>
              </div>
            );
          })}
          {known.length > 1 && (
            <button type="button" style={{ alignSelf: "flex-start" }} onClick={() => applyFound(known)}>
              Use all {known.length}
            </button>
          )}
        </div>
      )}
      <details>
        <summary>Paste an email or SMS</summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label className="small muted" htmlFor="paste">
            Paste text from a statement, email or SMS. It&apos;s read in your browser and isn&apos;t stored or sent anywhere.
          </label>
          <textarea id="paste" placeholder="e.g. Your EDGE Miles balance as on 20-Sep-2026 is 48,250" value={text} onChange={(e) => setText(e.target.value)} />
          <div>
            <button type="button" className="primary" disabled={busy} onClick={read}>
              {busy ? "Reading…" : "Read balance from text"}
            </button>
          </div>
        </div>
      </details>
    </section>
  );
}

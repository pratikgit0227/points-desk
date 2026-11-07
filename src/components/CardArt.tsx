import { useId } from "react";
import { CARD_ART } from "@/lib/data";

/** Card illustration. Colours only; not the banks' artwork. */
export function CardArt({ cardKey, label, bank }: { cardKey: string; label: string; bank: string }) {
  const [a, b] = CARD_ART[cardKey] || ["#334", "#99a"];
  const ink = cardKey === "amex_mr" ? "#222" : "#fff";
  const id = "g" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const name = label.length > 24 ? label.slice(0, 23) + "…" : label;
  return (
    <svg className="cardart" viewBox="0 0 320 202" role="img" aria-label={`${bank} ${label} card illustration`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="320" height="202" rx="16" fill={`url(#${id})`} />
      <circle cx="270" cy="30" r="90" fill="#fff" opacity=".07" />
      <rect x="24" y="64" width="42" height="32" rx="6" fill="#e6c97a" opacity=".92" />
      <path d="M24 80h42M45 64v32" stroke="#a88a3a" strokeWidth="1.5" opacity=".7" />
      <text x="24" y="38" fontSize="15" fontWeight="700" fill={ink} fontFamily="sans-serif">{bank}</text>
      <text x="24" y="168" fontSize="19" fontWeight="700" fill={ink} fontFamily="sans-serif">{name}</text>
      <text x="24" y="188" fontSize="11" fill={ink} opacity=".75" fontFamily="monospace">•••• •••• •••• ••••</text>
      <circle cx="276" cy="176" r="14" fill="#fff" opacity=".35" />
      <circle cx="292" cy="176" r="14" fill="#fff" opacity=".2" />
    </svg>
  );
}

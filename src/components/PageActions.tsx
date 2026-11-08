"use client";

import { useRouter } from "next/navigation";
import type { PartnerId } from "@/lib/data";
import { useStore } from "./store";

/** "I have this card" toggle on a card page. */
export function HaveCardButton({ cardKey }: { cardKey: string }) {
  const { mine, toggleMine } = useStore();
  const on = mine?.includes(cardKey) ?? false;
  return (
    <button type="button" className={on ? "" : "primary"} aria-pressed={on} onClick={() => toggleMine(cardKey)}>
      {on ? "✓ In My cards" : "+ I have this card"}
    </button>
  );
}

/** Opens the destination in the Plan a trip tab, with the user's own cards and balances. */
export function PlanTripButton({ id, name }: { id: string; name: string }) {
  const { setTrip } = useStore();
  const router = useRouter();
  return (
    <button
      type="button"
      className="primary"
      onClick={() => {
        setTrip({ id, q: name, airline: 0, fare: 0 });
        router.push("/plan");
      }}
    >
      Plan this trip with my cards →
    </button>
  );
}

/** Opens a partner's how-to guide. */
export function GuideButton({ p, children }: { p: PartnerId; children: React.ReactNode }) {
  const { openGuide } = useStore();
  return (
    <button type="button" className="link" onClick={() => openGuide(p)}>
      {children}
    </button>
  );
}

"use client";

import type { ReactNode } from "react";
import { PARTNERS, type PartnerId } from "@/lib/data";
import { useStore } from "./store";

/** Partner name that opens its how-to guide. */
export function PartnerLink({ p, children }: { p: PartnerId; children?: ReactNode }) {
  const { openGuide } = useStore();
  return (
    <button type="button" className="pl" title={"How to use " + PARTNERS[p].n} onClick={() => openGuide(p)}>
      {children ?? PARTNERS[p].n}
    </button>
  );
}

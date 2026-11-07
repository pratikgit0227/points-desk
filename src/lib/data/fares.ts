import type { FareSnapshot } from "./types";

/**
 * Weekly cash-fare snapshot, keyed like CODES ("partner|spot index").
 * cash = cheapest one-way fare in ₹ for 1 adult in the spot's cabin,
 * travel = date searched, checked = date looked up.
 */
export const FARES: Record<string, FareSnapshot> = {
  "jal|0": {cash: 70000, travel: "", checked: "2026-09-25", src: "Google Flights (Pratik's check)"},
  "jal|1": {cash: 198255, travel: "2026-12-15", checked: "2026-09-25", src: "Google Flights, JAL nonstop"}
};

/** Main sections, in dock order. The order decides which way pages slide. */
export const TABS = [
  { href: "/", label: "My Wallet", icon: "wallet" },
  { href: "/plan", label: "Plan a trip", icon: "plane" },
  { href: "/cards", label: "Choose a card", icon: "card" },
  { href: "/learn", label: "Learn", icon: "book" },
] as const;

/** Index of the section a path belongs to (destination pages sit under Plan, changes under Learn). */
export function tabIndex(path: string): number {
  if (path.startsWith("/fly") || path.startsWith("/plan") || path.startsWith("/trips")) return 1;
  if (path.startsWith("/cards")) return 2;
  if (path.startsWith("/learn") || path.startsWith("/changes")) return 3;
  return path === "/" ? 0 : -1;
}

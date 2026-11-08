/** Main sections. Shared by the server-rendered fallback and the client tab bar. */
export const TABS = [
  { href: "/", label: "My Wallet" },
  { href: "/plan", label: "Plan a trip" },
  { href: "/cards", label: "Choose a card" },
  { href: "/learn", label: "Learn" },
] as const;

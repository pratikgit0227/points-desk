import type { Merchant } from "./types";

/** Merchants the booking finder knows about. `p` links to a transfer partner. */
export const MERCHANTS: Merchant[] = [
  {id:"indigo", n:"IndiGo", kw:"indigo 6e interglobe flight ticket", p:"indigo"},
  {id:"airindia", n:"Air India", kw:"air india express flight ticket", p:"airindia"},
  {id:"spicejet", n:"SpiceJet", kw:"spicejet flight ticket", p:"spicejet"},
  {id:"akasa", n:"Akasa Air", kw:"akasa flight ticket"},
  {id:"sq", n:"Singapore Airlines", kw:"singapore airlines krisflyer flight ticket", p:"krisflyer"},
  {id:"qatar", n:"Qatar Airways", kw:"qatar airways flight ticket", p:"qatar"},
  {id:"ba", n:"British Airways", kw:"british airways flight ticket", p:"ba"},
  {id:"jal", n:"Japan Airlines", kw:"jal japan airlines flight ticket", p:"jal"},
  {id:"anyair", n:"Any other airline", kw:"airline flight ticket international domestic"},
  {id:"marriott", n:"Marriott hotel", kw:"marriott hotel stay", p:"marriott"},
  {id:"hilton", n:"Hilton hotel", kw:"hilton hotel stay", p:"hilton"},
  {id:"hotel", n:"Any other hotel", kw:"hotel stay booking"}
];

export function isHotelMerchant(m: Merchant): boolean {
  return /hotel/.test(m.id) || ["marriott", "hilton"].includes(m.id);
}

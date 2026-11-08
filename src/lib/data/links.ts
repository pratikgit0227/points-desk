import type { PartnerId } from "./partners";

/** Airport codes per guide spot ("partner|spot index" → [origin, destination]) for fare-site links. */
export const CODES: Record<string, readonly [string, string]> = {
  "jal|0":["DEL","NRT"], "jal|1":["DEL","NRT"],
  "krisflyer|0":["DEL","SIN"], "krisflyer|1":["BOM","SIN"], "krisflyer|2":["DEL","NRT"], "krisflyer|3":["DEL","SYD"], "krisflyer|4":["DEL","JFK"],
  "aeroplan|0":["DEL","FRA"], "aeroplan|1":["DEL","FRA"], "aeroplan|2":["DEL","LHR"], "aeroplan|3":["DEL","JFK"], "aeroplan|4":["DEL","BKK"], "aeroplan|5":["DEL","SIN"], "aeroplan|6":["DEL","BOM"],
  "turkish|0":["CDG","IST"],
  "flyingblue|0":["BOM","CDG"], "flyingblue|1":["DEL","CDG"],
  "airindia|0":["DEL","DXB"], "airindia|1":["BOM","MRU"], "airindia|2":["DEL","LHR"], "airindia|3":["DEL","SFO"], "airindia|4":["DEL","YYZ"],
  "qatar|0":["DEL","DOH"], "qatar|1":["DOH","LHR"], "qatar|2":["DOH","JFK"],
  "ba|0":["DEL","LHR"], "ba|1":["DEL","LHR"], "finnair|0":["DEL","HEL"],
  "etihad|0":["AUH","LHR"], "etihad|1":["DEL","AUH"], "cathay|0":["DEL","HKG"], "cathay|1":["HKG","JFK"],
  "thai|0":["DEL","BKK"], "ethiopian|0":["DEL","ADD"], "qantas|0":["BLR","SYD"], "vietnam|0":["DEL","HAN"],
  "virgin|0":["DEL","LHR"], "lifemiles|0":["DEL","FRA"], "milesmore|0":["DEL","FRA"], "airasia|0":["CCU","KUL"],
  "spicejet|0":["DEL","BOM"], "indigo|0":["DEL","BOM"]
};

/** Each programme's own site, for award searches. */
export const SITES: Partial<Record<PartnerId, string>> = {
  jal:"https://www.jal.co.jp/jp/en/jalmile/", krisflyer:"https://www.singaporeair.com/", aeroplan:"https://www.aircanada.com/aeroplan",
  turkish:"https://www.turkishairlines.com/", flyingblue:"https://www.flyingblue.com/", airindia:"https://www.airindia.com/",
  qatar:"https://www.qatarairways.com/", ba:"https://www.britishairways.com/", finnair:"https://www.finnair.com/", united:"https://www.united.com/",
  etihad:"https://www.etihad.com/", cathay:"https://www.cathaypacific.com/", thai:"https://www.thaiairways.com/", ethiopian:"https://www.ethiopianairlines.com/",
  qantas:"https://www.qantas.com/", vietnam:"https://www.vietnamairlines.com/", virgin:"https://www.virginatlantic.com/", lifemiles:"https://www.lifemiles.com/",
  milesmore:"https://www.miles-and-more.com/", airasia:"https://www.airasia.com/", spicejet:"https://www.spicejet.com/", indigo:"https://www.goindigo.in/",
  accor:"https://all.accor.com/", hilton:"https://www.hilton.com/", ihg:"https://www.ihg.com/", marriott:"https://www.marriott.com/",
  wyndham:"https://www.wyndhamhotels.com/", itc:"https://www.itchotels.com/", radisson:"https://www.radissonhotels.com/"
};

/** Travelpayouts partner id. Public: it is also in the page's site script. */
export const TP_MARKER = "597231";

/** Aviasales one-way economy search, tagged with the Travelpayouts partner id. date is YYYY-MM-DD. */
export function aviasalesLink(from: string, to: string, date: string): string {
  return `https://www.aviasales.com/search/${from}${date.slice(8, 10)}${date.slice(5, 7)}${to}1?marker=${TP_MARKER}`;
}

/** Programmes that seats.aero can search for award space. */
export const SEATS_AERO: readonly PartnerId[] = ["jal","krisflyer","aeroplan","turkish","flyingblue","qatar","ba","finnair","united","etihad","cathay","qantas","virgin","lifemiles","airindia"];

/**
 * Where to apply for each card. Today these are the banks' own pages and earn nothing.
 * To add an affiliate link later, swap the href and set aff: true; the disclosure
 * then shows next to the button automatically. Links never change any ranking.
 */
export interface ApplyLink {
  href: string;
  /** Points Desk may earn a commission from this link */
  aff?: boolean;
}

export const APPLY_CHECKED = "2026-11-08";

export const APPLY: Record<string, ApplyLink> = {
  axis_magnus: { href: "https://www.axis.bank.in/cards/credit-card/axis-bank-magnus-credit-card" },
  axis_horizon: { href: "https://www.axis.bank.in/cards/credit-card/axis-horizon-credit-card" },
  hdfc_regalia_gold: { href: "https://www.hdfc.bank.in/credit-cards/regalia-gold-credit-card" },
  amex_mr: { href: "https://www.americanexpress.com/in/credit-cards/platinum-travel-credit-card/" },
  hsbc_travelone: { href: "https://www.hsbc.bank.in/credit-cards/products/travelone/" },
  scapia: { href: "https://www.scapia.cards/" },
};

import type { Destination } from "./types";

/**
 * North America and Australia. Award prices: lowest one-way awards seen on
 * AwardTool (7 Oct – 6 Nov 2026), Air India's April 2026 chart (USA &
 * Australia economy from 40,000; Delhi–USA business 130,000 Value fare),
 * Aeroplan's chart (6,001–8,000 mile band: 60,000 / 90,000). Cash fares from
 * Air India's listed "from"/"typical" fares or rough estimates.
 */
const CHECKED = "Nov 2026";
const SRC = "AwardTool award searches (Oct–Nov 2026), Air India Maharaja Club chart (Apr 2026), Aeroplan chart, AwardWallet, Magnify, Milesopedia";

const AI_LONG = "Value fare price; Air India releases few seats at it and charges more (Prime) once they're gone. Low taxes.";
const AEROPLAN_LONG = "Fixed chart, no fuel surcharges: taxes plus a CA$39 partner fee. Air India releases few seats to partners, so search several dates.";
const UNITED = "Dynamic; this is the lowest seen. Low taxes, about US$40–60.";
const FB_LONG = "Dynamic. Taxes about US$240–280 in economy and US$560–775 in business.";
const QATAR_LONG = "Via Doha. Qatar adds surcharges, likely US$200–600.";

export const AMERICAS_OCEANIA: Destination[] = [
  {
    id: "jfk", name: "New York", country: "USA", code: "JFK", kw: "new york nyc jfk ewr newark usa us america united states",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi (JFK and Newark), Mumbai" },
      { airline: "United", from: "Delhi (Newark)" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → New York, nonstop", eco: 40000, biz: 130000, pricing: "fixed", confidence: "high", note: "Business dropped from 180,000 in April 2026. " + AI_LONG },
      { p: "aeroplan", airline: "Air India", route: "Delhi / Mumbai → New York, nonstop", eco: 60000, biz: 90000, pricing: "fixed", confidence: "high", note: "Cheapest business on the Air India nonstop. " + AEROPLAN_LONG },
      { p: "united", airline: "Air India / United", route: "Delhi / Mumbai → New York, nonstop", eco: 45000, biz: 88000, pricing: "dynamic", confidence: "high", note: UNITED },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → New York", eco: 40000, biz: 80000, pricing: "fixed", confidence: "medium", note: QATAR_LONG },
      { p: "flyingblue", airline: "Air France / KLM", route: "Delhi / Mumbai → New York via Paris / Amsterdam", eco: 40000, biz: 115000, pricing: "dynamic", confidence: "high", note: FB_LONG },
      { p: "etihad", airline: "Etihad", route: "Delhi → Abu Dhabi → New York", eco: 27000, biz: 93000, pricing: "dynamic", confidence: "medium", note: "Lowest seen. Taxes about US$350 / US$425." },
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi / Mumbai → Istanbul → New York", eco: 60000, biz: 100000, pricing: "fixed", confidence: "medium", note: "Via Istanbul." },
    ],
    fare: { eco: 55000, biz: 250000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "sfo", name: "San Francisco", country: "USA", code: "SFO", kw: "san francisco sfo bay area silicon valley california usa us america united states",
    nonstop: [{ airline: "Air India", merchant: "airindia", from: "Delhi (Mumbai and Bengaluru flights now make a stop)" }],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi → San Francisco, nonstop", eco: 40000, biz: 130000, pricing: "fixed", confidence: "high", note: "Economy dropped from 77,000 and business from 185,000 in April 2026. " + AI_LONG },
      { p: "aeroplan", airline: "Air India", route: "Delhi → San Francisco, nonstop", eco: 60000, biz: 90000, pricing: "fixed", confidence: "medium", note: AEROPLAN_LONG },
      { p: "united", airline: "Air India", route: "Delhi → San Francisco, nonstop", eco: 49500, biz: 88000, pricing: "dynamic", confidence: "high", note: UNITED },
      { p: "flyingblue", airline: "Air France / KLM", route: "Delhi → San Francisco via Paris / Amsterdam", eco: 40000, biz: 126500, pricing: "dynamic", confidence: "high", note: FB_LONG },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → San Francisco", eco: 40000, biz: 153000, pricing: "fixed", confidence: "medium", note: "Business may be mixed-cabin. " + QATAR_LONG },
    ],
    fare: { eco: 65000, biz: 288000 }, checked: CHECKED, src: SRC + ", airindia.com fare listings",
  },
  {
    id: "yyz", name: "Toronto", country: "Canada", code: "YYZ", kw: "toronto yyz canada vancouver ontario north america",
    nonstop: [{ airline: "Air India", merchant: "airindia", from: "Delhi (10 a week); Mumbai 3 a week until 26 Mar 2027" }],
    options: [
      { p: "aeroplan", airline: "Air India", route: "Delhi / Mumbai → Toronto, nonstop", eco: 60000, biz: 90000, pricing: "fixed", confidence: "high", note: AEROPLAN_LONG },
      { p: "airindia", airline: "Air India", route: "Delhi → Toronto, nonstop", eco: 40000, biz: 130000, pricing: "fixed", confidence: "medium", note: "Business dropped from 165,000. Economy estimated from the USA price. " + AI_LONG },
      { p: "united", airline: "Air India", route: "Delhi → Toronto, nonstop", eco: 49500, biz: 88000, pricing: "dynamic", confidence: "high", note: UNITED },
      { p: "flyingblue", airline: "Air France / KLM", route: "Delhi → Toronto via Paris / Amsterdam", eco: 36700, biz: 103000, pricing: "dynamic", confidence: "high", note: FB_LONG },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → Toronto", eco: 40000, biz: 80000, pricing: "fixed", confidence: "medium", note: QATAR_LONG },
      { p: "lifemiles", airline: "Star Alliance", route: "Delhi → Toronto", eco: 55000, biz: 90000, pricing: "fixed", confidence: "medium", note: "Low taxes, about US$45." },
    ],
    fare: { eco: 70000, biz: 230000 }, checked: CHECKED, src: SRC + ", airindia.com fare listings",
  },
  {
    id: "syd", name: "Sydney", country: "Australia", code: "SYD", kw: "sydney syd australia oceania",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi" },
      { airline: "Qantas", from: "Bengaluru" },
    ],
    options: [
      { p: "qantas", airline: "Qantas", route: "Bengaluru → Sydney, nonstop", eco: 43200, biz: 113900, pricing: "fixed", confidence: "high", note: "Classic Reward chart. Taxes about US$113 / US$295." },
      { p: "airindia", airline: "Air India", route: "Delhi → Sydney, nonstop", eco: 40000, biz: 130000, pricing: "fixed", confidence: "medium", note: "Business estimated from Delhi–Melbourne. " + AI_LONG },
      { p: "krisflyer", airline: "Singapore Airlines", route: "Delhi → Singapore → Sydney", eco: 42000, biz: 100000, pricing: "fixed", confidence: "medium", note: "Saver award, priced as one ticket. Taxes extra." },
      { p: "united", airline: "Air India", route: "Delhi → Sydney, nonstop", eco: 50000, biz: 110000, pricing: "dynamic", confidence: "high", note: UNITED },
      { p: "aeroplan", airline: "Air India / Singapore / Thai", route: "Bengaluru → Sydney, 1 stop", eco: 60000, biz: 92500, pricing: "fixed", confidence: "medium", note: "Taxes about US$80–95 plus the partner fee." },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → Sydney", eco: 40000, biz: 83000, pricing: "fixed", confidence: "medium", note: "A long detour. " + QATAR_LONG },
      { p: "lifemiles", airline: "Thai Airways", route: "Delhi → Bangkok → Sydney", eco: 48700, biz: 76500, pricing: "fixed", confidence: "medium", note: "Cheapest business seen. Low taxes." },
    ],
    fare: { eco: 56000, biz: 200000 }, checked: CHECKED, src: SRC + ", Card Express (KrisFlyer)",
  },
  {
    id: "mel", name: "Melbourne", country: "Australia", code: "MEL", kw: "melbourne mel australia oceania",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi" },
      { airline: "Qantas", from: "Delhi (seasonal, about 3 a week)" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi → Melbourne, nonstop", eco: 40000, biz: 130000, pricing: "fixed", confidence: "high", note: "Business rose from 125,000 in April 2026. " + AI_LONG },
      { p: "qantas", airline: "Qantas", route: "Delhi → Melbourne, nonstop (seasonal)", eco: 43200, biz: 113900, pricing: "fixed", confidence: "high", note: "Classic Reward chart. Taxes about US$100 / US$290. Check the season is running." },
      { p: "flyingblue", airline: "Qantas (economy) / partners (business)", route: "Delhi → Melbourne", eco: 34000, biz: 83000, pricing: "dynamic", confidence: "high", note: "Economy on the Qantas nonstop; business has a stop. Taxes about US$120 / US$325." },
      { p: "krisflyer", airline: "Singapore Airlines", route: "Delhi → Singapore → Melbourne", eco: 42000, biz: 100000, pricing: "fixed", confidence: "low", note: "Same zone as Sydney; estimated." },
      { p: "united", airline: "Air India", route: "Delhi → Melbourne, nonstop", eco: 50000, biz: 110000, pricing: "dynamic", confidence: "high", note: UNITED },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → Melbourne", eco: 40000, biz: 80000, pricing: "fixed", confidence: "medium", note: "A long detour. " + QATAR_LONG },
      { p: "lifemiles", airline: "Star Alliance", route: "Delhi → Melbourne, 1 stop", eco: 61900, biz: 77700, pricing: "fixed", confidence: "medium", note: "Low taxes." },
    ],
    fare: { eco: 55000, biz: 200000 }, checked: CHECKED, src: SRC,
  },
];

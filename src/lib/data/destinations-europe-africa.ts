import type { Destination } from "./types";

/**
 * Europe and Africa. Award prices: lowest one-way awards seen on AwardTool
 * (Oct–Nov 2026), Aeroplan's June 2026 chart, Air India's April 2026 chart
 * (Europe economy 35,000; business not published per route, estimated from
 * Ahmedabad–London Gatwick at 100,000). Cash fares are rough midpoints.
 */
const CHECKED = "Nov 2026";
const SRC = "AwardTool award searches (Oct–Nov 2026), Aeroplan chart (Jun 2026), Air India Maharaja Club chart (Apr 2026), Magnify, AwardWallet, Live From A Lounge";

const AEROPLAN_EU = "Fixed chart. About US$50 taxes on Air India flights plus Aeroplan's partner booking fee; Lufthansa and Swiss flights add surcharges. Air India releases few seats to partners.";
const AI_EU = "Europe economy is 35,000 (Value fare). Business isn't published per route; estimated at about 100,000.";
const QATAR_EU = "Via Doha on Qatar's own flights, much cheaper than BA's nonstop. Taxes moderate.";
const FB_EU = "Dynamic. India–Europe awards are 25% off until Dec 2026, so prices may rise in 2027. Light fares have no checked bag.";
const TK_VIA = "Via Istanbul.";
const LIFEMILES = "Fixed chart, low taxes (about US$25–40).";
const VIRGIN = "Lowest price seen; usually higher. Taxes about US$120–160 in economy, US$250–420 in business.";

export const EUROPE_AFRICA: Destination[] = [
  {
    id: "lhr", name: "London", country: "UK", code: "LHR", kw: "london lhr lgw heathrow gatwick uk united kingdom england britain europe",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai, Bengaluru; Ahmedabad to Gatwick" },
      { airline: "British Airways", merchant: "ba", from: "Delhi, Mumbai, Bengaluru, Hyderabad, Chennai" },
      { airline: "Virgin Atlantic", from: "Delhi, Mumbai, Bengaluru (Amex transfers to Virgin)" },
      { airline: "IndiGo", merchant: "indigo", from: "Delhi, Mumbai" },
    ],
    options: [
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha → London", eco: 27500, biz: 55000, pricing: "fixed", confidence: "medium", note: QATAR_EU },
      { p: "virgin", airline: "Virgin Atlantic", route: "Delhi → London, nonstop", eco: 15500, biz: 29000, pricing: "dynamic", confidence: "medium", note: VIRGIN },
      { p: "aeroplan", airline: "Air India", route: "Delhi → London, nonstop", eco: 42500, biz: 70000, pricing: "fixed", confidence: "high", note: AEROPLAN_EU },
      { p: "flyingblue", airline: "Virgin (economy) / Air France-KLM (business)", route: "Delhi → London, nonstop or via Paris/Amsterdam", eco: 29000, biz: 69000, pricing: "dynamic", confidence: "medium", note: FB_EU },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → London, nonstop", eco: 35000, biz: 100000, pricing: "fixed", confidence: "medium", note: AI_EU },
      { p: "ba", airline: "British Airways", route: "Delhi → London, nonstop", eco: 33000, biz: 99000, pricing: "fixed", confidence: "high", note: "Off-peak (peak 38,500 / 110,000). Heavy surcharges, roughly ₹15–20k economy and ₹40–60k business. BA has stopped releasing last-minute award seats to India." },
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi → Istanbul → London", eco: 35000, biz: 90000, pricing: "fixed", confidence: "medium", note: TK_VIA },
    ],
    fare: { eco: 45000, biz: 200000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "cdg", name: "Paris", country: "France", code: "CDG", kw: "paris cdg france europe",
    nonstop: [
      { airline: "Air France", from: "Delhi, Mumbai, Bengaluru (Flying Blue partner)" },
      { airline: "Air India", merchant: "airindia", from: "Delhi (fewer flights this winter)" },
    ],
    options: [
      { p: "virgin", airline: "Air France / KLM", route: "Mumbai → Paris", eco: 15000, biz: 61000, pricing: "dynamic", confidence: "medium", note: VIRGIN },
      { p: "qatar", airline: "Qatar Airways", route: "Mumbai / Delhi → Doha → Paris", eco: 27500, biz: 55000, pricing: "fixed", confidence: "medium", note: QATAR_EU },
      { p: "flyingblue", airline: "Air France", route: "Mumbai → Paris, nonstop", eco: 33250, biz: 68500, pricing: "dynamic", confidence: "medium", note: FB_EU + " Taxes about US$170 / US$440." },
      { p: "aeroplan", airline: "Air India / Star Alliance", route: "Delhi → Paris, nonstop (or via a hub from Mumbai)", eco: 42500, biz: 70000, pricing: "fixed", confidence: "high", note: AEROPLAN_EU },
      { p: "lifemiles", airline: "Star Alliance", route: "Mumbai → Paris, 1 stop", eco: 34800, biz: 60100, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "turkish", airline: "Turkish Airlines", route: "Mumbai → Istanbul → Paris", eco: 35000, biz: 60000, pricing: "fixed", confidence: "medium", note: TK_VIA },
      { p: "airindia", airline: "Air India", route: "Delhi → Paris, nonstop", eco: 35000, biz: 100000, pricing: "fixed", confidence: "medium", note: AI_EU },
    ],
    fare: { eco: 45000, biz: 180000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "fra", name: "Frankfurt", country: "Germany", code: "FRA", kw: "frankfurt fra germany munich europe schengen",
    nonstop: [
      { airline: "Lufthansa", from: "Delhi, Mumbai, Bengaluru, Chennai, Hyderabad" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai" },
    ],
    options: [
      { p: "aeroplan", airline: "Air India / Lufthansa", route: "Delhi → Frankfurt, nonstop", eco: 30000, biz: 40000, pricing: "fixed", confidence: "high", note: "Best-value India–Europe business award. " + AEROPLAN_EU },
      { p: "flyingblue", airline: "Air France / KLM", route: "Delhi → Frankfurt, 1 stop", eco: 26250, biz: 55500, pricing: "dynamic", confidence: "medium", note: FB_EU },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → Frankfurt", eco: 27500, biz: 55000, pricing: "fixed", confidence: "medium", note: QATAR_EU },
      { p: "lifemiles", airline: "Lufthansa", route: "Delhi → Frankfurt (nonstop economy, 1 stop business)", eco: 34800, biz: 60100, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi → Istanbul → Frankfurt", eco: 35000, biz: 60000, pricing: "fixed", confidence: "medium", note: TK_VIA },
      { p: "milesmore", airline: "Lufthansa", route: "Delhi → Frankfurt, nonstop", biz: 30300, pricing: "dynamic", confidence: "medium", note: "Lowest business price seen; dynamic and often higher. Heavy surcharges, about US$500. Axis Group B, capped at 2,00,000 a year." },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Frankfurt, nonstop", eco: 35000, biz: 100000, pricing: "fixed", confidence: "medium", note: AI_EU },
    ],
    fare: { eco: 45000, biz: 180000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "ams", name: "Amsterdam", country: "Netherlands", code: "AMS", kw: "amsterdam ams netherlands holland europe schengen",
    nonstop: [
      { airline: "KLM", from: "Delhi, Mumbai, Bengaluru (Flying Blue partner)" },
      { airline: "IndiGo", merchant: "indigo", from: "Mumbai" },
    ],
    options: [
      { p: "aeroplan", airline: "Air India", route: "Delhi → Amsterdam, nonstop", eco: 30000, biz: 40000, pricing: "fixed", confidence: "high", note: AEROPLAN_EU },
      { p: "virgin", airline: "KLM", route: "Delhi → Amsterdam, nonstop", eco: 15000, biz: 61000, pricing: "dynamic", confidence: "medium", note: VIRGIN },
      { p: "flyingblue", airline: "KLM", route: "Delhi → Amsterdam, nonstop or 1 stop", eco: 30000, biz: 66500, pricing: "dynamic", confidence: "medium", note: FB_EU + " Nonstop business from 85,000." },
      { p: "lifemiles", airline: "Star Alliance", route: "Delhi → Amsterdam, 1 stop", eco: 29580, biz: 51090, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → Amsterdam", eco: 27500, biz: 55000, pricing: "fixed", confidence: "medium", note: QATAR_EU },
      { p: "airindia", airline: "Air India", route: "Delhi → Amsterdam", eco: 35000, biz: 100000, pricing: "fixed", confidence: "medium", note: AI_EU },
      { p: "indigo", airline: "IndiGo", route: "Mumbai → Amsterdam, nonstop", pricing: "revenue", confidence: "high", note: "BluChip points pay the fare." },
    ],
    fare: { eco: 45000, biz: 170000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "zrh", name: "Zurich", country: "Switzerland", code: "ZRH", kw: "zurich zrh switzerland swiss geneva europe schengen",
    nonstop: [
      { airline: "Swiss", from: "Mumbai, Delhi" },
      { airline: "Air India", merchant: "airindia", from: "Delhi (fewer flights this winter)" },
    ],
    options: [
      { p: "aeroplan", airline: "Swiss / Air India", route: "Delhi / Mumbai → Zurich, nonstop", eco: 30000, biz: 40000, pricing: "fixed", confidence: "medium", note: "Same chart band as Frankfurt. " + AEROPLAN_EU },
      { p: "qatar", airline: "Qatar Airways", route: "Mumbai → Doha → Zurich", eco: 27500, biz: 55000, pricing: "fixed", confidence: "medium", note: QATAR_EU },
      { p: "flyingblue", airline: "Air France / KLM", route: "Mumbai → Zurich via Paris / Amsterdam", eco: 30000, biz: 64000, pricing: "dynamic", confidence: "medium", note: FB_EU },
      { p: "lifemiles", airline: "Swiss", route: "Mumbai → Zurich, nonstop", eco: 34800, biz: 60100, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "turkish", airline: "Turkish Airlines", route: "Mumbai → Istanbul → Zurich", eco: 35000, biz: 60000, pricing: "fixed", confidence: "medium", note: TK_VIA },
      { p: "milesmore", airline: "Swiss", route: "Mumbai → Zurich, nonstop", biz: 51650, pricing: "dynamic", confidence: "medium", note: "Dynamic; surcharges about US$565 in business. Axis Group B." },
    ],
    fare: { eco: 50000, biz: 215000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "ist", name: "Istanbul", country: "Turkey", code: "IST", kw: "istanbul ist turkey turkiye europe",
    nonstop: [
      { airline: "Turkish Airlines", from: "Delhi, Mumbai and more" },
      { airline: "IndiGo", merchant: "indigo", from: "Delhi, Mumbai" },
    ],
    options: [
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi → Istanbul, nonstop", eco: 20000, biz: 35000, pricing: "fixed", confidence: "medium", note: "Turkish has raised prices without notice before; price the trip before transferring." },
      { p: "lifemiles", airline: "Turkish Airlines", route: "Delhi → Istanbul, nonstop", eco: 25000, biz: 45000, pricing: "fixed", confidence: "high", note: "Low taxes, about US$24." },
      { p: "aeroplan", airline: "Turkish Airlines", route: "Delhi → Istanbul (nonstop business, 1 stop economy)", eco: 30000, biz: 40000, pricing: "fixed", confidence: "medium", note: "About US$60 taxes plus the partner booking fee." },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi → Doha → Istanbul", eco: 25000, biz: 48000, pricing: "fixed", confidence: "medium", note: "Business may be mixed-cabin." },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi → Istanbul, 1 stop", eco: 26500, biz: 47000, pricing: "dynamic", confidence: "medium", note: "Taxes about US$165 / US$405." },
      { p: "indigo", airline: "IndiGo", route: "Delhi / Mumbai → Istanbul, nonstop", pricing: "revenue", confidence: "high", note: "BluChip points pay the fare." },
    ],
    fare: { eco: 28000, biz: 95000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "mru", name: "Mauritius", country: "Mauritius", code: "MRU", kw: "mauritius mru port louis africa island honeymoon",
    nonstop: [
      { airline: "Air Mauritius", from: "Mumbai, Delhi (weekly), Bengaluru, Chennai" },
      { airline: "Air India", merchant: "airindia", from: "Mumbai" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Mumbai → Mauritius, nonstop", eco: 12000, biz: 40000, pricing: "fixed", confidence: "medium", note: "Economy 12,000 (Value fare). Business not published; estimated 35,000–45,000." },
      { p: "aeroplan", airline: "Air India / Air Mauritius", route: "Mumbai → Mauritius, nonstop", eco: 30000, biz: 40000, pricing: "fixed", confidence: "high", note: "About US$50 taxes plus the partner booking fee." },
      { p: "virgin", airline: "Air France / Kenya Airways", route: "Mumbai → Mauritius, 1 stop", eco: 27000, biz: 75000, pricing: "dynamic", confidence: "medium", note: "Taxes about US$180 / US$235." },
      { p: "flyingblue", airline: "Air Mauritius", route: "Mumbai → Mauritius, nonstop", eco: 32000, biz: 80500, pricing: "dynamic", confidence: "medium", note: "Taxes about US$230 / US$430." },
      { p: "etihad", airline: "Etihad", route: "Mumbai → Abu Dhabi → Mauritius", eco: 24600, biz: 88000, pricing: "dynamic", confidence: "low", note: "High taxes, especially in business (about US$860)." },
    ],
    fare: { eco: 32000, biz: 105000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "nbo", name: "Nairobi", country: "Kenya", code: "NBO", kw: "nairobi nbo kenya safari africa",
    nonstop: [
      { airline: "Kenya Airways", from: "Mumbai (book with Virgin points)" },
      { airline: "Air India", merchant: "airindia", from: "Mumbai" },
      { airline: "IndiGo", merchant: "indigo", from: "Mumbai" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Mumbai → Nairobi, nonstop", eco: 12000, biz: 40000, pricing: "fixed", confidence: "medium", note: "Economy 12,000 (Value fare). Business not published; estimated." },
      { p: "virgin", airline: "Kenya Airways", route: "Mumbai → Nairobi, nonstop", eco: 15500, biz: 40000, pricing: "dynamic", confidence: "high", note: "Seats on most dates. Taxes about US$120 / US$150." },
      { p: "qatar", airline: "Qatar Airways", route: "Mumbai → Doha → Nairobi", eco: 25000, biz: 48000, pricing: "fixed", confidence: "medium" },
      { p: "flyingblue", airline: "Air France / KLM / Saudia", route: "Mumbai → Nairobi, 1 stop", eco: 29000, biz: 52500, pricing: "dynamic", confidence: "medium", note: "Taxes about US$170 / US$410." },
      { p: "aeroplan", airline: "Air India", route: "Mumbai → Nairobi, nonstop", eco: 30000, biz: 40000, pricing: "fixed", confidence: "high", note: "About US$87 taxes plus the partner booking fee." },
      { p: "ethiopian", airline: "Ethiopian Airlines", route: "Mumbai / Delhi → Addis Ababa → Nairobi", eco: 27500, biz: 60000, pricing: "fixed", confidence: "low", note: "Estimated from Ethiopian's zone chart." },
      { p: "indigo", airline: "IndiGo", route: "Mumbai → Nairobi, nonstop", pricing: "revenue", confidence: "high", note: "BluChip points pay the fare." },
    ],
    fare: { eco: 35000, biz: 120000 }, checked: CHECKED, src: SRC,
  },
];

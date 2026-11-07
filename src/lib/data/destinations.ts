import type { Destination } from "./types";

/**
 * Destinations for the "Travelling somewhere?" search: every transfer partner
 * that reaches the place, with one-way award prices from Delhi / Mumbai.
 *
 * Award prices: lowest one-way awards seen 7 Oct – 6 Nov 2026 on AwardTool,
 * Air India's 1 Apr 2026 chart (Gulf economy 12,000 Value fare, DXB/AUH
 * business 50,000), Aeroplan's distance chart. `confidence: "low"` rows are
 * estimated from nearby routes. Cash fares are rough starting values for the
 * comparison; the user should type the real fare.
 */
const CHECKED = "Nov 2026";
const SRC = "Air India Maharaja Club chart (Apr 2026), AwardTool award searches (Oct–Nov 2026), Live From A Lounge, Magnify, AwardWallet";
const DISRUPTION =
  "Flights to this airport were cut in 2026 after strikes in the region and schedules still change. Confirm the flight is running before moving points.";

// Notes shared by several destinations
const AI_VALUE = "Value fare price; Air India releases few seats at it and charges more (Prime) once they're gone.";
const AIX = "Air India Express flights are bookable with Maharaja Club points since May 2026, economy only. Gulf price not published; estimated at the 12,000 band.";
const AEROPLAN = "About US$52 taxes plus Aeroplan's partner booking fee. Air India releases few seats to partners, so search several dates.";
const QATAR_VIA = "Via Doha. Estimated from India–Doha–Dubai pricing. Avios move 1:1 between Qatar and BA, so you can pool them.";
const ETIHAD_VIA = "Via Abu Dhabi. Price moves with the date; business carries US$250–500 surcharges.";
const BLUCHIP = "BluChip points pay the fare; value per point is set in the partner values list.";

export const DESTINATIONS: Destination[] = [
  {
    id: "kwi", name: "Kuwait", country: "Kuwait", code: "KWI", kw: "kuwait city kwi gulf middle east",
    nonstop: [
      { airline: "Air India Express", merchant: "airindia", from: "Kozhikode, Bengaluru, Kochi; Mumbai from 1 Dec 2026" },
      { airline: "IndiGo", merchant: "indigo", from: "Hyderabad (daily)" },
      { airline: "Kuwait Airways", from: "Mumbai and other cities (not a transfer partner)" },
      { airline: "Jazeera Airways", from: "Hyderabad, Mumbai (not a transfer partner)" },
    ],
    options: [
      { p: "airindia", airline: "Air India Express", route: "South India / Mumbai → Kuwait, nonstop", eco: 12000, pricing: "fixed", confidence: "low", ecoOnly: true, note: AIX },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha → Kuwait", eco: 17500, biz: 33000, pricing: "fixed", confidence: "low", note: "Via Doha. Estimated from India–Doha–Gulf pricing; peak dates cost 15–25% more." },
      { p: "etihad", airline: "Etihad", route: "Delhi / Mumbai → Abu Dhabi → Kuwait", eco: 20000, biz: 40000, pricing: "dynamic", confidence: "low", note: "Etihad resumed Kuwait from 8 Aug 2026. " + ETIHAD_VIA },
      { p: "indigo", airline: "IndiGo", route: "Hyderabad → Kuwait, nonstop", pricing: "revenue", confidence: "medium", note: BLUCHIP },
    ],
    note: DISRUPTION,
    fare: { eco: 16000, biz: 60000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "dxb", name: "Dubai", country: "UAE", code: "DXB", kw: "dubai dxb uae emirates gulf middle east",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai, Hyderabad, Bengaluru, Chennai, Kochi" },
      { airline: "IndiGo", merchant: "indigo", from: "most metros" },
      { airline: "Air India Express", merchant: "airindia", from: "many South Indian cities" },
      { airline: "SpiceJet", merchant: "spicejet", from: "Delhi, Mumbai" },
      { airline: "Emirates", from: "many cities (not a transfer partner)" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Dubai, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "high", note: AI_VALUE },
      { p: "aeroplan", airline: "Air India", route: "Delhi → Dubai, nonstop", eco: 15000, biz: 22500, pricing: "fixed", confidence: "high", note: AEROPLAN },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha → Dubai", eco: 17500, biz: 33000, pricing: "fixed", confidence: "medium", note: QATAR_VIA },
      { p: "flyingblue", airline: "Etihad / Saudia", route: "Delhi / Mumbai → Dubai, 1 stop", eco: 17500, biz: 30000, pricing: "dynamic", confidence: "medium", note: "About US$110 taxes in economy, US$270 in business." },
      { p: "etihad", airline: "Etihad", route: "Delhi / Mumbai → Abu Dhabi → Dubai", eco: 20000, biz: 50000, pricing: "dynamic", confidence: "medium", note: ETIHAD_VIA },
      { p: "indigo", airline: "IndiGo", route: "Indian metros → Dubai, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
      { p: "spicejet", airline: "SpiceJet", route: "Delhi / Mumbai → Dubai, nonstop", pricing: "revenue", confidence: "high", note: "SpiceClub points pay the fare." },
    ],
    fare: { eco: 13000, biz: 45000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "auh", name: "Abu Dhabi", country: "UAE", code: "AUH", kw: "abu dhabi auh uae gulf middle east",
    nonstop: [
      { airline: "Etihad", from: "Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kochi and more (pay cash on etihad.com)" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai" },
      { airline: "IndiGo", merchant: "indigo", from: "several cities" },
      { airline: "Air India Express", merchant: "airindia", from: "several cities" },
    ],
    options: [
      { p: "etihad", airline: "Etihad", route: "Delhi / Mumbai → Abu Dhabi, nonstop", eco: 13000, biz: 33000, pricing: "fixed", confidence: "high", note: "Steady price most months. Economy taxes about US$35; business about US$380." },
      { p: "flyingblue", airline: "Etihad", route: "Delhi → Abu Dhabi, nonstop", eco: 11500, biz: 20000, pricing: "dynamic", confidence: "medium", note: "Cheapest when it shows, but only on some dates. Taxes about US$70 / US$180." },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Abu Dhabi, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "high", note: AI_VALUE },
      { p: "aeroplan", airline: "Air India", route: "Delhi / Mumbai → Abu Dhabi, nonstop", eco: 15000, biz: 22500, pricing: "fixed", confidence: "medium", note: AEROPLAN },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha → Abu Dhabi", eco: 17500, biz: 33000, pricing: "fixed", confidence: "low", note: "Via Doha. Estimated." },
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi → Istanbul → Abu Dhabi", eco: 38000, biz: 63000, pricing: "fixed", confidence: "medium", note: "A long detour; poor value." },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Abu Dhabi, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 13000, biz: 45000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "doh", name: "Doha", country: "Qatar", code: "DOH", kw: "doha doh qatar gulf middle east",
    nonstop: [
      { airline: "Qatar Airways", merchant: "qatar", from: "Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kochi, Ahmedabad, Goa and more" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai" },
      { airline: "IndiGo", merchant: "indigo", from: "several cities" },
      { airline: "Air India Express", merchant: "airindia", from: "several cities" },
    ],
    options: [
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha, nonstop", eco: 13000, biz: 26000, pricing: "fixed", confidence: "high", note: "Off-peak price; peak is 15,000 / 32,500. From Bengaluru 17,500 / 35,000. Business seats open on most dates." },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Doha, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "high", note: AI_VALUE + " Business estimated." },
      { p: "aeroplan", airline: "Air India", route: "Delhi / Mumbai → Doha, nonstop", eco: 15000, biz: 22500, pricing: "fixed", confidence: "high", note: AEROPLAN },
      { p: "flyingblue", airline: "Etihad / Saudia", route: "Delhi / Mumbai → Doha, 1 stop", eco: 14500, biz: 25000, pricing: "dynamic", confidence: "medium", note: "Taxes about US$130 / US$290." },
      { p: "etihad", airline: "Etihad", route: "Delhi / Mumbai → Abu Dhabi → Doha", eco: 20000, biz: 40000, pricing: "dynamic", confidence: "medium", note: ETIHAD_VIA },
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi / Mumbai → Istanbul → Doha", eco: 38000, biz: 63000, pricing: "fixed", confidence: "medium", note: "A long detour; poor value." },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Doha, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 14000, biz: 45000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "mct", name: "Muscat", country: "Oman", code: "MCT", kw: "muscat mct oman gulf middle east",
    nonstop: [
      { airline: "Air India Express", merchant: "airindia", from: "many cities" },
      { airline: "IndiGo", merchant: "indigo", from: "several cities" },
      { airline: "Oman Air / SalamAir", from: "several cities (not transfer partners)" },
    ],
    options: [
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha → Muscat", eco: 17500, biz: 26000, pricing: "fixed", confidence: "medium", note: "Privilege Deals sometimes cut economy to 13,125." },
      { p: "aeroplan", airline: "Star Alliance partner", route: "Delhi → Muscat", eco: 15000, biz: 22500, pricing: "fixed", confidence: "medium", note: "About US$70 taxes plus Aeroplan's partner booking fee." },
      { p: "airindia", airline: "Air India Express", route: "Indian cities → Muscat, nonstop", eco: 12000, pricing: "fixed", confidence: "low", ecoOnly: true, note: AIX },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi → Muscat, 1 stop", eco: 12500, biz: 30000, pricing: "dynamic", confidence: "low", note: "Seen on few dates." },
      { p: "etihad", airline: "Etihad", route: "Delhi → Abu Dhabi → Muscat", eco: 23000, biz: 34000, pricing: "dynamic", confidence: "medium", note: ETIHAD_VIA },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Muscat, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 12000, biz: 40000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "bah", name: "Bahrain", country: "Bahrain", code: "BAH", kw: "bahrain manama bah gulf middle east",
    nonstop: [
      { airline: "Air India Express", merchant: "airindia", from: "South Indian cities" },
      { airline: "Gulf Air", from: "historically Delhi, Mumbai, Kochi, Hyderabad, Bengaluru, Chennai (not a transfer partner)" },
    ],
    options: [
      { p: "airindia", airline: "Air India Express", route: "South India → Bahrain, nonstop", eco: 12000, pricing: "fixed", confidence: "low", ecoOnly: true, note: AIX },
      { p: "qatar", airline: "Qatar Airways", route: "Delhi / Mumbai → Doha → Bahrain", eco: 17500, biz: 33000, pricing: "fixed", confidence: "low", note: "Via Doha. Estimated." },
      { p: "etihad", airline: "Etihad", route: "Delhi / Mumbai → Abu Dhabi → Bahrain", eco: 20000, biz: 40000, pricing: "dynamic", confidence: "low", note: "Etihad flies Abu Dhabi–Bahrain 4× a week since Aug 2026. " + ETIHAD_VIA },
    ],
    note: DISRUPTION,
    fare: { eco: 16000, biz: 55000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "ruh", name: "Riyadh", country: "Saudi Arabia", code: "RUH", kw: "riyadh ruh saudi arabia ksa gulf middle east",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai" },
      { airline: "Air India Express", merchant: "airindia", from: "Delhi, Lucknow and more" },
      { airline: "IndiGo", merchant: "indigo", from: "several cities" },
      { airline: "Saudia / flynas", from: "several cities (not transfer partners)" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Riyadh, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "high", note: AI_VALUE + " From Hyderabad economy is 21,000. Business estimated." },
      { p: "flyingblue", airline: "Saudia / Etihad", route: "Mumbai → Riyadh, 1 stop", eco: 19000, biz: 34500, pricing: "dynamic", confidence: "medium", note: "Taxes about US$100 / US$290." },
      { p: "etihad", airline: "Etihad / Saudia", route: "Mumbai → Abu Dhabi → Riyadh", eco: 23000, biz: 33000, pricing: "dynamic", confidence: "medium", note: ETIHAD_VIA },
      { p: "turkish", airline: "Turkish Airlines", route: "Mumbai → Istanbul → Riyadh", eco: 38000, biz: 63000, pricing: "fixed", confidence: "medium", note: "A long detour; poor value." },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Riyadh, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 16000, biz: 55000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "jed", name: "Jeddah", country: "Saudi Arabia", code: "JED", kw: "jeddah jed saudi arabia ksa umrah hajj makkah mecca gulf middle east",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai, Hyderabad" },
      { airline: "Air India Express", merchant: "airindia", from: "several cities" },
      { airline: "IndiGo", merchant: "indigo", from: "several cities" },
      { airline: "Saudia / flynas / flyadeal", from: "several cities (not transfer partners)" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Jeddah, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "high", note: AI_VALUE + " Business estimated." },
      { p: "aeroplan", airline: "Air India", route: "Delhi / Mumbai → Jeddah, nonstop", eco: 30000, biz: 40000, pricing: "fixed", confidence: "high", note: AEROPLAN },
      { p: "flyingblue", airline: "Saudia / Etihad", route: "Delhi / Mumbai → Jeddah, 1 stop", eco: 21000, biz: 38000, pricing: "dynamic", confidence: "medium", note: "Taxes about US$130 / US$290." },
      { p: "etihad", airline: "Etihad / Saudia", route: "Delhi / Mumbai → Abu Dhabi → Jeddah", eco: 23000, biz: 40000, pricing: "dynamic", confidence: "medium", note: ETIHAD_VIA },
      { p: "turkish", airline: "Turkish Airlines", route: "Delhi / Mumbai → Istanbul → Jeddah", eco: 38000, biz: 63000, pricing: "fixed", confidence: "medium", note: "A long detour; poor value." },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Jeddah, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 18000, biz: 60000 }, checked: CHECKED, src: SRC,
  },
];

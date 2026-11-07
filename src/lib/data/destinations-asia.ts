import type { Destination } from "./types";

/**
 * South, Southeast and East Asia. Award prices: lowest one-way awards seen on
 * AwardTool (7 Oct – 6 Nov 2026), Air India's April 2026 chart (economy:
 * South Asia 10,000; SE Asia 12,000; East Asia 30,000 — business mostly not
 * published, estimated), KrisFlyer Saver chart (Nov 2025; beyond-Singapore
 * prices indicative), Asia Miles chart (May 2026). Cash fares are rough
 * estimates: type the real fare.
 */
const CHECKED = "Nov 2026";
const SRC = "AwardTool award searches (Oct–Nov 2026), Air India Maharaja Club chart (Apr 2026), KrisFlyer Saver chart, Asia Miles chart (May 2026), Magnify, AwardWallet, Card Express";

const AI_SEA = "Value fare price (12,000 SE Asia band). Business not published per route; estimated about 50,000.";
const AI_SOUTH = "Value fare price (10,000 South Asia band). Business not published; estimated.";
const AEROPLAN_ASIA = "Fixed chart; about US$50 taxes plus Aeroplan's partner booking fee. Air India releases few seats to partners.";
const UNITED = "Dynamic; lowest seen. Low taxes, about US$22.";
const MILESMORE = "Via Bangkok on Thai. Miles & More passes on carrier surcharges (taxes about US$125–330). Axis Group B.";
const LIFEMILES = "Fixed chart, low taxes (about US$25).";
const FB = "Dynamic. Taxes about US$90–200.";
const BLUCHIP = "BluChip points pay the fare.";

export const ASIA: Destination[] = [
  {
    id: "sin", name: "Singapore", country: "Singapore", code: "SIN", kw: "singapore sin changi southeast asia",
    nonstop: [
      { airline: "Singapore Airlines", merchant: "sq", from: "Delhi, Mumbai, Bengaluru, Chennai, Kolkata and more" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai, Chennai" },
      { airline: "IndiGo", merchant: "indigo", from: "many cities" },
    ],
    options: [
      { p: "krisflyer", airline: "Singapore Airlines", route: "Delhi / Mumbai → Singapore, nonstop", eco: 19000, biz: 45000, pricing: "fixed", confidence: "high", note: "Saver award; ticket when you book. Taxes about ₹3–6k." },
      { p: "airindia", airline: "Air India", route: "Delhi → Singapore, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "medium", note: AI_SEA },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi → Singapore, 1 stop", eco: 18000, biz: 44000, pricing: "dynamic", confidence: "medium", note: FB },
      { p: "milesmore", airline: "Thai Airways", route: "Delhi / Mumbai → Bangkok → Singapore", eco: 21000, biz: 37500, pricing: "fixed", confidence: "medium", note: MILESMORE },
      { p: "aeroplan", airline: "Air India / Singapore Airlines", route: "Delhi → Singapore, nonstop", eco: 25000, biz: 47500, pricing: "fixed", confidence: "medium", note: "Chart price; only 40,000 / 75,000 was seen recently, so saver seats are scarce. " + AEROPLAN_ASIA },
      { p: "united", airline: "Air India / Singapore Airlines", route: "Mumbai → Singapore, nonstop", eco: 22500, biz: 65000, pricing: "dynamic", confidence: "medium", note: UNITED },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Singapore, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 16000, biz: 70000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "bkk", name: "Bangkok", country: "Thailand", code: "BKK", kw: "bangkok bkk thailand southeast asia pattaya",
    nonstop: [
      { airline: "Thai Airways", from: "Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai" },
      { airline: "IndiGo", merchant: "indigo", from: "many cities" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Bangkok, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "medium", note: AI_SEA },
      { p: "thai", airline: "Thai Airways", route: "Delhi / Mumbai → Bangkok, nonstop", eco: 17500, biz: 27500, pricing: "fixed", confidence: "low", note: "Thai's own chart; carrier surcharges apply. Estimated." },
      { p: "milesmore", airline: "Thai Airways", route: "Delhi / Mumbai → Bangkok, nonstop", eco: 21000, biz: 37500, pricing: "fixed", confidence: "medium", note: "Taxes about US$125–180. Axis Group B." },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi → Bangkok, 1 stop", eco: 19500, biz: 38500, pricing: "dynamic", confidence: "medium", note: FB },
      { p: "krisflyer", airline: "Singapore Airlines", route: "Delhi → Singapore → Bangkok", eco: 20000, biz: 47500, pricing: "fixed", confidence: "low", note: "Saver award, indicative price." },
      { p: "aeroplan", airline: "Thai Airways / Air India", route: "Delhi / Mumbai → Bangkok, nonstop", eco: 25000, biz: 47500, pricing: "fixed", confidence: "high", note: AEROPLAN_ASIA },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Bangkok, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 13000, biz: 52000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "hkt", name: "Phuket", country: "Thailand", code: "HKT", kw: "phuket hkt thailand krabi beach southeast asia",
    nonstop: [
      { airline: "IndiGo", merchant: "indigo", from: "Delhi, Mumbai, Bengaluru" },
      { airline: "Air India", merchant: "airindia", from: "Delhi" },
      { airline: "Air India Express", merchant: "airindia", from: "Bengaluru, Hyderabad" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi → Phuket, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "medium", note: AI_SEA },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi → Phuket, 1 stop", eco: 20500, biz: 43000, pricing: "dynamic", confidence: "medium", note: FB },
      { p: "milesmore", airline: "Thai Airways", route: "Delhi / Mumbai → Bangkok → Phuket", eco: 21000, biz: 37500, pricing: "fixed", confidence: "medium", note: MILESMORE },
      { p: "aeroplan", airline: "Air India / Thai", route: "Delhi / Mumbai → Phuket", eco: 25000, biz: 47500, pricing: "fixed", confidence: "medium", note: AEROPLAN_ASIA },
      { p: "lifemiles", airline: "Thai Airways", route: "Mumbai → Bangkok → Phuket", eco: 25500, biz: 40800, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "indigo", airline: "IndiGo", route: "Delhi / Mumbai / Bengaluru → Phuket, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 16000, biz: 65000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "dps", name: "Bali", country: "Indonesia", code: "DPS", kw: "bali denpasar dps indonesia ubud southeast asia honeymoon",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi (about 5 a week)" },
      { airline: "IndiGo", merchant: "indigo", from: "Mumbai, Bhubaneswar" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi → Bali, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "medium", note: AI_SEA },
      { p: "krisflyer", airline: "Singapore Airlines", route: "Delhi / Mumbai → Singapore → Bali", eco: 20000, biz: 47500, pricing: "fixed", confidence: "low", note: "Saver award, indicative price." },
      { p: "milesmore", airline: "Thai Airways", route: "Delhi / Mumbai → Bangkok → Bali", eco: 21000, biz: 37500, pricing: "fixed", confidence: "medium", note: "Taxes about US$220–330. Axis Group B." },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi / Mumbai → Bali, 1 stop", eco: 27500, biz: 62500, pricing: "dynamic", confidence: "medium", note: FB },
      { p: "lifemiles", airline: "Singapore / Thai", route: "Delhi / Mumbai → Bali, 1 stop", eco: 30000, biz: 48000, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "aeroplan", airline: "Air India", route: "Delhi → Bali, nonstop", eco: 40000, biz: 75000, pricing: "fixed", confidence: "medium", note: AEROPLAN_ASIA },
      { p: "indigo", airline: "IndiGo", route: "Mumbai → Bali, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 24000, biz: 95000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "kul", name: "Kuala Lumpur", country: "Malaysia", code: "KUL", kw: "kuala lumpur kul malaysia langkawi southeast asia",
    nonstop: [
      { airline: "Malaysia Airlines", from: "Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Ahmedabad, Kochi (book with Avios or Asia Miles)" },
      { airline: "Air India", merchant: "airindia", from: "Delhi" },
      { airline: "IndiGo", merchant: "indigo", from: "Bengaluru, Chennai and more" },
      { airline: "AirAsia", from: "several cities" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi → Kuala Lumpur, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "high", note: AI_SEA },
      { p: "qatar", airline: "Malaysia Airlines", route: "Delhi → Kuala Lumpur, nonstop", eco: 13000, biz: 38750, pricing: "fixed", confidence: "medium", note: "Book Malaysia Airlines with Qatar or BA Avios (oneworld). Low taxes." },
      { p: "flyingblue", airline: "Partner airlines", route: "Delhi → Kuala Lumpur, 1 stop", eco: 16000, biz: 39500, pricing: "dynamic", confidence: "medium", note: FB },
      { p: "cathay", airline: "Malaysia Airlines", route: "Delhi / Mumbai → Kuala Lumpur, nonstop", eco: 17500, biz: 37000, pricing: "fixed", confidence: "medium", note: "Asia Miles partner chart; surcharges extra." },
      { p: "aeroplan", airline: "Air India", route: "Delhi → Kuala Lumpur, nonstop", eco: 25000, biz: 47500, pricing: "fixed", confidence: "high", note: AEROPLAN_ASIA },
      { p: "airasia", airline: "AirAsia", route: "Indian cities → Kuala Lumpur, nonstop", pricing: "revenue", confidence: "low", note: "AirAsia points pay the fare; low-cost, bags extra." },
      { p: "indigo", airline: "IndiGo", route: "Bengaluru / Chennai → Kuala Lumpur, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 14000, biz: 60000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "hkg", name: "Hong Kong", country: "Hong Kong", code: "HKG", kw: "hong kong hkg china macau east asia",
    nonstop: [
      { airline: "Cathay Pacific", from: "Delhi, Mumbai, Bengaluru, Chennai, Hyderabad" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai" },
      { airline: "IndiGo", merchant: "indigo", from: "Delhi, Mumbai" },
    ],
    options: [
      { p: "cathay", airline: "Cathay Pacific", route: "Delhi / Mumbai → Hong Kong, nonstop", eco: 13000, biz: 33000, pricing: "fixed", confidence: "medium", note: "Asia Miles chart from May 2026; fuel surcharge about US$93. Axis converts 2:1 since Sep 2026." },
      { p: "qatar", airline: "Cathay Pacific", route: "Delhi / Mumbai → Hong Kong, nonstop", eco: 13000, biz: 38750, pricing: "fixed", confidence: "medium", note: "Book Cathay with Qatar or BA Avios." },
      { p: "aeroplan", airline: "Air India / Cathay", route: "Delhi → Hong Kong, nonstop", eco: 25000, biz: 47500, pricing: "fixed", confidence: "high", note: AEROPLAN_ASIA },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Hong Kong, nonstop", eco: 30000, biz: 90000, pricing: "fixed", confidence: "medium", note: "East Asia band (30,000 economy). Business estimated." },
      { p: "united", airline: "Air India", route: "Delhi → Hong Kong, nonstop", eco: 22500, biz: 65000, pricing: "dynamic", confidence: "medium", note: UNITED },
      { p: "krisflyer", airline: "Singapore Airlines", route: "Delhi → Singapore → Hong Kong", eco: 25000, pricing: "fixed", confidence: "low", note: "Saver award, indicative price." },
      { p: "indigo", airline: "IndiGo", route: "Delhi / Mumbai → Hong Kong, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 24000, biz: 100000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "tyo", name: "Tokyo", country: "Japan", code: "HND", kw: "tokyo hnd nrt haneda narita japan osaka east asia",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi and Mumbai to Haneda" },
      { airline: "Japan Airlines", merchant: "jal", from: "Delhi and Bengaluru to Narita" },
      { airline: "ANA", from: "Mumbai to Narita" },
    ],
    options: [
      { p: "jal", airline: "Japan Airlines", route: "Delhi / Bengaluru → Tokyo Narita, nonstop", eco: 17500, biz: 40000, pricing: "fixed", confidence: "medium", note: "Base award seat on JAL's own flights; Atlas converts 1:2. See the JAL guide." },
      { p: "milesmore", airline: "ANA / EVA / Thai", route: "Delhi → Tokyo, some nonstop", eco: 21000, biz: 37500, pricing: "fixed", confidence: "medium", note: "Carrier surcharges about US$140–275. Axis Group B." },
      { p: "lifemiles", airline: "ANA / Thai", route: "Delhi → Tokyo Haneda", eco: 25500, biz: 40800, pricing: "fixed", confidence: "medium", note: LIFEMILES },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai → Tokyo Haneda, nonstop", eco: 30000, biz: 100000, pricing: "fixed", confidence: "medium", note: "East Asia band (30,000 economy). Business reported at 90,000–110,000." },
      { p: "aeroplan", airline: "Air India / ANA", route: "Delhi / Mumbai → Tokyo, nonstop", eco: 40000, biz: 75000, pricing: "fixed", confidence: "high", note: AEROPLAN_ASIA },
      { p: "qantas", airline: "Japan Airlines", route: "Delhi → Tokyo Narita, nonstop", eco: 34700, biz: 87000, pricing: "fixed", confidence: "medium", note: "Taxes about US$250–280." },
      { p: "united", airline: "Air India / ANA", route: "Delhi / Mumbai → Tokyo, nonstop", eco: 35000, biz: 90000, pricing: "dynamic", confidence: "medium", note: UNITED },
    ],
    fare: { eco: 40000, biz: 170000 }, checked: CHECKED, src: SRC + ", JAL guide in this app",
  },
  {
    id: "han", name: "Hanoi", country: "Vietnam", code: "HAN", kw: "hanoi han vietnam ha long ho chi minh southeast asia",
    nonstop: [
      { airline: "Vietnam Airlines", from: "Delhi, Mumbai (Flying Blue / Virgin partner)" },
      { airline: "Air India", merchant: "airindia", from: "Delhi (5 a week)" },
      { airline: "VietJet", from: "Delhi, Mumbai (not a partner)" },
    ],
    options: [
      { p: "flyingblue", airline: "Vietnam Airlines", route: "Delhi / Mumbai → Hanoi, nonstop", eco: 11500, biz: 23500, pricing: "dynamic", confidence: "medium", note: "Lowest seen (Mumbai 13,500 / 26,500). Taxes about US$100–145." },
      { p: "virgin", airline: "Vietnam Airlines", route: "Delhi / Mumbai → Hanoi, nonstop", eco: 11500, biz: 35000, pricing: "fixed", confidence: "medium", note: "Taxes about US$95–105." },
      { p: "airindia", airline: "Air India", route: "Delhi → Hanoi, nonstop", eco: 12000, biz: 50000, pricing: "fixed", confidence: "low", note: "Assumed in the 12,000 SE Asia band; not checked for this route." },
      { p: "cathay", airline: "Cathay Pacific", route: "Delhi → Hong Kong → Hanoi", eco: 13000, biz: 33000, pricing: "fixed", confidence: "medium", note: "Taxes about US$170–200." },
      { p: "vietnam", airline: "Vietnam Airlines", route: "Delhi / Mumbai → Hanoi, nonstop", eco: 15000, biz: 30000, pricing: "fixed", confidence: "low", note: "LotusMiles; estimated. HDFC Infinia transfers 1:1." },
      { p: "aeroplan", airline: "Air India", route: "Delhi → Hanoi, nonstop", eco: 25000, biz: 47500, pricing: "fixed", confidence: "high", note: AEROPLAN_ASIA },
    ],
    fare: { eco: 15000, biz: 57000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "mle", name: "Maldives", country: "Maldives", code: "MLE", kw: "maldives male mle island resort honeymoon south asia",
    nonstop: [
      { airline: "IndiGo", merchant: "indigo", from: "Mumbai, Delhi, Bengaluru, Hyderabad, Kochi, Thiruvananthapuram" },
      { airline: "Air India", merchant: "airindia", from: "Delhi" },
    ],
    options: [
      { p: "airindia", airline: "Air India", route: "Delhi → Malé, nonstop", eco: 10000, biz: 27500, pricing: "fixed", confidence: "medium", note: AI_SOUTH },
      { p: "qatar", airline: "SriLankan Airlines", route: "Delhi → Colombo → Malé", eco: 11000, biz: 22000, pricing: "fixed", confidence: "medium", note: "Book SriLankan (oneworld) with Qatar or BA Avios." },
      { p: "aeroplan", airline: "Air India", route: "Delhi → Malé, nonstop", eco: 15000, biz: 22500, pricing: "fixed", confidence: "high", note: AEROPLAN_ASIA },
      { p: "united", airline: "Air India", route: "Delhi → Malé", eco: 17500, biz: 45000, pricing: "dynamic", confidence: "medium", note: UNITED },
      { p: "qantas", airline: "SriLankan Airlines", route: "Delhi / Mumbai → Colombo → Malé", eco: 23000, biz: 46000, pricing: "fixed", confidence: "medium", note: "Taxes about US$75–80." },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Malé, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    note: "For the resort itself, see the Hilton and Marriott guides: Conrad and Waldorf Astoria Maldives are bookable with Hilton points.",
    fare: { eco: 15000, biz: 48000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "cmb", name: "Colombo", country: "Sri Lanka", code: "CMB", kw: "colombo cmb sri lanka srilanka south asia",
    nonstop: [
      { airline: "SriLankan Airlines", from: "Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, Kochi and more (book with Avios)" },
      { airline: "Air India", merchant: "airindia", from: "Delhi, Mumbai, Chennai" },
      { airline: "IndiGo", merchant: "indigo", from: "Mumbai, Chennai, Bengaluru, Hyderabad and more" },
    ],
    options: [
      { p: "aeroplan", airline: "Air India", route: "Mumbai → Colombo, nonstop", eco: 7500, biz: 12500, pricing: "fixed", confidence: "high", note: "Short-haul band; Delhi may cost one band more. " + AEROPLAN_ASIA },
      { p: "qatar", airline: "SriLankan Airlines", route: "Mumbai → Colombo, nonstop", eco: 9000, biz: 16500, pricing: "fixed", confidence: "medium", note: "Book SriLankan (oneworld) with Qatar or BA Avios." },
      { p: "airindia", airline: "Air India", route: "Delhi / Mumbai / Chennai → Colombo, nonstop", eco: 10000, biz: 25000, pricing: "fixed", confidence: "medium", note: AI_SOUTH },
      { p: "qantas", airline: "SriLankan Airlines", route: "Mumbai → Colombo, nonstop", eco: 16100, biz: 31500, pricing: "fixed", confidence: "medium", note: "Taxes about US$75." },
      { p: "united", airline: "Air India", route: "Mumbai → Colombo, nonstop", eco: 17500, biz: 45000, pricing: "dynamic", confidence: "medium", note: UNITED },
      { p: "indigo", airline: "IndiGo", route: "Indian cities → Colombo, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 12000, biz: 40000 }, checked: CHECKED, src: SRC,
  },
  {
    id: "ktm", name: "Kathmandu", country: "Nepal", code: "KTM", kw: "kathmandu ktm nepal pokhara himalaya south asia",
    nonstop: [
      { airline: "Air India", merchant: "airindia", from: "Delhi" },
      { airline: "IndiGo", merchant: "indigo", from: "Delhi, Mumbai, Kolkata" },
      { airline: "Nepal Airlines", from: "Delhi (not a partner)" },
    ],
    options: [
      { p: "aeroplan", airline: "Air India", route: "Delhi → Kathmandu, nonstop", eco: 7500, biz: 12500, pricing: "fixed", confidence: "high", note: "Narrow-body business seat. " + AEROPLAN_ASIA },
      { p: "airindia", airline: "Air India", route: "Delhi → Kathmandu, nonstop", eco: 10000, biz: 25000, pricing: "fixed", confidence: "medium", note: AI_SOUTH },
      { p: "united", airline: "Air India", route: "Delhi → Kathmandu, nonstop", eco: 12500, biz: 30000, pricing: "dynamic", confidence: "medium", note: UNITED },
      { p: "indigo", airline: "IndiGo", route: "Delhi / Mumbai / Kolkata → Kathmandu, nonstop", pricing: "revenue", confidence: "high", note: BLUCHIP },
    ],
    fare: { eco: 10000, biz: 32000 }, checked: CHECKED, src: SRC,
  },
];

import type { Partner } from "./types";

/**
 * Transfer partners. `v` is the default ₹ value of one partner point:
 * a typical good-redemption value, which the user can override.
 */
export const PARTNERS = {
  krisflyer:{n:"Singapore KrisFlyer",k:"air",v:1.3}, aeroplan:{n:"Air Canada Aeroplan",k:"air",v:1.2},
  flyingblue:{n:"Air France-KLM Flying Blue",k:"air",v:1.0}, airindia:{n:"Air India Maharaja Club",k:"air",v:0.9},
  united:{n:"United MileagePlus",k:"air",v:1.0}, turkish:{n:"Turkish Miles&Smiles",k:"air",v:1.3},
  thai:{n:"Thai Royal Orchid Plus",k:"air",v:1.0}, jal:{n:"JAL Mileage Bank",k:"air",v:1.3},
  etihad:{n:"Etihad Guest",k:"air",v:0.9}, ethiopian:{n:"Ethiopian ShebaMiles",k:"air",v:1.0},
  qantas:{n:"Qantas Frequent Flyer",k:"air",v:0.9}, cathay:{n:"Cathay Asia Miles",k:"air",v:1.1},
  ba:{n:"British Airways Avios",k:"air",v:1.1}, qatar:{n:"Qatar Privilege Club Avios",k:"air",v:1.1},
  finnair:{n:"Finnair Plus Avios",k:"air",v:1.1}, vietnam:{n:"Vietnam LotusMiles",k:"air",v:0.8},
  virgin:{n:"Virgin Atlantic Flying Club",k:"air",v:1.1}, lifemiles:{n:"Avianca LifeMiles",k:"air",v:1.1},
  milesmore:{n:"Lufthansa Miles & More",k:"air",v:0.9}, airasia:{n:"AirAsia Rewards",k:"air",v:0.6},
  spicejet:{n:"SpiceJet SpiceClub",k:"air",v:1.0}, indigo:{n:"IndiGo BluChip",k:"air",v:1.0},
  accor:{n:"Accor ALL",k:"hotel",v:2.2}, hilton:{n:"Hilton Honors",k:"hotel",v:0.35},
  ihg:{n:"IHG One Rewards",k:"hotel",v:0.45}, marriott:{n:"Marriott Bonvoy",k:"hotel",v:0.7},
  wyndham:{n:"Wyndham Rewards",k:"hotel",v:0.6}, radisson:{n:"Radisson Rewards",k:"hotel",v:0.3},
  itc:{n:"Club ITC",k:"hotel",v:1.0}, orchid:{n:"Orchid Rewards",k:"hotel",v:0.5},
  postcard:{n:"The Postcard Sunshine Club",k:"hotel",v:0.8}
} as const satisfies Record<string, Partner>;

export type PartnerId = keyof typeof PARTNERS;

export const PARTNER_IDS = Object.keys(PARTNERS) as PartnerId[];

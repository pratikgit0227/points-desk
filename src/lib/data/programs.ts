import type { PartnerId } from "./partners";
import type { CardInfo, Program, Rate } from "./types";
import { APPLY, type ApplyLink } from "./links";

// Axis groups (Sept 2026)
const AX_A: PartnerId[] = ["aeroplan", "flyingblue", "airindia", "ba", "cathay", "etihad", "ethiopian", "finnair", "jal", "qantas", "qatar", "krisflyer", "thai", "turkish", "united", "vietnam", "wyndham", "accor"];
const AX_B: PartnerId[] = ["airasia", "hilton", "ihg", "indigo", "milesmore", "orchid", "radisson", "spicejet", "postcard"];
/** Moved to the lower rate on 23 Sep 2026 */
const AX_LOW: PartnerId[] = ["ba", "cathay", "finnair", "qatar", "vietnam", "accor"];

function axisTable(aRate: number, lowRate: number, bRate: number, overrides: Partial<Record<PartnerId, Rate>> = {}) {
  const t: Record<string, Rate> = {};
  AX_A.forEach((p) => (t[p] = [AX_LOW.includes(p) ? lowRate : aRate, "A"]));
  AX_B.forEach((p) => (t[p] = [bRate, "B"]));
  return Object.assign(t, overrides);
}

/** Miles & More has its own 2,00,000 a year cap on Axis cards. */
export const MILES_MORE_CAP = 200000;

export const PROGRAMS: Program[] = [
  {key:"axis_atlas", bank:"Axis Bank", card:"Atlas", unit:"EDGE Miles", ex:48250,
   base:{v:1.0, label:"Travel EDGE booking"}, caps:{A:30000,B:120000},
   r: axisTable(2, 0.5, 2, {indigo:[0.5,"B"], milesmore:[1,"B"], orchid:[1,"B"], radisson:[1,"B"]})},
  {key:"axis_magnus_burgundy", bank:"Axis Bank", card:"Magnus for Burgundy", unit:"EDGE Reward points", ex:0,
   base:{v:0.2, label:"Travel EDGE booking"}, caps:{A:200000,B:800000},
   r: axisTable(0.8, 0.4, 0.8)},
  {key:"axis_magnus", bank:"Axis Bank", card:"Magnus", unit:"EDGE Reward points", ex:0,
   base:{v:0.2, label:"Travel EDGE booking"}, caps:{A:100000,B:400000},
   r: axisTable(0.4, 0.2, 0.4)},
  {key:"hdfc_infinia", bank:"HDFC Bank", card:"Infinia / Diners Club Black", unit:"Reward Points", ex:112400,
   base:{v:1.0, label:"SmartBuy flights & hotels"},
   r:{aeroplan:[.5],airasia:[1],airindia:[.5],lifemiles:[.5],ba:[.5],cathay:[.5],etihad:[.5],finnair:[1],flyingblue:[1],qatar:[.5],vietnam:[1],thai:[.5],turkish:[.5],united:[.5],spicejet:[1],krisflyer:[1],accor:[.5],itc:[.5],marriott:[.5],ihg:[1],radisson:[1],wyndham:[1]}},
  {key:"hdfc_regalia_gold", bank:"HDFC Bank", card:"Regalia Gold", unit:"Reward Points", ex:0,
   base:{v:0.5, label:"SmartBuy flights & hotels"},
   r:{aeroplan:[.33],airasia:[.5],airindia:[.33],lifemiles:[.5],ba:[.33],cathay:[.33],etihad:[.33],finnair:[.5],flyingblue:[.5],qatar:[.33],vietnam:[.5],thai:[.33],turkish:[.5],united:[.33],spicejet:[.5],krisflyer:[.5],accor:[.5],itc:[.5],marriott:[.33],ihg:[.5],radisson:[.5],wyndham:[.5]}},
  {key:"amex_mr", bank:"American Express", card:"Membership Rewards", unit:"MR points", ex:36000,
   base:{v:0.5, label:"18K/24K Gold Collection vouchers"},
   r:{hilton:[1.5],marriott:[1],virgin:[.8],cathay:[.5],ba:[.5],qatar:[.5],krisflyer:[.5]}},
  {key:"hsbc_travelone", bank:"HSBC", card:"TravelOne", unit:"Reward Points", ex:0,
   base:{v:0.25, label:"Vouchers / statement credit (est.)"},
   r:{airindia:[1],flyingblue:[1],airasia:[3],ba:[1],etihad:[1],jal:[1],qatar:[1],qantas:[1],krisflyer:[1],thai:[1],turkish:[.5],united:[.5],vietnam:[1],accor:[1],ihg:[1],marriott:[1],wyndham:[1]}},
  {key:"axis_horizon", bank:"Axis Bank", card:"Horizon", unit:"EDGE Miles", ex:0,
   base:{v:1.0, label:"Travel EDGE booking (est.)"}, caps:{A:100000,B:400000},
   r: axisTable(1, 0.5, 1, {indigo:[0.5,"B"], milesmore:[0.5,"B"], orchid:[0.5,"B"], radisson:[0.5,"B"]})},
  {key:"scapia", bank:"Federal Bank", card:"Scapia", unit:"Scapia coins", ex:0,
   base:{v:0.2, label:"Travel bookings in the Scapia app"}, r:{}}
];

export const PROGRAM_KEYS = PROGRAMS.map((p) => p.key);

export function findProgram(key: string): Program | undefined {
  return PROGRAMS.find((p) => p.key === key);
}

/**
 * Card facts for the "pick a card" calculator. earn = points per ₹100 (travel / everything else).
 * fee incl. 18% GST; waive = yearly spend that waives the fee; bonus = milestone points.
 */
export const CARD_INFO: Record<string, CardInfo> = {
  axis_atlas:{status:"Closed to new applicants (2026)", fee:5900, earn:{travel:5, other:2}},
  axis_magnus_burgundy:{status:"Needs an Axis Burgundy relationship", fee:35400},
  axis_magnus:{status:"Open", fee:14750, earn:{travel:6, other:6}, est:true},
  hdfc_infinia:{status:"Mostly by invitation", fee:14750, waive:1000000, earn:{travel:3.33, other:3.33}, est:true},
  hdfc_regalia_gold:{status:"Open", fee:2950, waive:400000, earn:{travel:2.67, other:2.67}, pick:true,
    why:"Lowest fee of the transfer cards, waived at ₹4L a year. Transfers are 2:1 or 3:1, so points are best used on SmartBuy."},
  amex_mr:{status:"Open (Platinum Travel)", fee:5900, earn:{travel:2, other:2}, bonus:[{at:400000, pts:10000}], pick:true,
    label:"Amex Platinum Travel",
    why:"10,000 bonus points at ₹4L and a ₹20,000 Taj voucher at ₹7L (Sept 2026 milestones). Marriott 1:1 and Hilton 1:1.5; airlines are 2:1."},
  hsbc_travelone:{status:"Open", fee:5899, waive:800000, earn:{travel:4, other:2}, pick:true,
    why:"1:1 to KrisFlyer, JAL, Air India, Qatar/BA Avios, Accor, Marriott and IHG, with instant transfers. The widest 1:1 list of any open card."},
  axis_horizon:{status:"Open", fee:3540, earn:{travel:5, other:2}, bonus:[{at:0, pts:1500, label:"renewal EDGE Miles from year 2"}], pick:true,
    why:"The open replacement for Atlas: EDGE Miles 1:1 to KrisFlyer, JAL, Aeroplan, Turkish, Air India and Hilton. 5,000 EDGE Miles welcome bonus in year 1."},
  scapia:{status:"Open, lifetime free", fee:0, earn:{travel:20, other:10}, pick:true,
    why:"No fee and 0% forex markup. No transfers: coins pay for bookings in the Scapia app (5 coins = ₹1), so there's nothing to learn."}
};

/** Card illustration gradient colours (not the banks' artwork). */
export const CARD_ART: Record<string, readonly [string, string]> = {
  axis_atlas:["#1b2a49","#c9a86a"], axis_magnus_burgundy:["#5a0f26","#d6b27a"], axis_magnus:["#3b1020","#c9a86a"],
  hdfc_infinia:["#22262b","#9aa3ad"], hdfc_regalia_gold:["#7a5a1c","#f0cf7a"], amex_mr:["#9ea7b3","#f2f4f7"],
  hsbc_travelone:["#9b1c1c","#2b2b2b"], axis_horizon:["#0d5c63","#7fd1c8"], scapia:["#5b3bb5","#b79bff"]
};

/** New applicants can get this card (not closed, invite-only or relationship-only). */
export function isOpenCard(key: string): boolean {
  return /^open/i.test(CARD_INFO[key]?.status ?? "");
}

/**
 * Cards a ranking may show. With "my cards" set: the user's cards plus open ones
 * they could get. Without it: open cards only, so a closed card never "wins".
 */
export function canShowCard(key: string, mine: readonly string[] | null): boolean {
  return (mine?.includes(key) ?? false) || isOpenCard(key);
}

/** "HDFC Regalia Gold", "Amex Platinum Travel" etc. */
export function cardName(prog: Program): string {
  return CARD_INFO[prog.key]?.label || prog.bank.replace(" Bank", "") + " " + prog.card;
}

/** The apply link for a card new applicants can get; none for closed or invite-only cards. */
export function applyLinkFor(key: string): ApplyLink | undefined {
  return isOpenCard(key) ? APPLY[key] : undefined;
}

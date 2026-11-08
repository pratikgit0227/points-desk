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

/** Axis Select / Privilege: 10:1, AirAsia and SpiceJet 5:1 (Apr 2026 table). Partners moved to the lower
 * rate in Sep 2026 have no published Select ratio yet, so they're left out rather than guessed. */
function axisSelectTable() {
  const t = axisTable(0.1, 0, 0.1, { airasia: [0.2, "B"], spicejet: [0.2, "B"] });
  AX_LOW.forEach((p) => delete t[p]);
  delete t.indigo;
  return t;
}

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
   base:{v:0.2, label:"Travel bookings in the Scapia app"}, r:{}},
  // Added Nov 2026 (sources: CardMaven, LiveFromALounge, Magnify, CardInsider, CardAdvisor, bank pages)
  {key:"axis_olympus", bank:"Axis Bank", card:"Olympus", unit:"EDGE Miles", ex:0,
   base:{v:1.0, label:"Travel EDGE booking (est.)"}, caps:{A:150000,B:600000},
   r: (() => { const t = axisTable(4, 2, 4); delete t.indigo; return t; })()},
  {key:"axis_select", bank:"Axis Bank", card:"Select / Privilege", unit:"EDGE Reward points", ex:0,
   base:{v:0.2, label:"Travel EDGE booking"}, caps:{A:100000,B:400000}, r: axisSelectTable()},
  {key:"icici_air", bank:"ICICI Bank", card:"Emeralde Private Metal / Times Black", unit:"ICICI Reward Points", ex:0,
   base:{v:1.0, label:"Flights & hotels on ICICI rewards (est.)"}, r:{airindia:[1]}},
  {key:"icici_rp", bank:"ICICI Bank", card:"Sapphiro", unit:"ICICI Reward Points", ex:0,
   base:{v:0.25, label:"Vouchers / catalogue (est.)"}, r:{}},
  {key:"yes_marquee", bank:"YES Bank", card:"Marquee", unit:"YES Reward points", ex:0,
   base:{v:0.25, label:"Flights & hotels on YES Rewardz"}, r:{airindia:[0.1]}},
  {key:"sbi_rp", bank:"SBI Card", card:"Aurum / ELITE", unit:"SBI Reward Points", ex:0,
   base:{v:0.25, label:"Statement credit / vouchers"}, r:{}},
  {key:"idfc_rp", bank:"IDFC FIRST Bank", card:"Wealth / Ashva / Mayura", unit:"IDFC Reward points", ex:0,
   base:{v:0.25, label:"Statement credit / vouchers"}, r:{}},
  {key:"tata_neu", bank:"HDFC Bank", card:"Tata Neu Infinity", unit:"NeuCoins", ex:0,
   base:{v:1.0, label:"Spend on Tata Neu brands"}, r:{}},
  {key:"cashback", bank:"Cashback cards", card:"SBI Cashback / Amazon Pay ICICI", unit:"₹ cashback", ex:0,
   base:{v:1.0, label:"Credited as cash"}, r:{}},
  // Co-brand cards that earn partner points directly (1 card point = 1 partner point)
  {key:"marriott_hdfc", bank:"HDFC Bank", card:"Marriott Bonvoy", unit:"Marriott Bonvoy points", ex:0,
   base:{v:0, label:"No cash-out: use at Marriott"}, r:{marriott:[1]}},
  {key:"krisflyer_sbi", bank:"SBI Card", card:"KrisFlyer SBI Apex", unit:"KrisFlyer miles", ex:0,
   base:{v:0, label:"No cash-out: use on KrisFlyer"}, r:{krisflyer:[1]}},
  {key:"avios_indusind", bank:"IndusInd Bank", card:"Avios Visa Infinite", unit:"Avios", ex:0,
   base:{v:0, label:"No cash-out: use as BA or Qatar Avios"}, r:{ba:[1], qatar:[1]}}
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
  amex_mr:{status:"New applications paused (Amex India, Nov 2026)",
    note:"Since 11 Oct 2026 each Amex card keeps its own MR balance: points can no longer be moved between your Amex cards. Enter the balance of the card you will transfer from.", fee:5900, earn:{travel:2, other:2}, bonus:[{at:400000, pts:10000}], pick:true,
    label:"Amex Platinum Travel",
    why:"10,000 bonus points at ₹4L and a ₹20,000 Taj voucher at ₹7L (Sept 2026 milestones). Marriott 1:1 and Hilton 1:1.5; airlines are 2:1."},
  hsbc_travelone:{status:"Open", fee:5899, waive:800000, earn:{travel:4, other:2}, pick:true,
    why:"1:1 to KrisFlyer, JAL, Air India, Qatar/BA Avios, Accor, Marriott and IHG, with instant transfers. The widest 1:1 list of any open card."},
  axis_horizon:{status:"Open", fee:3540, earn:{travel:5, other:2}, bonus:[{at:0, pts:1500, label:"renewal EDGE Miles from year 2"}], pick:true,
    why:"The open replacement for Atlas: EDGE Miles 1:1 to KrisFlyer, JAL, Aeroplan, Turkish, Air India and Hilton. 5,000 EDGE Miles welcome bonus in year 1."},
  scapia:{status:"Open, lifetime free", fee:0, earn:{travel:20, other:10}, pick:true,
    why:"No fee and 0% forex markup. No transfers: coins pay for bookings in the Scapia app (5 coins = ₹1), so there's nothing to learn."},
  axis_olympus:{status:"By invitation", fee:23600, label:"Axis Olympus"},
  axis_select:{status:"Open", fee:3540, label:"Axis Select / Privilege"},
  icici_air:{status:"By invitation", fee:14749, label:"ICICI Emeralde Private Metal"},
  icici_rp:{status:"Open", fee:4130, label:"ICICI Sapphiro"},
  yes_marquee:{status:"Open", fee:5899, label:"YES Marquee"},
  sbi_rp:{status:"Open (ELITE)", fee:5899, label:"SBI Aurum / ELITE"},
  idfc_rp:{status:"Open", fee:0, label:"IDFC FIRST Wealth / Ashva / Mayura"},
  tata_neu:{status:"Open", fee:1769, waive:300000, label:"Tata Neu Infinity HDFC"},
  cashback:{status:"Open", fee:0, label:"Cashback cards"},
  marriott_hdfc:{status:"Open", fee:3540, label:"Marriott Bonvoy HDFC"},
  krisflyer_sbi:{status:"Open", fee:11799, label:"KrisFlyer SBI Apex"},
  avios_indusind:{status:"Open", fee:5900, label:"IndusInd Avios Visa Infinite"}
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

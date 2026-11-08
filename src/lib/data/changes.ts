import type { PartnerId } from "./partners";

export type ChangeKind = "devaluation" | "improvement" | "partner" | "closure";

export interface Change {
  /** Stable id, used as the #anchor on /changes */
  id: string;
  /** Effective date, YYYY-MM-DD */
  date: string;
  /** Only the month is known; show "Apr 2026" */
  approx?: boolean;
  kind: ChangeKind;
  title: string;
  /** What changed */
  what: string;
  /** What a cardholder should do about it */
  todo?: string;
  /** Program keys of cards affected */
  cards: string[];
  partners: PartnerId[];
  /** Ready-to-post text for X (the link is added on copy) */
  post: string;
  sources: { label: string; href: string }[];
}

/** Date this list was last checked against the sources. */
export const CHANGES_CHECKED = "2026-11-08";

const AXIS_EDGE = ["axis_atlas", "axis_horizon", "axis_magnus", "axis_magnus_burgundy"];

/**
 * Dated changes to cards, transfer partners and award charts, newest first.
 * Each one is from published reporting; where sources disagree we say so.
 */
const LIST: Change[] = [
  {
    id: "axis-reshuffle-sep-2026",
    date: "2026-09-23",
    kind: "devaluation",
    title: "Axis Travel EDGE reshuffle: groups and ratios change",
    what:
      "British Airways, Cathay, Finnair, Qatar, Vietnam Airlines and Accor are in the lower-rate band (Atlas: 2 EDGE Miles for 1 partner point, against 1:2 for the main Group A partners). Flying Blue, Air India and Qantas moved from Group B to Group A, so they now share the smaller Group A yearly cap. Accor came back, at the lower rate. Reports date it 22 or 23 September.",
    todo: "For Avios, compare Axis with HSBC TravelOne (1:1). If you use Air India or Flying Blue, plan around the Group A cap (30,000 a year on Atlas).",
    cards: AXIS_EDGE,
    partners: ["ba", "cathay", "finnair", "qatar", "vietnam", "accor", "flyingblue", "airindia", "qantas"],
    post: "Axis Travel EDGE reshuffle (23 Sep): BA, Qatar, Cathay, Finnair, Vietnam and Accor sit at 2:1 on Atlas. Flying Blue, Air India and Qantas now share the smaller Group A cap.",
    sources: [
      { label: "Live From A Lounge", href: "https://livefromalounge.com/axis-bank-travel-edge-rewards-reshuffle-2026/" },
      { label: "Magnify", href: "https://magnify.club/guides/axis-accor-returns-miles-and-more-september-2026/" },
      { label: "PickMyCard", href: "https://www.pickmycard.in/blog/axis-edge-transfer-partners-september-2026" },
    ],
  },
  {
    id: "amex-plat-travel-sep-2026",
    date: "2026-09-10",
    kind: "devaluation",
    title: "Amex Platinum Travel: milestone points cut",
    what:
      "The ₹1.9 lakh milestone (7,500 MR points) is gone. At ₹7 lakh, the 22,500 bonus points and ₹10,000 Taj voucher become a single ₹20,000 Taj voucher. The ₹4 lakh milestone keeps its 10,000 points. Second cut this year after March.",
    todo: "If you spend under ₹4 lakh a year on it, the card earns much less now. Compare it on the Choose a card tab.",
    cards: ["amex_mr"],
    partners: [],
    post: "Amex Platinum Travel milestones cut from 10 Sep: the ₹1.9L milestone is gone, and ₹7L now gives a ₹20,000 Taj voucher instead of 22,500 points + ₹10,000 Taj.",
    sources: [
      { label: "Magnify", href: "https://magnify.club/guides/amex-platinum-travel-devaluation-september-2026" },
      { label: "PickMyCard", href: "https://www.pickmycard.in/blog/amex-platinum-travel-devaluation-september-2026" },
      { label: "Live From A Lounge", href: "https://livefromalounge.com/american-express-platinum-travel-card-gets-another-devaluation-inr-1-9-lakh-milestone-removed-inr-7-lakh-milestone-rewards-cut-lounge-access-gets-a-spend-condition/" },
    ],
  },
  {
    id: "amex-plat-travel-lounge-oct-2026",
    date: "2026-10-01",
    kind: "devaluation",
    title: "Amex Platinum Travel: domestic lounge visits now need spend",
    what: "Complimentary domestic lounge access now depends on spending in the previous quarter, reported as ₹1 lakh a quarter.",
    todo: "Check your quarterly spend before relying on the card for lounge entry.",
    cards: ["amex_mr"],
    partners: [],
    post: "Amex Platinum Travel: from 1 Oct, domestic lounge access needs quarterly spend (reported at ₹1L a quarter).",
    sources: [{ label: "PickMyCard", href: "https://www.pickmycard.in/blog/amex-platinum-travel-devaluation-september-2026" }],
  },
  {
    id: "flying-blue-light-sep-2026",
    date: "2026-09-08",
    kind: "devaluation",
    title: "Flying Blue awards split into Light, Standard and Flex",
    what:
      "Air France and KLM awards now come in three fares per cabin. The cheapest price is a Light fare: same miles as before, but no lounge, free seat or refund. Standard and Flex cost more miles to get those back.",
    todo: "Price the Standard fare too if you need a checked bag or free changes, before transferring.",
    cards: ["axis_atlas", "axis_horizon", "axis_magnus", "axis_magnus_burgundy", "hdfc_infinia", "hdfc_regalia_gold", "hsbc_travelone"],
    partners: ["flyingblue"],
    post: "Flying Blue awards now come as Light, Standard and Flex. The cheapest price is a Light fare without lounge, free seat or refunds. Price Standard before you transfer.",
    sources: [
      { label: "The Points Guy", href: "https://thepointsguy.com/news/flying-blue-award-fare-changes/" },
      { label: "InsideFlyer", href: "https://www.insideflyer.com/posts/flying-blue-introduces-tiered-award-fares-starting-sept-8/" },
    ],
  },
  {
    id: "axis-dcc-aug-2026",
    date: "2026-08-28",
    kind: "devaluation",
    title: "Axis: foreign-currency markup up, lounge rules tightened",
    what:
      "The markup on paying in rupees abroad (DCC) rose from 1.5% to 3.5% on several cards; reports give lower figures for Magnus and Magnus for Burgundy. Domestic lounges now need the Axis credit card shown with the boarding pass.",
    todo: "Abroad, always choose to pay in the local currency, not rupees.",
    cards: AXIS_EDGE,
    partners: [],
    post: "Axis from 28 Aug: the markup when you pay in rupees abroad (DCC) goes from 1.5% to 3.5% on several cards. Always pay in the local currency.",
    sources: [
      { label: "Business Today", href: "https://www.businesstoday.in/personal-finance/story/axis-bank-credit-card-rules-dcc-markup-to-rise-to-3-5-late-fee-goes-up-to-rs1300-549766-2026-08-18" },
      { label: "Outlook Money", href: "https://www.outlookmoney.com/banking/axis-bank-credit-card-users-to-face-higher-forex-markup-late-fees-from-august-28" },
    ],
  },
  {
    id: "amex-hilton-aug-2026",
    date: "2026-08-18",
    kind: "improvement",
    title: "Amex: Hilton improves to 1:1.5, Virgin Atlantic also better",
    what: "100,000 Membership Rewards points now give 150,000 Hilton Honors points, up from 90,000. Virgin Atlantic Flying Club also improved. Reported from an Amex mailer; Amex shows live ratios only inside your account.",
    todo: "Check the ratio in your Membership Rewards account before transferring.",
    cards: ["amex_mr"],
    partners: ["hilton", "virgin"],
    post: "Amex India: Membership Rewards to Hilton is now 1:1.5 (was 1:0.9). Virgin Atlantic improved too. Check the live ratio in your MR account first.",
    sources: [
      { label: "Magnify", href: "https://magnify.club/guides/amex-india-transfer-partners/" },
      { label: "CardExpert", href: "https://www.cardexpert.in/?p=18693" },
    ],
  },
  {
    id: "axis-qatar-returns-jul-2026",
    date: "2026-07-25",
    kind: "partner",
    title: "Qatar Airways is back on Axis, at lower ratios",
    what: "Qatar Privilege Club returned as an Axis transfer partner after being dropped in April, but not at the old rates. Avios move freely between Qatar and British Airways.",
    cards: AXIS_EDGE,
    partners: ["qatar"],
    post: "Qatar Airways is back as an Axis transfer partner, at lower ratios than before April. Avios still move 1:1 between Qatar and BA.",
    sources: [{ label: "Magnify", href: "https://magnify.club/guides/axis-qatar-airways-returns-new-transfer-ratios/" }],
  },
  {
    id: "axis-bluchip-jun-2026",
    date: "2026-06-18",
    kind: "partner",
    title: "Axis adds IndiGo BluChip",
    what: "IndiGo BluChip joined Axis Travel EDGE as a Group B partner for EDGE Miles and EDGE Reward points, with a two-month launch offer that has ended. BluChip points are worth about ₹0.40 each.",
    todo: "BluChip pays only part of an IndiGo fare's value; most Axis cards get more from other partners.",
    cards: AXIS_EDGE,
    partners: ["indigo"],
    post: "Axis added IndiGo BluChip as a Travel EDGE partner (Group B). BluChip points are worth about ₹0.40, so check other partners first.",
    sources: [
      { label: "Live From A Lounge", href: "https://livefromalounge.com/axis-bank-adds-indigo-bluchip-as-a-transfer-partner-for-edge-rewards-and-edge-miles/" },
      { label: "SaveSage", href: "https://savesage.club/blogs/axis-indigo-bluchip-transfer-partner-2026" },
    ],
  },
  {
    id: "aeroplan-chart-jun-2026",
    date: "2026-06-01",
    kind: "devaluation",
    title: "Aeroplan partner chart goes up",
    what:
      "Aeroplan's new chart applies to tickets booked from 1 June. Business class in the 2,001–5,000 mile band rose (for example 45,000 to 52,500 within Asia–Pacific), and longer partner bands rose too. Some economy bands fell.",
    todo: "Price the exact route on aircanada.com before transferring.",
    cards: ["axis_atlas", "axis_horizon", "axis_magnus", "axis_magnus_burgundy", "hdfc_infinia", "hdfc_regalia_gold"],
    partners: ["aeroplan"],
    post: "Aeroplan's new partner chart (from 1 Jun): business in the 2,001–5,000 mile band went from 45,000 to 52,500. Price the route on aircanada.com before you transfer.",
    sources: [
      { label: "Air Canada", href: "https://www.aircanada.com/ca/en/ado/home/aeroplan/news/2026-an-update-on-the-aeroplan-flight-reward-chart.html" },
      { label: "The MileLion", href: "https://milelion.com/2026/04/26/air-canda-aeroplan-devalues-award-charts-from-june-2026/" },
    ],
  },
  {
    id: "air-india-express-may-2026",
    date: "2026-05-22",
    kind: "improvement",
    title: "Air India Express bookable with Maharaja Club points",
    what: "Maharaja Club points now book Air India Express flights sold under Air India's code, from 1,500 points, across 55+ destinations in South, Southeast and West Asia. Some reports say 21 May.",
    todo: "Good for short Gulf and Southeast Asia hops; economy only.",
    cards: ["axis_atlas", "axis_horizon", "axis_magnus", "axis_magnus_burgundy", "hdfc_infinia", "hdfc_regalia_gold", "hsbc_travelone"],
    partners: ["airindia"],
    post: "Air India Express flights can now be booked with Maharaja Club points, from 1,500 points. Useful for short Gulf and Southeast Asia trips.",
    sources: [
      { label: "Air India", href: "https://www.airindia.com/in/en/newsroom/press-release/air-india-maharaja-club-members-can-now-earn-and-redeem-maharaja-points-on-air-india-express-flights.html" },
      { label: "Live From A Lounge", href: "https://livefromalounge.com/great-news-air-india-express-redemptions-on-air-india-maharaja-club-now-live/" },
    ],
  },
  {
    id: "axis-partners-cut-apr-2026",
    date: "2026-04-01",
    approx: true,
    kind: "devaluation",
    title: "Axis drops Accor, Marriott and Qatar",
    what: "Axis removed Accor, Marriott Bonvoy and Qatar Airways from Travel EDGE with immediate effect. Qatar returned in July and Accor in September, both at lower ratios; Marriott has not returned.",
    cards: AXIS_EDGE,
    partners: ["accor", "marriott", "qatar"],
    post: "Axis removed Accor, Marriott and Qatar as transfer partners in April. Qatar and Accor have since come back at lower ratios; Marriott hasn't.",
    sources: [
      { label: "Live From A Lounge", href: "https://livefromalounge.com/end-of-an-era-axis-bank-credit-cards-nix-accor-marriott-and-qatar-airways-from-transfer-partner-list-with-immediate-effect/" },
      { label: "Magnify", href: "https://magnify.club/guides/axis-bank-transfer-partner-changes-april-2026/" },
    ],
  },
  {
    id: "axis-atlas-closed-2026",
    date: "2026-04-01",
    approx: true,
    kind: "closure",
    title: "Axis Atlas closed to new applicants",
    what: "Axis stopped taking new Atlas applications in early 2026 and the card was gone from Axis's card page by April. There was no formal announcement. Existing cards keep working.",
    todo: "Holders: keep transferring miles while you can. New applicants: Axis Horizon is the closest open card.",
    cards: ["axis_atlas"],
    partners: [],
    post: "Axis Atlas is closed to new applicants (since early 2026, no formal notice). Existing cards still work; Axis Horizon is the closest open option.",
    sources: [
      { label: "CardTrail", href: "https://cardtrail.in/news/axis-atlas-discontinued-2026/" },
      { label: "CardAdvisor", href: "https://cardadvisor.in/cards/axis-atlas" },
    ],
  },
  {
    id: "hdfc-infinia-cap-feb-2026",
    date: "2026-02-01",
    kind: "devaluation",
    title: "HDFC Infinia: at most five redemptions a month",
    what: "Infinia reward points can now be redeemed at most five times a month, per HDFC's site. Reports of value caps per category differ, so check HDFC's terms.",
    todo: "Batch SmartBuy bookings and transfers into fewer redemptions.",
    cards: ["hdfc_infinia"],
    partners: [],
    post: "HDFC Infinia: from 1 Feb, reward points can be redeemed at most 5 times a month. Batch your SmartBuy bookings and transfers.",
    sources: [
      { label: "Angel One", href: "https://www.angelone.in/news/stocks/hdfc-bank-credit-card-reward-points-revised-effective-february-1-2026" },
      { label: "Whalesbook", href: "https://www.whalesbook.com/news/English/BankingFinance/HDFC-Bank-Caps-Infinia-Card-Redemptions/697ef3e546be08bbe62fcfb2" },
    ],
  },
];

export const CHANGES: Change[] = [...LIST].sort((a, b) => b.date.localeCompare(a.date));

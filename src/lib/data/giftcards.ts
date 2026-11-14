/**
 * Gift vouchers: extra points for buying them through a bank's portal, and
 * what points are worth when spent on vouchers. Researched 14 Nov 2026.
 * Only figures with medium or high confidence are listed; anything we
 * couldn't confirm for 2026 is left out rather than guessed. Banks change
 * these often, so every entry carries its sources and dates.
 */

export const GIFT_CHECKED = "2026-11-14";

export type Confidence = "high" | "medium";

export interface GiftSource {
  label: string;
  url: string;
  /** YYYY-MM-DD the source was published or updated; "" when undated */
  date: string;
}

export interface VoucherEarn {
  /** Catalogue card id (src/lib/data/cards.ts) */
  card: string;
  /** Programme key in PROGRAMS, for valuing the points */
  program: string;
  name: string;
  portal: string;
  /** As the bank states it, e.g. "5X" */
  mult: string;
  /** Total points per ₹100 on vouchers, including the card's normal points */
  per100: number;
  /** The card's normal points per ₹100 */
  base: number;
  /**
   * Monthly limit. "bonus": only the extra points are capped; above it,
   * spend earns the normal rate. "total": all portal points are capped; we
   * count nothing above it, as what happens beyond isn't confirmed.
   */
  cap: { pts: number; kind: "bonus" | "total"; text: string };
  /** Fees, brand limits and other things to know */
  notes: string[];
  conf: Confidence;
  src: GiftSource[];
}

const SB_MAGNIFY: GiftSource = { label: "Magnify: SmartBuy voucher cap", url: "https://magnify.club/guides/hdfc-smartbuy-gift-voucher-points-cap", date: "2026-07-01" };
const SB_LFAL: GiftSource = { label: "LiveFromALounge: SmartBuy voucher cap from 1 Jul", url: "https://livefromalounge.com/hdfc-bank-credit-cards-devalues-smartbuy-gift-vouchers-accelerated-rewards-with-new-monthly-cap-effective-today", date: "2026-07-01" };
const SB_CARDMAVEN: GiftSource = { label: "CardMaven: SmartBuy Gyftr/Woohoo caps", url: "https://cardmaven.in/hdfc-smartbuy-gyftr-woohoo-reward-caps", date: "2026-07-05" };
const SB_CARDINSIDER: GiftSource = { label: "CardInsider: SmartBuy offers", url: "https://cardinsider.com/blog/hdfc-bank-smartbuy-rewards-program-offers", date: "2026-10-01" };
const ISHOP_FAQ: GiftSource = { label: "ICICI iShop FAQ (bank)", url: "https://www.icici.bank.in/ishop/faqs", date: "" };
const ISHOP_CARDINSIDER: GiftSource = { label: "CardInsider: ICICI iShop", url: "https://cardinsider.com/blog/icici-bank-ishop-rewards-portal", date: "2026-11-03" };
const SHOPWISE: GiftSource = { label: "Pointsfly: Amex ShopWise (cites Aug 2026 T&C)", url: "https://pointsfly.ai/blog/amex-reward-multiplier-shopwise", date: "2026-10-17" };

const SB_NOTES = [
  "The 3,000 is part of the card's overall SmartBuy monthly cap, not on top of it.",
  "Above the cap, vouchers earn the card's normal points.",
];
const AMEX_CAP = { pts: 25000, kind: "bonus" as const, text: "25,000 extra MR points a calendar month, shared across all ShopWise buys" };
const AMEX_NOTES = ["Amazon Pay vouchers: up to ₹20,000 a month; Amazon vouchers carry a 1.5% + GST fee.", "One source for the caps; check Amex's ShopWise terms before you buy."];
const ISHOP_NOTES = ["Brand limits a month: Amazon and Flipkart ₹12,000, BigBasket and Blinkit ₹2,000.", "2.5% fee on Amazon, Flipkart and Swiggy vouchers paid by card.", "Some brands (reported: Amazon Pay, Tanishq) may earn only the normal rate since early 2026."];

export const VOUCHER_EARN: VoucherEarn[] = [
  { card: "hdfc-infinia", program: "hdfc_infinia", name: "HDFC Infinia", portal: "SmartBuy (Gyftr / Woohoo)", mult: "5X", per100: 16.67, base: 3.33, cap: { pts: 3000, kind: "bonus", text: "3,000 extra points a month on vouchers (from 1 Jul 2026)" }, notes: SB_NOTES, conf: "medium", src: [SB_MAGNIFY, SB_LFAL] },
  { card: "hdfc-dcb-metal", program: "hdfc_infinia", name: "HDFC Diners Club Black Metal", portal: "SmartBuy (Gyftr / Woohoo)", mult: "3X", per100: 10, base: 3.33, cap: { pts: 3000, kind: "bonus", text: "3,000 extra points a month on vouchers (from 1 Jul 2026)" }, notes: SB_NOTES, conf: "medium", src: [SB_CARDMAVEN, SB_CARDINSIDER] },
  { card: "hdfc-dcb", program: "hdfc_infinia", name: "HDFC Diners Club Black", portal: "SmartBuy (Gyftr / Woohoo)", mult: "3X", per100: 10, base: 3.33, cap: { pts: 3000, kind: "bonus", text: "3,000 extra points a month on vouchers (from 1 Jul 2026)" }, notes: SB_NOTES, conf: "medium", src: [SB_CARDMAVEN, SB_CARDINSIDER] },
  { card: "hdfc-regalia-gold", program: "hdfc_regalia_gold", name: "HDFC Regalia Gold", portal: "SmartBuy (Gyftr / Woohoo)", mult: "5X", per100: 12.5, base: 2.5, cap: { pts: 3000, kind: "bonus", text: "3,000 extra points a month on vouchers (from 1 Jul 2026), within a 4,000 overall SmartBuy cap" }, notes: [...SB_NOTES, "Sources differ slightly on the rate since the 15 May 2026 earn change; we use 5 points per ₹200 × 5."], conf: "medium", src: [SB_CARDMAVEN, SB_CARDINSIDER] },
  { card: "icici-emeralde-pm", program: "icici_air", name: "ICICI Emeralde Private Metal", portal: "iShop", mult: "6X", per100: 18, base: 3, cap: { pts: 18000, kind: "total", text: "18,000 iShop points a month (10,000 a day)" }, notes: ISHOP_NOTES, conf: "medium", src: [ISHOP_FAQ, ISHOP_CARDINSIDER] },
  { card: "icici-times-black", program: "icici_air", name: "ICICI Times Black", portal: "iShop", mult: "6X", per100: 12, base: 2, cap: { pts: 15000, kind: "total", text: "15,000 iShop points a month (8,000 a day)" }, notes: ISHOP_NOTES, conf: "medium", src: [ISHOP_FAQ, ISHOP_CARDINSIDER] },
  { card: "amex-plat-charge", program: "amex_mr", name: "Amex Platinum Charge", portal: "ShopWise", mult: "5X", per100: 12.5, base: 2.5, cap: AMEX_CAP, notes: AMEX_NOTES, conf: "medium", src: [SHOPWISE] },
  { card: "amex-gold-charge", program: "amex_mr", name: "Amex Gold Charge", portal: "ShopWise", mult: "5X", per100: 10, base: 2, cap: AMEX_CAP, notes: AMEX_NOTES, conf: "medium", src: [SHOPWISE] },
  { card: "amex-plat-travel", program: "amex_mr", name: "Amex Platinum Travel", portal: "ShopWise", mult: "3X", per100: 6, base: 2, cap: AMEX_CAP, notes: AMEX_NOTES, conf: "medium", src: [SHOPWISE] },
  { card: "amex-plat-reserve", program: "amex_mr", name: "Amex Platinum Reserve", portal: "ShopWise", mult: "3X", per100: 6, base: 2, cap: AMEX_CAP, notes: AMEX_NOTES, conf: "medium", src: [SHOPWISE] },
  { card: "amex-mrcc", program: "amex_mr", name: "Amex Membership Rewards Credit Card", portal: "ShopWise", mult: "2X", per100: 4, base: 2, cap: AMEX_CAP, notes: AMEX_NOTES, conf: "medium", src: [SHOPWISE] },
];

/** Banks where vouchers earn nothing extra, or nothing at all. */
export const VOUCHER_NO_EARN: { bank: string; text: string; src: GiftSource[] }[] = [
  {
    bank: "Axis Bank",
    text: "Gift card purchases earn no EDGE points on Axis cards, and on Select they don't count towards the fee waiver (card terms revised from 21 and 28 Aug 2026).",
    src: [
      { label: "Axis Horizon terms revision (bank)", url: "https://www.axis.bank.in/cards/credit-card/axis-horizon-credit-card", date: "2026-08-21" },
      { label: "LiveFromALounge: Axis changes from 28 Aug", url: "https://livefromalounge.com/axis-bank-credit-card-benefits-paywalled-august-2026", date: "2026-08-28" },
    ],
  },
];

/** Spending points on vouchers or products, ₹ per card point. */
export interface VoucherBurn {
  program: string;
  /** Which cards it applies to, when narrower than the programme */
  cards?: string;
  what: string;
  v: number;
  example: string;
  limits?: string;
  conf: Confidence;
  src: GiftSource[];
}

const HDFC_INFINIA_TNC: GiftSource = { label: "HDFC Infinia rewards T&C (bank PDF)", url: "https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/credit-cards/infinia-credit-card/rewards-points-program-terms-and-conditions.pdf", date: "2026-07-01" };
const HDFC_MITC: GiftSource = { label: "HDFC card MITC (bank PDF)", url: "https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/cards/credit-cards/personal-mitc/mitc-in-english.pdf", date: "2026-11-11" };
const SB_GUIDE: GiftSource = { label: "CardMaven: SmartBuy guide", url: "https://cardmaven.in/hdfc-smartbuy-offers-complete-guide/", date: "2026-11-10" };
const AMEX_GOLD: GiftSource = { label: "Amex Gold Card page (bank)", url: "https://www.americanexpress.com/in/charge-cards/gold-card/", date: "2026-11-14" };
const EMERALDE: GiftSource = { label: "CardMaven: Emeralde Private Metal review", url: "https://cardmaven.in/icici-bank-emeralde-private-metal-credit-card-review/", date: "2026-11-07" };

export const VOUCHER_BURN: VoucherBurn[] = [
  { program: "hdfc_infinia", cards: "Infinia", what: "Apple products and Tanishq vouchers on SmartBuy", v: 1.0, example: "50,000 points → ₹50,000 Tanishq voucher", limits: "Points pay up to 70% of the price; one Apple product a quarter; Tanishq up to 50,000 points a quarter", conf: "high", src: [HDFC_INFINIA_TNC] },
  { program: "hdfc_infinia", what: "Other vouchers and products on SmartBuy", v: 0.5, example: "10,000 points → up to ₹5,000", conf: "medium", src: [SB_GUIDE] },
  { program: "hdfc_infinia", what: "Statement credit", v: 0.3, example: "50,000 points → ₹15,000", limits: "Up to 50,000 points a month", conf: "high", src: [HDFC_INFINIA_TNC, HDFC_MITC] },
  { program: "hdfc_regalia_gold", what: "Vouchers and products on SmartBuy", v: 0.35, example: "10,000 points → up to ₹3,500", limits: "Points pay up to 70% of the price", conf: "medium", src: [SB_GUIDE, HDFC_MITC] },
  { program: "hdfc_regalia_gold", what: "Statement credit", v: 0.15, example: "10,000 points → ₹1,500", limits: "Up to 50,000 points a month", conf: "high", src: [HDFC_MITC] },
  { program: "amex_mr", what: "24K Gold Collection: Taj voucher", v: 14000 / 24000, example: "24,000 points → ₹14,000 Taj", limits: "Offered on Gold Charge and the MR Credit Card", conf: "high", src: [AMEX_GOLD] },
  { program: "amex_mr", what: "18K Gold Collection: Taj voucher", v: 0.5, example: "18,000 points → ₹9,000 Taj", conf: "high", src: [AMEX_GOLD] },
  { program: "amex_mr", what: "Gold Collection: Amazon, Flipkart or Reliance Digital", v: 8000 / 24000, example: "24,000 points → ₹8,000 Amazon", conf: "high", src: [AMEX_GOLD] },
  { program: "icici_air", cards: "Emeralde Private Metal", what: "Premium vouchers", v: 1.0, example: "10,000 points → ₹10,000", limits: "Which vouchers count isn't published by the bank", conf: "medium", src: [EMERALDE] },
  { program: "icici_air", cards: "Emeralde Private Metal", what: "Rewards catalogue", v: 0.6, example: "10,000 points → ₹6,000", conf: "medium", src: [EMERALDE] },
  { program: "icici_air", cards: "Times Black", what: "Statement credit", v: 0.4, example: "10,000 points → ₹4,000", conf: "high", src: [{ label: "ICICI Times Black page (bank)", url: "https://www.icici.bank.in/personal-banking/cards/credit-card/times-black-icici-credit-card", date: "" }] },
  { program: "icici_rp", what: "Vouchers and catalogue", v: 0.25, example: "10,000 points → ₹2,500", limits: "₹99 + GST a redemption", conf: "medium", src: [{ label: "CardMaven: Sapphiro review", url: "https://cardmaven.in/icici-bank-sapphiro-credit-card-review/", date: "2026-11-07" }] },
  { program: "sbi_rp", what: "Vouchers or statement credit", v: 0.25, example: "4,000 points → ₹1,000", limits: "Statement credit up to 60,000 points a month, in 4,000 blocks; ₹99 fee (from 1 Apr 2026)", conf: "medium", src: [{ label: "SBI Card redemption FAQ (bank)", url: "https://www.sbicard.com/en/faq/reward-points-redemption.page", date: "2026-04-01" }] },
  { program: "idfc_rp", what: "Vouchers, catalogue or statement credit", v: 0.25, example: "10,000 points → ₹2,500", conf: "high", src: [{ label: "IDFC FIRST rewards T&C (bank)", url: "https://www.idfcfirst.bank.in/terms-and-conditions/first-rewards-program-tnc", date: "2025-10-10" }] },
];

/** Programmes we looked at but couldn't confirm a voucher value for. */
export const VOUCHER_UNKNOWN = "Axis doesn't publish a current voucher value table (forums report about ₹0.20 a point on the EDGE Rewards catalogue), and HSBC TravelOne prices vouchers case by case, so both are left out. Scapia coins can't be spent on vouchers: they pay for travel in the Scapia app at ₹0.20 each.";

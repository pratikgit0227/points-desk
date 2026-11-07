export type PartnerKind = "air" | "hotel";
export type Filter = "all" | PartnerKind;
export type AxisGroup = "A" | "B";

export interface Partner {
  /** Display name */
  readonly n: string;
  /** Airline or hotel programme */
  readonly k: PartnerKind;
  /** Default ₹ value of one partner point */
  readonly v: number;
}

/** [partner points per 1 card point, Axis transfer group if any] */
export type Rate = readonly [ratio: number, group?: AxisGroup];

export interface Program {
  key: string;
  bank: string;
  card: string;
  unit: string;
  /** Example balance shown before the user enters their own */
  ex: number;
  /** Direct (non-transfer) redemption value per point */
  base: { v: number; label: string };
  /** Yearly transfer caps per Axis group */
  caps?: Record<AxisGroup, number>;
  /** Transfer ratios keyed by partner id */
  r: Record<string, Rate>;
}

export interface CardInfo {
  status: string;
  /** Annual fee in ₹ including 18% GST */
  fee: number;
  /** Yearly spend that waives the fee */
  waive?: number;
  /** Points earned per ₹100 */
  earn?: { travel: number; other: number };
  /** Earn rate is the base retail rate, not checked per merchant */
  est?: boolean;
  /** Milestone bonus points */
  bonus?: { at: number; pts: number; label?: string }[];
  /** Include in the "pick a card" table */
  pick?: boolean;
  label?: string;
  why?: string;
}

export interface Spot {
  to: string;
  from: string;
  cab: string;
  /** Partner points needed; absent when the price is dynamic */
  m?: number;
  note: string;
}

export interface Guide {
  about: string;
  spots: Spot[];
  steps: string[];
  watch: string[];
  src: string;
}

export interface Merchant {
  id: string;
  n: string;
  kw: string;
  /** Partner programme the merchant belongs to, if any */
  p?: string;
}

export type Cabin = "eco" | "biz";

/** One way to reach a destination with a transfer partner's points. */
export interface AwardRoute {
  /** Transfer partner whose points pay for it */
  p: string;
  /** Airline actually flown */
  airline: string;
  /** e.g. "Delhi / Mumbai → Kuwait, nonstop" */
  route: string;
  /** One-way partner points, economy */
  eco?: number;
  /** One-way partner points, business */
  biz?: number;
  /**
   * fixed: chart or zone price; dynamic: price moves, numbers are typical lows;
   * revenue: points pay the cash fare (1 point ≈ ₹1)
   */
  pricing: "fixed" | "dynamic" | "revenue";
  /** low = estimated from nearby routes, not seen for this exact route */
  confidence: "high" | "medium" | "low";
  /** Economy only (e.g. Air India Express) */
  ecoOnly?: boolean;
  note?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  /** Main airport code */
  code: string;
  /** Extra search words: city names, airport codes, country */
  kw: string;
  /** Airlines flying nonstop from India, for paying cash */
  nonstop: { airline: string; merchant?: string; from: string }[];
  options: AwardRoute[];
  note?: string;
  /** Typical one-way cash fare in ₹ per cabin, as a starting value */
  fare: Record<Cabin, number>;
  checked: string;
  src: string;
}

export interface FareSnapshot {
  cash: number;
  travel: string;
  checked: string;
  src: string;
}

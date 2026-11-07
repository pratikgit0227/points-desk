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

export interface FareSnapshot {
  cash: number;
  travel: string;
  checked: string;
  src: string;
}

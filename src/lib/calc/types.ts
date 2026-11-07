import type { Filter } from "@/lib/data";

export type BalanceSource = "mail" | "manual" | "ex";

export interface Balance {
  n: number;
  src: BalanceSource;
  asOf?: string;
  subject?: string;
}

/** Balance per program key */
export type Balances = Record<string, Balance>;

/** User overrides of ₹ per partner point */
export type Values = Record<string, number>;

/** Cash prices the user typed in, keyed "partner|spot index" */
export type CashPrices = Record<string, { cash: number; tax: number }>;

export interface Ctx {
  balances: Balances;
  values: Values;
  filter: Filter;
}

/** A balance read out of an email or SMS */
export interface FoundBalance {
  program: string;
  balance: number;
  asOf: string;
  subject: string;
  evidence: string;
}

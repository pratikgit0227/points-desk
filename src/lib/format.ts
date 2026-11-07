/** ₹1,23,456 (Indian digit grouping) */
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/** 1,23,456 */
export const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/** 2 → "1 : 2", 0.5 → "2 : 1" (card points : partner points) */
export const ratioTxt = (r: number) => (r >= 1 ? "1 : " + +r.toFixed(2) : +(1 / r).toFixed(2) + " : 1");

/** 2026-09-25 → 09-25 */
export const shortDate = (iso: string) => iso.slice(5);

export const shortBank = (bank: string) => bank.replace(" Bank", "");

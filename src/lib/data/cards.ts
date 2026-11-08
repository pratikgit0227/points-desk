/**
 * Every card a user can add to their wallet. Several cards can share one points
 * programme (e.g. all Amex India cards earn Membership Rewards), so each entry
 * points at the programme whose ratios it uses. Entries without a programme are
 * listed so people can find their card, but can't be valued yet.
 */
export interface CatalogueCard {
  id: string;
  bank: string;
  name: string;
  /** Programme key in PROGRAMS whose points and ratios this card uses */
  program?: string;
  /** Short note shown in the list, e.g. "same points as Infinia" */
  note?: string;
  /** Overrides the programme's status / fee (₹ incl. GST) when this card differs */
  status?: string;
  fee?: number;
}

export const CATALOGUE: CatalogueCard[] = [
  // Axis Bank
  { id: "axis-atlas", bank: "Axis Bank", name: "Atlas", program: "axis_atlas" },
  { id: "axis-horizon", bank: "Axis Bank", name: "Horizon", program: "axis_horizon" },
  { id: "axis-magnus", bank: "Axis Bank", name: "Magnus", program: "axis_magnus" },
  { id: "axis-magnus-burgundy", bank: "Axis Bank", name: "Magnus for Burgundy", program: "axis_magnus_burgundy" },
  { id: "axis-reserve", bank: "Axis Bank", name: "Reserve", program: "axis_magnus", note: "Same ratios as Magnus", status: "Mostly by invitation", fee: 59000 },
  { id: "axis-olympus", bank: "Axis Bank", name: "Olympus", program: "axis_olympus" },
  { id: "axis-select", bank: "Axis Bank", name: "Select", program: "axis_select", fee: 3540 },
  { id: "axis-privilege", bank: "Axis Bank", name: "Privilege", program: "axis_select", note: "Same ratios as Select", fee: 1770 },
  // HDFC Bank
  { id: "hdfc-infinia", bank: "HDFC Bank", name: "Infinia", program: "hdfc_infinia" },
  { id: "hdfc-dcb", bank: "HDFC Bank", name: "Diners Club Black", program: "hdfc_infinia", note: "Same points and ratios as Infinia", status: "Open", fee: 11800 },
  { id: "hdfc-dcb-metal", bank: "HDFC Bank", name: "Diners Club Black Metal", program: "hdfc_infinia", note: "Same points and ratios as Infinia", status: "Open", fee: 11800 },
  { id: "hdfc-regalia-gold", bank: "HDFC Bank", name: "Regalia Gold", program: "hdfc_regalia_gold" },
  { id: "hdfc-marriott", bank: "HDFC Bank", name: "Marriott Bonvoy", program: "marriott_hdfc", note: "Earns Marriott points directly" },
  { id: "hdfc-tata-neu", bank: "HDFC Bank", name: "Tata Neu Infinity", program: "tata_neu" },
  { id: "hdfc-diners-privilege", bank: "HDFC Bank", name: "Diners Club Privilege" },
  // American Express (all earn Membership Rewards at the same ratios)
  { id: "amex-plat-travel", bank: "American Express", name: "Platinum Travel", program: "amex_mr" },
  { id: "amex-gold-charge", bank: "American Express", name: "Gold Charge", program: "amex_mr", note: "Same MR ratios", status: "Closed to new applicants", fee: 5310 },
  { id: "amex-mrcc", bank: "American Express", name: "Membership Rewards Credit Card", program: "amex_mr", note: "Same MR ratios", status: "Closed to new applicants" },
  { id: "amex-plat-reserve", bank: "American Express", name: "Platinum Reserve", program: "amex_mr", note: "Same MR ratios", status: "Closed to new applicants", fee: 11800 },
  { id: "amex-plat-charge", bank: "American Express", name: "Platinum Charge", program: "amex_mr", note: "Same MR ratios", status: "Closed to new applicants", fee: 77880 },
  // HSBC
  { id: "hsbc-travelone", bank: "HSBC", name: "TravelOne", program: "hsbc_travelone" },
  // ICICI Bank
  { id: "icici-emeralde-pm", bank: "ICICI Bank", name: "Emeralde Private Metal", program: "icici_air" },
  { id: "icici-times-black", bank: "ICICI Bank", name: "Times Black", program: "icici_air", note: "Same points: Air India 1:1", fee: 23600 },
  { id: "icici-sapphiro", bank: "ICICI Bank", name: "Sapphiro", program: "icici_rp" },
  { id: "icici-amazon-pay", bank: "ICICI Bank", name: "Amazon Pay", program: "cashback", note: "Cashback", status: "Open, lifetime free", fee: 0 },
  // SBI Card
  { id: "sbi-cashback", bank: "SBI Card", name: "Cashback", program: "cashback", note: "Cashback", status: "Open", fee: 1179 },
  { id: "sbi-aurum", bank: "SBI Card", name: "Aurum", program: "sbi_rp", status: "Mostly by invitation", fee: 11799 },
  { id: "sbi-elite", bank: "SBI Card", name: "ELITE", program: "sbi_rp", status: "Open", fee: 5899 },
  { id: "sbi-krisflyer-apex", bank: "SBI Card", name: "KrisFlyer SBI Apex", program: "krisflyer_sbi", note: "Earns KrisFlyer miles directly" },
  { id: "sbi-air-india", bank: "SBI Card", name: "Air India SBI Signature" },
  // IDFC FIRST Bank
  { id: "idfc-wealth", bank: "IDFC FIRST Bank", name: "Wealth", program: "idfc_rp", status: "Open, lifetime free", fee: 0 },
  { id: "idfc-ashva", bank: "IDFC FIRST Bank", name: "Ashva", program: "idfc_rp", fee: 3539 },
  { id: "idfc-mayura", bank: "IDFC FIRST Bank", name: "Mayura", program: "idfc_rp", fee: 7079 },
  // IndusInd Bank
  { id: "indusind-avios", bank: "IndusInd Bank", name: "Avios Visa Infinite", program: "avios_indusind", note: "Earns Avios directly" },
  { id: "indusind-pinnacle", bank: "IndusInd Bank", name: "Pinnacle" },
  // YES Bank
  { id: "yes-marquee", bank: "YES Bank", name: "Marquee", program: "yes_marquee" },
  { id: "yes-reserv", bank: "YES Bank", name: "Reserv" },
  // Others
  { id: "scapia", bank: "Federal Bank", name: "Scapia", program: "scapia" },
  { id: "kotak-white-reserve", bank: "Kotak Mahindra Bank", name: "White Reserve" },
  { id: "kotak-solitaire", bank: "Kotak Mahindra Bank", name: "Solitaire" },
  { id: "au-zenith-plus", bank: "AU Small Finance Bank", name: "Zenith+" },
  { id: "au-ixigo", bank: "AU Small Finance Bank", name: "ixigo" },
  { id: "sc-ultimate", bank: "Standard Chartered", name: "Ultimate" },
];

export function catalogueCard(id: string | undefined): CatalogueCard | undefined {
  return id ? CATALOGUE.find((c) => c.id === id) : undefined;
}

/** The first catalogue card for a programme: its default name. */
export function defaultCardFor(program: string): CatalogueCard | undefined {
  return CATALOGUE.find((c) => c.program === program);
}

/** Catalogue cards grouped by bank, filtered by a search string. */
export function searchCatalogue(q: string): { bank: string; cards: CatalogueCard[] }[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = CATALOGUE.filter((c) => {
    const hay = `${c.bank} ${c.name} ${c.bank.replace(" Bank", "")} ${c.bank === "American Express" ? "amex" : ""}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  const banks = [...new Set(hits.map((c) => c.bank))];
  return banks.map((bank) => ({ bank, cards: hits.filter((c) => c.bank === bank) }));
}

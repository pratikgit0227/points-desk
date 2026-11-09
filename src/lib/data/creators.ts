import type { PartnerId } from "./partners";

/**
 * Creator trip pages (pilot). A creator sends their trip; it is added here by
 * pull request and goes live when the owner merges it. Points prices, ratios
 * and bags always come from the site's own data, so a creator page can't
 * drift from the numbers everywhere else. Followers' balances never leave
 * their browser; creators see only page views (Vercel Web Analytics).
 */

export interface Creator {
  id: string;
  name: string;
  /** One line about them */
  bio: string;
  /** Profile link (X, Instagram, YouTube or site) */
  url?: string;
}

export interface CreatorLink {
  label: string;
  href: string;
  /** Affiliate, referral or paid placement: always shown as such */
  paid?: boolean;
}

export interface CreatorTrip {
  slug: string;
  creator: string;
  title: string;
  /** Destination id from DESTINATIONS */
  dest: string;
  /** The creator's own words: why this trip */
  intro: string;
  /** When to go and how flexible to be */
  when: string;
  cabin: "eco" | "biz";
  /** Award options to show, as optionKey ("partner|route") from the destination */
  picks: string[];
  /** Where to stay, with the programme if it's a points stay */
  stays: { name: string; p?: PartnerId; note: string }[];
  checklist: string[];
  links: CreatorLink[];
  /** YYYY-MM-DD */
  published: string;
  updated: string;
}

export const CREATORS: Creator[] = [
  {
    id: "suiteandseat",
    name: "Suite & Seat",
    bio: "The team behind this site. Example page for the creator pilot.",
    url: "https://suiteandseat.vercel.app",
  },
];

export const CREATOR_TRIPS: CreatorTrip[] = [
  {
    slug: "dubai-long-weekend",
    creator: "suiteandseat",
    title: "Dubai long weekend on points",
    dest: "dxb",
    intro:
      "Dubai is the easiest first points trip from India: short nonstop flights from most metros, and Air India's Value fare is a low 12,000 points one-way in economy. Book the flights with points and keep cash for the hotel, or use hotel points if you have them.",
    when: "Thursday night out, Monday back. October to March is cooler. Search a few dates: seats at the lowest points price go fast.",
    cabin: "eco",
    picks: ["airindia|Delhi / Mumbai → Dubai, nonstop", "aeroplan|Delhi → Dubai, nonstop", "qatar|Delhi / Mumbai → Doha → Dubai"],
    stays: [
      { name: "A Marriott Bonvoy hotel", p: "marriott", note: "Plenty in Dubai at many price levels. Check the points price per night on Marriott's site before moving points." },
      { name: "An Accor hotel (Novotel, Ibis, Sofitel)", p: "accor", note: "Accor points are a fixed discount on the bill, so compare with the cash rate." },
    ],
    checklist: [
      "Passport valid for 6 months or more",
      "UAE visa or visa on arrival: check your eligibility before booking",
      "Find the award seat for every traveller before transferring points",
      "Check the checked-bag allowance on the award ticket",
      "Travel insurance",
    ],
    links: [{ label: "Visit Dubai (official tourism site)", href: "https://www.visitdubai.com/" }],
    published: "2026-11-09",
    updated: "2026-11-09",
  },
];

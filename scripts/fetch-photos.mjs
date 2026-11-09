// Fetches one landmark photo per place from Wikipedia / Wikimedia Commons,
// with the photographer and licence, and writes src/lib/data/photos.ts.
// Run: node scripts/fetch-photos.mjs   (free API, no key)
import { writeFileSync } from "node:fs";

/** place key → [label shown in credits, Wikipedia article whose lead photo we use] */
const PLACES = {
  kwi: ["Kuwait Towers", "Kuwait Towers"],
  dxb: ["Burj Khalifa, Dubai", "Burj Khalifa"],
  auh: ["Sheikh Zayed Grand Mosque, Abu Dhabi", "Sheikh Zayed Grand Mosque"],
  doh: ["Museum of Islamic Art, Doha", "Museum of Islamic Art, Doha"],
  mct: ["Muttrah Corniche, Muscat", "Sultan Qaboos Grand Mosque"],
  bah: ["Bahrain World Trade Center", "Bahrain World Trade Center"],
  ruh: ["Riyadh skyline", "Kingdom Centre"],
  jed: ["Jeddah Corniche", "King Fahd's Fountain"],
  jfk: ["Manhattan, New York", "Lower Manhattan"],
  sfo: ["Golden Gate Bridge, San Francisco", "Golden Gate Bridge"],
  yyz: ["CN Tower, Toronto", "CN Tower"],
  syd: ["Sydney Opera House", "Sydney Opera House"],
  mel: ["Flinders Street station, Melbourne", "Flinders Street railway station"],
  sin: ["Marina Bay Sands, Singapore", "Marina Bay Sands"],
  bkk: ["Wat Arun, Bangkok", "Wat Arun"],
  hkt: ["Phi Phi Islands, near Phuket", "Phi Phi Islands"],
  dps: ["Pura Ulun Danu Bratan, Bali", "Pura Ulun Danu Bratan"],
  kul: ["Petronas Towers, Kuala Lumpur", "Petronas Towers"],
  hkg: ["Victoria Harbour, Hong Kong", "Victoria Harbour"],
  tyo: ["Tokyo Tower", "Tokyo Tower"],
  han: ["Ha Long Bay, Vietnam", "Ha Long Bay"],
  mle: ["Maldives island resort", "Kurumba Maldives"],
  cmb: ["Lotus Tower, Colombo", "Lotus Tower"],
  ktm: ["Boudhanath, Kathmandu", "Boudhanath"],
  lhr: ["Tower Bridge, London", "Tower Bridge"],
  cdg: ["Eiffel Tower, Paris", "Eiffel Tower"],
  fra: ["Römerberg, Frankfurt", "Römerberg"],
  ams: ["Canals of Amsterdam", "Canals of Amsterdam"],
  zrh: ["Lake Zurich", "Lake Zurich"],
  ist: ["Hagia Sophia, Istanbul", "Hagia Sophia"],
  mru: ["Le Morne Brabant, Mauritius", "Le Morne Brabant"],
  nbo: ["Nairobi National Park", "Nairobi National Park"],
  // Wider areas used by the guide cards
  japan: ["Mount Fuji, Japan", "Mount Fuji"],
  usa: ["Grand Canyon, USA", "Grand Canyon"],
  europe: ["Neuschwanstein Castle, Germany", "Neuschwanstein Castle"],
  india: ["India Gate, Delhi", "India Gate"],
  hotel: ["Taj Mahal Palace, Mumbai", "Taj Mahal Palace Hotel"],
  palace: ["City Palace, Udaipur", "City Palace, Udaipur"],
  goa: ["Palolem Beach, Goa", "Palolem Beach"],
  helsinki: ["Helsinki Cathedral", "Helsinki Cathedral"],
};

const UA = "SuiteAndSeat/1.0 (https://suiteandseat.vercel.app)";
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function json(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(r.status + " " + url);
  return r.json();
}

/** Places where the article's lead image is a logo, map or off-topic: search Commons photos instead. */
const SEARCH = {
  kwi: "Kuwait Towers",
  auh: "Sheikh Zayed Mosque Abu Dhabi",
  doh: "Museum of Islamic Art Doha",
  mct: "Muttrah Corniche Muscat",
  ruh: "Riyadh skyline",
  jed: "Jeddah Corniche",
  bah: "Bahrain World Trade Center Manama",
  cmb: "Lotus Tower Colombo",
  yyz: "Toronto skyline CN Tower",
  kul: "Petronas Twin Towers night",
  hkg: "Victoria Harbour Hong Kong skyline night",
  fra: "Frankfurt Römerberg",
  ams: "Amsterdam canal houses",
  han: "Ha Long Bay",
  ktm: "Boudhanath stupa",
  helsinki: "Helsinki Cathedral Senate Square",
};

/** First photo (jpg) in a Commons search, with a 960px thumbnail. */
async function searchCommons(q) {
  const r = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=${encodeURIComponent(q + " filetype:bitmap")}&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=960`);
  const pages = Object.values(r.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  return pages.find((p) => /\.jpe?g$/i.test(p.title) && p.imageinfo?.[0]?.width >= 1200 && p.imageinfo[0].width > p.imageinfo[0].height);
}

const license = (m) => strip(m.LicenseShortName?.value) || strip(m.License?.value) || strip(m.UsageTerms?.value) || "see source";

const out = {};
for (const [key, [label, title]] of Object.entries(PLACES)) {
  if (SEARCH[key]) {
    const hit = await searchCommons(SEARCH[key]);
    if (!hit) {
      console.warn("no search hit:", key);
      continue;
    }
    const info = hit.imageinfo[0];
    const m = info.extmetadata ?? {};
    out[key] = { src: info.thumburl, alt: label, file: hit.title.replace(/^File:/, ""), page: info.descriptionurl, by: strip(m.Artist?.value) || "Unknown", license: license(m) };
    console.log(key.padEnd(9), out[key].license.padEnd(14), out[key].file, "(search)");
    continue;
  }
  const pi = await json(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name|thumbnail&pithumbsize=960&titles=${encodeURIComponent(title)}`);
  const page = Object.values(pi.query.pages)[0];
  if (!page?.pageimage || !page.thumbnail) {
    console.warn("no image:", key, title);
    continue;
  }
  const file = "File:" + page.pageimage;
  const ii = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&titles=${encodeURIComponent(file)}`);
  const info = Object.values(ii.query.pages)[0]?.imageinfo?.[0];
  const m = info?.extmetadata ?? {};
  out[key] = {
    src: page.thumbnail.source,
    alt: label,
    file: page.pageimage,
    page: info?.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(file)}`,
    by: strip(m.Artist?.value) || "Unknown",
    license: license(m),
  };
  console.log(key.padEnd(9), out[key].license.padEnd(14), page.pageimage);
}

const body = `// Generated by scripts/fetch-photos.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand.
// Landmark photos from Wikimedia Commons; each needs its credit shown.

export interface Photo {
  src: string;
  alt: string;
  file: string;
  /** Commons file page: source, licence and author */
  page: string;
  by: string;
  license: string;
}

export const PHOTOS: Record<string, Photo> = ${JSON.stringify(out, null, 2)};
`;
const notFree = Object.entries(out).filter(([, p]) => !/^(CC BY|CC0|Public domain|PD)/i.test(p.license));
if (notFree.length) {
  console.error("Not clearly free, dropped:", notFree.map(([k, p]) => `${k} (${p.license})`).join(", "));
  for (const [k] of notFree) delete out[k];
}
writeFileSync(new URL("../src/lib/data/photos.ts", import.meta.url), body);
console.log("wrote", Object.keys(out).length, "photos");

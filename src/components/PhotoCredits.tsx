import { PHOTOS } from "@/lib/data";

/** Every landmark photo used on the site, with photographer, licence and source. */
export function PhotoCredits() {
  const list = Object.values(PHOTOS).sort((a, b) => a.alt.localeCompare(b.alt));
  return (
    <section className="panel" id="photo-credits" aria-labelledby="creditsH">
      <h2 id="creditsH">Photo credits</h2>
      <p className="small muted" style={{ margin: 0 }}>
        Landmark photos come from Wikimedia Commons under free licences. Tap a photo&apos;s name for its source page and licence terms.
      </p>
      <ul className="small credits">
        {list.map((p) => (
          <li key={p.file}>
            <a href={p.page} target="_blank" rel="noopener noreferrer">
              {p.alt}
            </a>{" "}
            <span className="muted">
              by {p.by}, {p.license}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

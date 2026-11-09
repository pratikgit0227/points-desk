import { applyLinkFor } from "@/lib/data";

/** "Apply" link to the bank's page. Renders nothing for closed or invite-only cards. */
export function ApplyLink({ cardKey, bank, compact }: { cardKey: string; bank: string; compact?: boolean }) {
  const link = applyLinkFor(cardKey);
  if (!link) return null;
  return (
    <a
      className={compact ? "small" : "btn"}
      href={link.href}
      target="_blank"
      rel={(link.aff ? "sponsored " : "") + "noopener noreferrer"}
      title={link.aff ? "Affiliate link" : `Opens ${bank}'s own page`}
    >
      {compact ? "Apply ↗" : `Apply on ${bank.replace(" Bank", "")}'s site ↗`}
      {link.aff && "*"}
    </a>
  );
}

/** One line saying whether the links on screen earn anything. */
export function ApplyNote({ keys }: { keys: string[] }) {
  const links = keys.map(applyLinkFor).filter((l) => l !== undefined);
  if (links.length === 0) return null;
  return links.some((l) => l.aff) ? (
    <>Some apply links (marked *) are affiliate links: Suite &amp; Seat may earn a fee if you&apos;re approved. It never changes the rankings.</>
  ) : (
    <>Apply links go to the bank&apos;s own page. Suite &amp; Seat earns nothing from them.</>
  );
}

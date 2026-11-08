/** One headline number on a card or destination page. */
export function Fact({ label, value, note, warn }: { label: string; value: string; note?: string; warn?: boolean }) {
  return (
    <div className="fact">
      <div className="eyebrow">{label}</div>
      <div className={"fact-v" + (warn ? " warn" : "")}>{value}</div>
      {note && <div className="small muted">{note}</div>}
    </div>
  );
}

import Link from "next/link";
import { Icon, type IconName } from "./Icons";

const STEPS: { icon: IconName; title: string; body: string; href: string; cta: string }[] = [
  { icon: "card", title: "Add your cards", body: "Pick your cards and type your points balances. We show what they're worth with every airline and hotel partner.", href: "#mineH", cta: "Add cards" },
  { icon: "plane", title: "Pick a trip", body: "Choose where you're going. We compare paying cash with every points route and say which is better, in rupees.", href: "/plan", cta: "Plan a trip" },
  { icon: "pin", title: "Book, and we keep checking", body: "Watch a plan, or add a flight you've already booked. We tell you if prices, ratios or rules change, or if rebooking would save money.", href: "/plan#booked", cta: "Track a booking" },
];

/** Three-step explainer for the home page. */
export function HowItWorks() {
  return (
    <section className="steps3" aria-labelledby="howH">
      <h2 id="howH" className="sr-only">
        How it works
      </h2>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="steps3-ico">
              <Icon name={s.icon} size={20} />
            </span>
            <div>
              <div className="p101-n">Step {i + 1}</div>
              <h3>{s.title}</h3>
              <p className="small muted">{s.body}</p>
              <Link href={s.href} className="small">
                {s.cta} →
              </Link>
            </div>
          </li>
        ))}
      </ol>
      <p className="small muted" style={{ margin: 0 }}>
        Questions about money, privacy or how fresh the data is? <Link href="/learn#faq">Read the FAQ</Link>.
      </p>
    </section>
  );
}

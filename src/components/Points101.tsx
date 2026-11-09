import Link from "next/link";
import { Icon, type IconName } from "./Icons";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "card", title: "Your card earns points", body: "Every spend earns reward points (Axis calls them EDGE Miles, HDFC calls them Reward Points). On their own they're worth little: often ₹0.20–1 each." },
  { icon: "plane", title: "Move them to an airline or hotel", body: "Banks let you move (transfer) points to airline and hotel programmes like Air India or KrisFlyer, often 1 : 1 or 1 : 2. That's where they're worth the most: ₹1–3 each." },
  { icon: "pin", title: "Find the seat before you move anything", body: "Airlines release only a few seats at points prices. Search the airline's site for your date first. A transfer can't be undone, so never move points 'just in case'." },
  { icon: "bag", title: "You still pay taxes, and check the bags", body: "A points ticket isn't free: airport taxes and fees are paid in cash, often ₹3,000–10,000. Check what bags the ticket includes, especially on cheap fares." },
  { icon: "bed", title: "Compare with paying cash", body: "If a ₹15,000 ticket costs 20,000 points, each point is worth ₹0.75: not great. Our planner does this maths for you and says when cash is smarter." },
];

/** Five-step starter for people new to card points. */
export function Points101() {
  return (
    <section className="panel deco deco-plane" id="points-101" aria-labelledby="p101H">
      <h2 id="p101H" className="with-icon">
        <Icon name="plane" size={20} /> New to points? Start here
      </h2>
      <p className="small muted" style={{ margin: 0 }}>
        Five things to know before your first points trip. Takes two minutes.
      </p>
      <ol className="p101">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="p101-ico">
              <Icon name={s.icon} size={22} />
            </span>
            <div>
              <div className="p101-n">Step {i + 1}</div>
              <h3>{s.title}</h3>
              <p className="small muted">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="small" style={{ margin: 0 }}>
        Ready? <Link href="/plan">Plan a trip</Link>: pick where you&apos;re going and we&apos;ll say which card to use, in plain words.
      </p>
    </section>
  );
}

import { DATA_CHECKED } from "@/lib/data";
import { longDate } from "@/lib/format";

/** Plain answers to the doubts people have before trusting the site. Also emitted as FAQPage structured data. */
export function faqItems(): { q: string; a: string }[] {
  return [
    {
      q: "Is Suite & Seat free? How does it make money?",
      a: "It's free, with no sign-up. Aviasales fare links (marked *) carry a Travelpayouts referral code, so the site may earn a small fee if you book through them. Card apply links may become affiliate links too, and will be marked * when they do. Neither changes any ranking or value: cards are ranked only by what your points are worth.",
    },
    {
      q: "Where is my data kept? Do I need to log in?",
      a: "There's no login. Your cards, balances, point values, trip plans and booked flights are saved in your browser only; clearing your browser data removes them. When you check a cash fare, only the route and date go to our server and Travelpayouts to look up prices, nothing about you. Page visits are counted anonymously (Vercel Web Analytics, no cookies).",
    },
    {
      q: "How fresh are the transfer ratios and award prices?",
      a: `Ratios and card facts were last fully re-checked on ${longDate(DATA_CHECKED)}. The bank and programme pages behind them are checked automatically every day, and the data is updated, with a source, when they change. Every change is listed with its date on the Changes page. Banks can change ratios overnight, so check the bank's site just before you transfer.`,
    },
    {
      q: "Do you book flights or transfer points for me?",
      a: "No. Suite & Seat only does the maths and links you to the bank, airline or fare site. You make every transfer and booking yourself, so nothing happens without you.",
    },
    {
      q: "What if the award price changes after I transfer?",
      a: "Points transfers can't be undone, and airlines change prices and seat availability without notice. Always find the seat on the airline's site first, then transfer only what you need, then book straight away. Watch a saved plan to get an alert here if an award price, ratio or rule changes.",
    },
    {
      q: "I've already booked. Will you rebook it if the price drops?",
      a: "No, but we'll tell you. Add the flight under \"Trips you already booked\" on Plan a trip. Once a day, when you open the site, we check the cheapest cash fare for the same route and day, and the points price, and show when rebooking would save at least ₹500 a person after your cancellation fee. Fares come from recent searches on Aviasales, not a live price, so check before you rebook.",
    },
    {
      q: "Why is a point worth a different amount for me?",
      a: "Each point's value depends on how you'd use it. The defaults come from published award prices against typical cash fares, but you can set your own value for every programme on the Learn page (\"Edit what a partner point is worth to you\"). Every ranking and suggestion on the site then uses your numbers.",
    },
  ];
}

export function Faq() {
  const items = faqItems();
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <section className="panel" id="faq" aria-labelledby="faqH">
      <h2 id="faqH">Questions people ask</h2>
      <div className="faq">
        {items.map((i) => (
          <details key={i.q}>
            <summary>{i.q}</summary>
            <p className="small">{i.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\u003c") }} />
    </section>
  );
}

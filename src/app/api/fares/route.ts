import { z } from "zod";
import { cheapestFares, FARES_ENABLED } from "@/lib/server/fares";
import { rateLimit } from "@/lib/server/rate-limit";

const query = z.object({
  from: z.string().regex(/^[A-Z]{3}$/, "from must be an airport code"),
  to: z.string().regex(/^[A-Z]{3}$/, "to must be an airport code"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
});

/** GET ?from=DEL&to=KWI&date=2027-01-15 → cheapest recent economy fares. 501 when no token is set. */
export async function GET(request: Request) {
  if (!FARES_ENABLED) return Response.json({ error: "Fare lookup isn't set up." }, { status: 501 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit("fares:" + ip, 30)) return Response.json({ error: "Too many requests. Wait a minute." }, { status: 429 });

  const url = new URL(request.url);
  const parsed = query.safeParse({
    from: url.searchParams.get("from")?.toUpperCase(),
    to: url.searchParams.get("to")?.toUpperCase(),
    date: url.searchParams.get("date"),
  });
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  try {
    const { from, to, date } = parsed.data;
    const result = await cheapestFares(from, to, date);
    return Response.json(result);
  } catch (err) {
    console.error("[fares] lookup failed", err);
    return Response.json({ error: "Couldn't load fares right now." }, { status: 502 });
  }
}

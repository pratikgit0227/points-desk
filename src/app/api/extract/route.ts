import { z } from "zod";
import { extractBalances, MAX_TEXT_CHARS } from "@/lib/server/extract";
import { rateLimit } from "@/lib/server/rate-limit";

const bodySchema = z.object({
  text: z.string().trim().min(1, "Paste some text first.").max(MAX_TEXT_CHARS, "That text is too long. Paste just the part with the balance."),
});

/** POST { text } → { balances: FoundBalance[] } */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) {
    return Response.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON with a \"text\" field." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  try {
    const balances = await extractBalances([parsed.data.text]);
    return Response.json({ balances });
  } catch (err) {
    console.error("[extract] failed", err);
    return Response.json({ error: "Couldn't read the text right now. Try again, or type the balance into the card." }, { status: 502 });
  }
}

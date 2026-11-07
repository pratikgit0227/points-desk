import { generateText, Output } from "ai";
import { z } from "zod";
import { PROGRAMS } from "@/lib/data";
import type { FoundBalance } from "@/lib/calc";

/** Model used to read balances, through the Vercel AI Gateway. */
export const EXTRACT_MODEL = process.env.EXTRACT_MODEL || "anthropic/claude-haiku-5.5";

export const MAX_TEXT_CHARS = 20000;

const balanceSchema = z.object({
  balances: z.array(
    z.object({
      program: z.string().describe("Program key from the list, or \"other\""),
      balance: z.number().nonnegative(),
      asOf: z.string().describe("YYYY-MM-DD, or empty string"),
      subject: z.string().describe("Email subject or SMS sender, or empty string"),
      evidence: z.string().describe("Short quote (max 100 characters) showing the balance"),
    }),
  ),
});

function buildPrompt(texts: string[]): string {
  const list = PROGRAMS.map((p) => `- ${p.key}: ${p.bank} ${p.card} (${p.unit})`).join("\n");
  return `You read Indian bank and credit-card emails and SMS and pull out the cardholder's CURRENT reward-point balances.
Programs (key: description):
${list}
Rules: only a stated balance (closing, available, or total balance), never points earned on one transaction. If several messages give a balance for the same program, keep the most recent. An Axis message that says "EDGE Miles" is axis_atlas unless it names another card. If an Axis message gives EDGE Reward points without naming Magnus or Magnus for Burgundy, use program "other". Numbers use Indian commas; return plain numbers. Return an empty list if no balance is stated.

MESSAGES:
${texts.join("\n\n-----\n\n")}`;
}

/** Read reward-point balances out of email or SMS text. Unknown programs are dropped. */
export async function extractBalances(texts: string[]): Promise<FoundBalance[]> {
  const { output } = await generateText({
    model: EXTRACT_MODEL,
    output: Output.object({ schema: balanceSchema }),
    prompt: buildPrompt(texts),
  });
  const known = new Set(PROGRAMS.map((p) => p.key));
  return output.balances
    .filter((x) => known.has(x.program) && Number.isFinite(x.balance))
    .map((x) => ({
      program: x.program,
      balance: Math.round(x.balance),
      asOf: /^\d{4}-\d{2}-\d{2}$/.test(x.asOf) ? x.asOf : "",
      subject: x.subject.slice(0, 140),
      evidence: x.evidence.slice(0, 140),
    }));
}

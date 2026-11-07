import { connection } from "next/server";

/** Liveness check; also reports whether the AI endpoint is configured. */
export async function GET() {
  await connection();
  const aiConfigured = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
  return Response.json({ ok: true, aiConfigured });
}

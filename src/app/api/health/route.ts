import { connection } from "next/server";
import { AI_ENABLED } from "@/lib/server/extract";
import { FARES_ENABLED } from "@/lib/server/fares";

/** Liveness check; also reports which optional features are switched on. */
export async function GET() {
  await connection();
  return Response.json({ ok: true, aiEnabled: AI_ENABLED, faresEnabled: FARES_ENABLED });
}

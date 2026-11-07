import { connection } from "next/server";
import { AI_ENABLED } from "@/lib/server/extract";

/** Liveness check; also reports whether the optional AI reader is switched on. */
export async function GET() {
  await connection();
  return Response.json({ ok: true, aiEnabled: AI_ENABLED });
}

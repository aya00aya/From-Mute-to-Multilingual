import { NextResponse } from "next/server";
import { auditLog } from "@/lib/store";
import { CONSENT_VERSION } from "@/lib/consent";

// Records consent BEFORE any voice processing. Server stamps the time; never trust the client clock.
export async function POST(req: Request) {
  const { userId, roomId, scope } = await req.json();
  if (!userId || !roomId || !Array.isArray(scope) || !scope.includes("processing"))
    return NextResponse.json({ error: "Processing consent required" }, { status: 400 });
  const record = {
    userId, roomId, scope, version: CONSENT_VERSION,
    timestamp: new Date().toISOString(), event: "consent_granted",
  };
  auditLog.push(record);
  return NextResponse.json({ ok: true, record });
}

import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { auditLog } from "@/lib/store";

// Issues a LiveKit join token. In translation mode we REFUSE to issue one
// unless a server-side consent record exists, so consent gates the whole pipeline.
export async function POST(req: Request) {
  const { roomId, userId, name, lang, mode, isHost } = await req.json();
  if (!roomId || !userId || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  if (mode === "translation") {
    const consented = auditLog.some(
      (r) => r.userId === userId && r.roomId === roomId && r.event === "consent_granted" && r.scope.includes("processing")
    );
    if (!consented) return NextResponse.json({ error: "Consent required" }, { status: 403 });
  }

    const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
    identity: userId,
    name,
    ttl: "10m",
    nbf: Math.floor(Date.now() / 1000) - 30, // Tolerates minor clock drift
    attributes: { lang: String(lang), mode: String(mode), role: isHost ? "host" : "guest" },
  });
  
  at.addGrant({ room: roomId, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });

  at.roomConfig = {
    agents: [{
      agentName: "YOUR-AGENT-NAME-HERE", // <--- PASTE THE NAME HERE (keep the quotes)
      metadata: JSON.stringify({ targetLang: lang })
    }]
  };
  
  return NextResponse.json({ token: await at.toJwt(), url: process.env.LIVEKIT_URL });
}

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
    ttl: "10m", // Changed from 2h to 10m. LiveKit rejects tokens longer than 10 minutes by default.
    attributes: { lang: String(lang), mode: String(mode), role: isHost ? "host" : "guest" },
  });
  
  at.addGrant({ room: roomId, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });

  // This tells LiveKit to send your Python Translation Agent into the room
 // at.roomConfig = {
  //   agents: [{
  //     agentName: "my-translator-agent",
  //     metadata: JSON.stringify({ targetLang: lang })
  //   }]
  // };
  // NOTE: "isHost" comes from the client. Fine for a demo; for production,
  // store the host's identity at room creation and verify it here.
  return NextResponse.json({ token: await at.toJwt(), url: process.env.LIVEKIT_URL });
}

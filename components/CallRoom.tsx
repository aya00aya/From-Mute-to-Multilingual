"use client";
import { useEffect, useMemo, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { ExternalE2EEKeyProvider, Room } from "livekit-client";
import { CallStage } from "./CallStage";
import type { LangCode } from "@/lib/languages";

type Props = {
  token: string; url: string; code: string; name: string; lang: LangCode;
  mode: "e2ee" | "translation"; scope: string[]; e2eeKey?: string; onLeave: () => void;
};

export default function CallRoom(p: Props) {
  const [ready, setReady] = useState(p.mode !== "e2ee");

  // Create the Room once. In E2EE mode, frames are encrypted in a Web Worker
  // using a key LiveKit's server never sees.
  const { room, keyProvider } = useMemo(() => {
    const keyProvider = new ExternalE2EEKeyProvider();
    const e2ee =
      p.mode === "e2ee"
        ? { keyProvider, worker: new Worker(new URL("livekit-client/e2ee-worker", import.meta.url)) }
        : undefined;
    return { keyProvider, room: new Room({ e2ee, adaptiveStream: true, dynacast: true }) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.mode]);

  // Set the key BEFORE connecting, otherwise early frames can't be decrypted.
  useEffect(() => {
    if (p.mode !== "e2ee" || !p.e2eeKey) return;
       keyProvider.setKey(p.e2eeKey).then(() => room.setE2EEEnabled(true)).then(() => setReady(true)).catch((err) => alert("E2EE Error: " + err.message));
  }, [p.mode, p.e2eeKey, keyProvider, room]);

  return (
         <LiveKitRoom room={room} token={p.token} serverUrl={p.url} connect={ready} audio video 
        onDisconnected={(reason) => { alert("Disconnected. Reason: " + reason); p.onLeave(); }} 
        onError={(error) => { alert("LiveKit Connection Error: " + error.message); }}
        data-lk-theme="default">
      <CallStage
        code={p.code} name={p.name} lang={p.lang} mode={p.mode}
        captionsAllowed={p.mode === "translation" && p.scope.includes("processing")}
        onLeave={() => { room.disconnect(); p.onLeave(); }}
      />
    </LiveKitRoom>
  );
}

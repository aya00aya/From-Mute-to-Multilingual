"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import { Caption, CAPTION_TOPIC, SPEECH_LOCALES } from "@/lib/captions";
import type { LangCode } from "@/lib/languages";

/**
 * Receives captions from everyone (data channel) and, if allowed, produces
 * captions for the local speaker.
 *
 * TEMPORARY (M2): uses the browser's Web Speech API so you see captions with no
 * API keys. Chrome/Edge only, and it sends your audio to the browser vendor's
 * speech service. So it runs ONLY in translation mode, after consent, while your
 * mic is on. In Milestone 3 the server worker (Deepgram) replaces it.
 */
export function useCaptions(opts: { enabled: boolean; lang: LangCode; name: string }) {
  const room = useRoomContext();
  const [latest, setLatest] = useState<Record<string, Caption>>({}); // newest line per speaker
  const seq = useRef(0);

  const put = useCallback((c: Caption) => setLatest((p) => ({ ...p, [c.speakerId]: c })), []);

  // Incoming captions from other people.
  useDataChannel(CAPTION_TOPIC, (msg) => {
    try {
      put(JSON.parse(new TextDecoder().decode(msg.payload)));
    } catch {}
  });

  // Outgoing captions from my mic.
  useEffect(() => {
    if (!opts.enabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return; // unsupported browser: no local captions, still receives others'
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = SPEECH_LOCALES[opts.lang];
    let stopped = false;

    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const cap: Caption = {
          id: `${room.localParticipant.identity}-${seq.current}`,
          speakerId: room.localParticipant.identity,
          speakerName: opts.name,
          lang: opts.lang,
          text: r[0].transcript.trim(),
          final: r.isFinal,
          at: Date.now(),
        };
        if (r.isFinal) seq.current++;
        put(cap); // data messages aren't echoed back to the sender
        room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(cap)), {
          reliable: r.isFinal, // interim = lossy/fast, final = reliable
          topic: CAPTION_TOPIC,
        });
      }
    };
    rec.onend = () => {
      if (!stopped) try { rec.start(); } catch {} // keep listening
    };
    try { rec.start(); } catch {}
    return () => { stopped = true; rec.stop(); };
  }, [opts.enabled, opts.lang, opts.name, room, put]);

  // Drop lines that have been quiet for 7 seconds.
  useEffect(() => {
    const t = setInterval(
      () => setLatest((p) => Object.fromEntries(Object.entries(p).filter(([, c]) => Date.now() - c.at < 7000))),
      1000
    );
    return () => clearInterval(t);
  }, []);

  return Object.values(latest).sort((a, b) => a.at - b.at);
}

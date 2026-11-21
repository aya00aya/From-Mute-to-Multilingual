"use client";
import { RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react";
import { ParticipantGrid } from "./ParticipantGrid";
import { ControlBar } from "./ControlBar";
import { ModeBadge } from "./ModeBadge";
import { useCaptions } from "./useCaptions";
import { LANGUAGES, LangCode } from "@/lib/languages";

export function CallStage(props: {
  code: string; name: string; lang: LangCode; mode: "e2ee" | "translation";
  captionsAllowed: boolean; onLeave: () => void;
}) {
  const { isMicrophoneEnabled } = useLocalParticipant();
  // Captions run only in translation mode, with consent, while the mic is on.
  const captions = useCaptions({ enabled: props.captionsAllowed && isMicrophoneEnabled, lang: props.lang, name: props.name });

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 p-4">
        <h1 className="text-lg font-semibold">Room <code className="text-indigo-300">{props.code}</code></h1>
        <ModeBadge mode={props.mode} />
      </header>

      <ParticipantGrid />

      {/* Captions: show what I understand best. Translations arrive in M3. */}
      <section aria-live="polite" aria-label="Live captions" className="mx-auto w-full max-w-4xl space-y-2 px-4">
        {props.mode === "e2ee" && (
          <p className="text-center text-sm text-emerald-300">Captions are off in Direct E2EE mode: they would require a service to hear your audio.</p>
        )}
        {captions.slice(-3).map((c) => {
          const mine = c.lang === props.lang;
          const translated = c.translations?.[props.lang];
          const flag = LANGUAGES.find((l) => l.code === c.lang)?.flag;
          return (
            <div key={c.speakerId} className="rounded-xl bg-black/60 px-5 py-3 backdrop-blur">
              <p className="text-xs text-slate-400">{c.speakerName} {flag}</p>
              <p className={`text-2xl font-medium leading-snug ${c.final ? "" : "opacity-70"}`}>{mine ? c.text : translated ?? c.text}</p>
              {!mine && translated && <p className="text-sm text-slate-400">{c.text}</p>}
              {!mine && !translated && <p className="text-xs text-amber-300">Original language. Translation arrives in Milestone 3.</p>}
            </div>
          );
        })}
      </section>

      <ControlBar onLeave={props.onLeave} />
      {/* Plays everyone's audio. In M3 we mute the raw host audio for listeners and play the translated track instead. */}
      {/* <RoomAudioRenderer /> */}
    </main>
  );
}

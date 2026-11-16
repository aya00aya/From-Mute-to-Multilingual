"use client";
import { useTracks, VideoTrack, isTrackReference, useIsSpeaking, useIsMuted, TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { Track } from "livekit-client";
import { MicOff } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";

function Tile({ trackRef }: { trackRef: TrackReferenceOrPlaceholder }) {
  const p = trackRef.participant;
  const speaking = useIsSpeaking(p);
  const micMuted = useIsMuted(Track.Source.Microphone, { participant: p });
  const lang = LANGUAGES.find((l) => l.code === p.attributes?.lang);
  const isHost = p.attributes?.role === "host";

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl bg-slate-800 transition-all duration-200 ${
        speaking ? "ring-4 ring-indigo-400 shadow-lg shadow-indigo-500/30" : "ring-1 ring-white/10"
      }`}
    >
      {isTrackReference(trackRef) && !trackRef.publication.isMuted ? (
        <VideoTrack trackRef={trackRef} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-indigo-500/20 text-3xl font-semibold text-indigo-200">
            {(p.name || "?").slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white">
        <span className="font-medium">
          {p.name}
          {isHost && <span className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 text-xs">Host</span>}
        </span>
        <span className="flex items-center gap-2">
          {micMuted && <MicOff size={14} aria-label="Muted" />}
          {lang && <span className="rounded-full bg-white/15 px-2 py-0.5">{lang.flag} {lang.name}</span>}
        </span>
      </div>
    </div>
  );
}

export function ParticipantGrid() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  return (
    <div className="grid flex-1 content-center gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {tracks.map((t) => <Tile key={t.participant.identity} trackRef={t} />)}
    </div>
  );
}

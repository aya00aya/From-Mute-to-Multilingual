"use client";
import { useState } from "react";
import { useLocalParticipant, useMediaDeviceSelect } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings } from "lucide-react";

function DeviceSelect({ kind, label }: { kind: "audioinput" | "videoinput"; label: string }) {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });
  return (
    <label className="block text-xs text-slate-300">
      {label}
      <select value={activeDeviceId} onChange={(e) => setActiveMediaDevice(e.target.value)} className="mt-1 w-full rounded-md bg-slate-800 p-2 text-sm text-white">
        {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || "Default"}</option>)}
      </select>
    </label>
  );
}

export function ControlBar({ onLeave }: { onLeave: () => void }) {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const [open, setOpen] = useState(false);
  const btn = "grid h-12 w-12 place-items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400";

  return (
    <div className="relative flex items-center justify-center gap-3 p-4">
      <button
        aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        className={`${btn} ${isMicrophoneEnabled ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white"}`}
      >
        {isMicrophoneEnabled ? <Mic /> : <MicOff />}
      </button>
      <button
        aria-label={isCameraEnabled ? "Turn camera off" : "Turn camera on"}
        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
        className={`${btn} ${isCameraEnabled ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-500 text-white"}`}
      >
        {isCameraEnabled ? <Video /> : <VideoOff />}
      </button>
      <button aria-label="Device settings" aria-expanded={open} onClick={() => setOpen(!open)} className={`${btn} bg-slate-700 text-white hover:bg-slate-600`}>
        <Settings />
      </button>
      <button aria-label="Leave room" onClick={onLeave} className={`${btn} w-16 bg-red-600 text-white hover:bg-red-700`}>
        <PhoneOff />
      </button>
      {open && (
        <div className="absolute bottom-20 w-72 space-y-3 rounded-xl bg-slate-900 p-4 shadow-2xl ring-1 ring-white/10">
          <DeviceSelect kind="audioinput" label="Microphone" />
          <DeviceSelect kind="videoinput" label="Camera" />
        </div>
      )}
    </div>
  );
}

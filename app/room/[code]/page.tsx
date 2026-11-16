"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { nanoid } from "nanoid";
import { LANGUAGES, LangCode } from "@/lib/languages";
import { ConsentModal } from "@/components/ConsentModal";
import { ModeBadge } from "@/components/ModeBadge";
import { makeKey, readKeyFromHash } from "@/lib/e2ee";

// LiveKit + Web Worker must only load in the browser.
const CallRoom = dynamic(() => import("@/components/CallRoom"), { ssr: false });

type Mode = "e2ee" | "translation";
type Session = { userId: string; scope: string[]; token: string; url: string };

export default function RoomJoin() {
  const { code } = useParams<{ code: string }>();
  const sp = useSearchParams();
  const isHost = sp.get("host") === "1";
  const lockedMode = sp.get("mode") as Mode | null; // guests follow the host's link

  const [name, setName] = useState("");
  const [lang, setLang] = useState<LangCode>(isHost ? "en" : "es");
  const [mode, setMode] = useState<Mode>(lockedMode ?? "translation");
  const [key, setKey] = useState("");
  const [askConsent, setAskConsent] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");

  // E2EE key: guests read it from the link fragment; the host generates it.
  useEffect(() => { setKey(readKeyFromHash() ?? (isHost ? makeKey() : "")); }, [isHost]);

  const shareUrl =
    typeof window === "undefined"
      ? ""
      : `${location.origin}/room/${code}?mode=${mode}${mode === "e2ee" && key ? `#k=${key}` : ""}`;

  const join = async (scope: string[]) => {
    setError("");
    setAskConsent(false);
    if (mode === "e2ee" && !key) return setError("This is an E2EE room. Open the host's full link (it contains the key after the #).");
    const userId = nanoid(8);
    if (mode === "translation") {
      const c = await fetch("/api/consent", { method: "POST", body: JSON.stringify({ userId, roomId: code, scope }) });
      if (!c.ok) return setError("Could not record consent.");
    }
    const res = await fetch("/api/token", { method: "POST", body: JSON.stringify({ roomId: code, userId, name, lang, mode, isHost }) });
    if (!res.ok) return setError("Could not join the room. Check your LiveKit env vars.");
    const { token, url } = await res.json();
    setSession({ userId, scope, token, url });
  };

  if (session)
    return (
      <CallRoom token={session.token} url={session.url} code={code} name={name} lang={lang}
        mode={mode} scope={session.scope} e2eeKey={key} onLeave={() => setSession(null)} />
    );

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 to-indigo-100 p-6">
      <div className="grid w-full max-w-3xl gap-8 rounded-3xl bg-white p-8 shadow-xl md:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-2xl font-bold text-slate-900">
            {isHost ? "Host a room" : "Join room"} <code className="text-indigo-600">{code}</code>
          </h1>
          <label className="block text-sm font-medium text-slate-700">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">{isHost ? "You speak (fixed)" : "I want to hear & speak in"}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {LANGUAGES.filter((l) => !isHost || l.code === "en").map((l) => (
                <button key={l.code} type="button" aria-pressed={lang === l.code} onClick={() => setLang(l.code)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    lang === l.code ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-slate-200 hover:border-indigo-300"}`}>
                  {l.flag} {l.native}
                </button>
              ))}
            </div>
          </fieldset>
          <div role="radiogroup" aria-label="Privacy mode" className="space-y-2">
            {(["translation", "e2ee"] as const).map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={mode === m} disabled={!!lockedMode && !isHost}
                  onChange={() => setMode(m)} className="accent-indigo-600" />
                {m === "translation" ? "Translation mode" : "Direct E2EE (no translation)"}
              </label>
            ))}
            {lockedMode && !isHost && <p className="text-xs text-slate-500">The host chose this mode for the room.</p>}
            <ModeBadge mode={mode} />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={!name} onClick={() => (mode === "translation" ? setAskConsent(true) : join([]))}
            className="w-full rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-40">
            Continue
          </button>
        </div>
        <div className="grid place-items-center rounded-2xl bg-slate-50 p-6 text-center">
          <QRCodeSVG value={shareUrl || "x"} size={160} />
          <p className="mt-3 text-sm text-slate-600">Scan to join as a participant</p>
          <p className="break-all text-xs text-slate-400">{shareUrl}</p>
        </div>
      </div>
      {askConsent && <ConsentModal onSubmit={join} onCancel={() => { setMode("e2ee"); setAskConsent(false); }} />}
    </main>
  );
}

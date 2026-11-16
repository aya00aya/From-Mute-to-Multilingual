"use client";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { CONSENT_ITEMS } from "@/lib/consent";

export function ConsentModal({ onSubmit, onCancel }: { onSubmit: (scope: string[]) => void; onCancel: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const required = CONSENT_ITEMS.filter((i) => !("optional" in i));
  const ok = required.every((i) => checked[i.id]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-indigo-600">
            <ShieldCheck size={22} />
          </span>
          <h2 id="consent-title" className="text-xl font-semibold text-slate-900">Before you speak</h2>
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Translation mode sends your audio to AI services. Voice cloning is optional; without it you&apos;ll be heard in a generic, clearly labeled voice.
        </p>
        <ul className="space-y-3">
          {CONSENT_ITEMS.map((i) => (
            <li key={i.id}>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-800">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-indigo-600"
                  checked={!!checked[i.id]}
                  onChange={(e) => setChecked({ ...checked, [i.id]: e.target.checked })}
                />
                <span>
                  {i.text}
                  {"optional" in i && <em className="text-slate-400"> (optional)</em>}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">
            Join without translation
          </button>
          <button
            disabled={!ok}
            onClick={() => onSubmit(CONSENT_ITEMS.filter((i) => checked[i.id]).map((i) => i.id))}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            I agree
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-400">Demo scaffold, not legal advice. Have counsel review before production.</p>
      </div>
    </div>
  );
}

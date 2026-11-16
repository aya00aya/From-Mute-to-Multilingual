import { Lock, Languages } from "lucide-react";

export function ModeBadge({ mode }: { mode: "e2ee" | "translation" }) {
  const e2ee = mode === "e2ee";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ${
        e2ee ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-amber-50 text-amber-900 ring-amber-300"
      }`}
    >
      {e2ee ? <Lock size={16} /> : <Languages size={16} />}
      {e2ee
        ? "Direct E2EE — no translation, server cannot decrypt"
        : "Translation mode — AI service processes audio; NOT end-to-end encrypted"}
    </div>
  );
}

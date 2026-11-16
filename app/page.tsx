"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe2, Mic, Video, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const create = async () => {
    const { code } = await fetch("/api/rooms", { method: "POST" }).then((r) => r.json());
    router.push(`/room/${code}?host=1`);
  };
  const features = [
    { Icon: Mic, title: "Speak naturally", text: "Host talks in English." },
    { Icon: Globe2, title: "Pick a language", text: "Each listener chooses their own." },
    { Icon: Video, title: "Stay face to face", text: "Original video, translated audio." },
  ];
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100">
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-sm text-indigo-700 shadow-sm ring-1 ring-indigo-100">
            <Sparkles size={14} /> Real-time voice translation
          </span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
            From Mute to <span className="text-indigo-600">Multilingual</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Speak English. Everyone hears you in their own language, in your voice, with consent.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button onClick={create} className="rounded-xl bg-indigo-600 px-7 py-3 font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700">
              Create a room
            </button>
            <button onClick={() => router.push("/stage")} className="rounded-xl bg-slate-900 px-7 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
              Stage Demo
            </button>
          </div>
        </motion.div>
        <div className="mt-20 grid gap-4 text-left sm:grid-cols-3">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-100">
              <Icon className="text-indigo-600" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
        <footer className="mt-16 text-xs text-slate-500">
          <a href="/legal/privacy" className="underline">Privacy</a> · <a href="/legal/terms" className="underline">Terms</a> · Demo scaffold, not legal advice.
        </footer>
      </section>
    </main>
  );
}

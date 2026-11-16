import type { LangCode } from "./languages";

export type Caption = {
  id: string;
  speakerId: string;
  speakerName: string;
  lang: LangCode; // language the speaker used
  text: string; // original transcript
  final: boolean; // false = interim, still changing
  translations?: Partial<Record<LangCode, string>>; // filled by the worker in Milestone 3
  at: number;
};

export const CAPTION_TOPIC = "captions";

// Used only by the temporary browser recognizer in M2.
export const SPEECH_LOCALES: Record<LangCode, string> = {
  en: "en-US", es: "es-ES", hi: "hi-IN", de: "de-DE", ja: "ja-JP",
};

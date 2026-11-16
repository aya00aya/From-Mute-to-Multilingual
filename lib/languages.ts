export const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
] as const;
export type LangCode = (typeof LANGUAGES)[number]["code"];

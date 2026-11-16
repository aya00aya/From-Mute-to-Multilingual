// Bump this whenever the consent text changes; old records stay valid for their version.
export const CONSENT_VERSION = "2026-10-v1";

export const CONSENT_ITEMS = [
  { id: "processing", text: "I consent to my voice being processed for real-time translation." },
  { id: "cloning", text: "I consent to my voice being temporarily cloned to generate translated speech.", optional: true },
  { id: "revoke", text: "I understand I can revoke consent and delete my voice data at any time." },
  { id: "age", text: "I confirm I am 18+ or have guardian consent." },
] as const;

export type ConsentRecord = {
  userId: string;
  roomId: string;
  version: string;
  scope: string[]; // e.g. ["processing","cloning"]
  timestamp: string;
};

# Polyglot Meet — From Mute to Multilingual (Milestones 1–2)

Real-time, consent-based voice translation for video meetings. This repo contains
Milestone 1 (rooms, consent, language selection) and Milestone 2 (LiveKit call, controls,
Direct E2EE mode, captions). Translation/TTS/cloning arrive in Milestones 3–5.

## Run it
```bash
npm install
cp .env.example .env.local     # fill in LIVEKIT_* from cloud.livekit.io
npm run dev                    # http://localhost:3000
```
Phones need HTTPS for camera/mic: use `ngrok http 3000` or `npm run dev:https`.

## Notes
- `lib/store.ts` is in-memory (single Node process only). Swap for Supabase (`supabase/schema.sql`) before deploying to serverless.
- Direct E2EE mode puts the key in the URL fragment (`#k=...`); the QR code includes it, so treat it like a password.
- Translation mode is NOT end-to-end encrypted. The UI says so.
- Not legal advice. Have counsel review before production.
- Untested against a live LiveKit project; expect minor library-version drift.

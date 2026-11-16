// DEV-ONLY in-memory store. Works in one long-running Node process (npm run dev, or a single VPS).
// It will NOT work on serverless (e.g. Vercel). Replace with Supabase (see supabase/schema.sql).
import type { ConsentRecord } from "./consent";
const g = globalThis as any;
export const rooms: Map<string, { code: string; hostLang: "en"; createdAt: number }> = (g.__rooms ??= new Map());
export const auditLog: (ConsentRecord & { event: string })[] = (g.__audit ??= []);

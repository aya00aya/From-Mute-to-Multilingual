import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { rooms } from "@/lib/store";

export async function POST() {
  const code = nanoid(6).toLowerCase().replace(/[^a-z0-9]/g, "x");
  rooms.set(code, { code, hostLang: "en", createdAt: Date.now() });
  return NextResponse.json({ code });
}

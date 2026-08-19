import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/env";
import { sendDiscordAlert } from "@/lib/discord";
import { runSync } from "@/sync/run";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSync();
    revalidateTag("channels", "max");
    sendDiscordAlert(`Sync succeeded — ${result.events} events`);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    sendDiscordAlert(`Sync failed — ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

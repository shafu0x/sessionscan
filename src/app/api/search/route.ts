import { type NextRequest, NextResponse } from "next/server";

import { searchSessions } from "@/channels/queries";

const QUERY_RE = /^0x[0-9a-f]{4,66}$/i;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!QUERY_RE.test(q)) {
    return NextResponse.json([]);
  }

  const results = await searchSessions(q.toLowerCase());
  return NextResponse.json(results);
}

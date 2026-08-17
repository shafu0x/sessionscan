import "server-only";

import type { ChannelStatus } from "@/generated/prisma/client";

import type { DecodedEvent } from "./types";

/**
 * Session lifecycle (TIP-1034 channel).
 *
 *   none  --opened-->  open
 *   open  --close_requested-->  closing
 *   open  --closed-->  closed
 *   closing  --top_up-->  open
 *   closing  --close_cancelled-->  open
 *   closing  --closed-->  closed
 *   closed  --*-->  closed
 *
 * settled never changes status. top_up / close_cancelled on open stay open.
 */
export function nextSessionStatus(
  status: ChannelStatus | undefined,
  event: DecodedEvent["type"],
): ChannelStatus | undefined {
  if (status === undefined) {
    return event === "opened" ? "open" : undefined;
  }

  if (status === "closed") {
    return "closed";
  }

  switch (event) {
    case "opened":
    case "settled":
      return status;
    case "top_up":
    case "close_cancelled":
      return "open";
    case "close_requested":
      return "closing";
    case "closed":
      return "closed";
    default: {
      const exhaustive: never = event;
      throw new Error(`unhandled session event ${exhaustive}`);
    }
  }
}

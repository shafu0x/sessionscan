import { Circle, CircleCheck, Clock } from "lucide-react";

import type { Channel } from "@/channels/types";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: Channel["status"] }) {
  switch (status) {
    case "open":
      return (
        <Badge variant="secondary">
          <Circle className="size-3" aria-hidden />
          Open
        </Badge>
      );
    case "closing":
      return (
        <Badge variant="outline">
          <Clock className="size-3" aria-hidden />
          Closing
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="outline">
          <CircleCheck className="size-3" aria-hidden />
          Closed
        </Badge>
      );
    default: {
      const exhaustive: never = status;
      throw new Error(`unhandled session status ${exhaustive}`);
    }
  }
}

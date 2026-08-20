import {
  ArrowUp,
  Banknote,
  Lock,
  type LucideIcon,
  Plus,
  Timer,
  X,
} from "lucide-react";
import type { SessionEventView } from "@/channels/types";

export const EVENT_META: Record<
  SessionEventView["type"],
  { icon: LucideIcon; label: string }
> = {
  opened: { icon: Plus, label: "Opened" },
  top_up: { icon: ArrowUp, label: "Top up" },
  settled: { icon: Banknote, label: "Settled" },
  close_requested: { icon: Timer, label: "Close requested" },
  close_cancelled: { icon: X, label: "Close cancelled" },
  closed: { icon: Lock, label: "Closed" },
};

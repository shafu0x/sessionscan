"use server";

import { sendDiscordNotification } from "@/lib/discord";

export async function notifyTwitterClick() {
  sendDiscordNotification("someone clicked @shafu0x");
}

import "server-only";

import { after } from "next/server";

import { env } from "@/env";

const DISCORD_AVATAR_URL = "https://www.sessionscan.dev/icon";

function post(webhookUrl: string, content: string): void {
  if (!webhookUrl) return;

  after(async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          username: "sessionscan",
          avatar_url: DISCORD_AVATAR_URL,
        }),
      });

      if (!response.ok) {
        console.error(`Discord webhook failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Discord webhook failed:", error);
    }
  });
}

export function sendDiscordAlert(content: string): void {
  post(env.DISCORD_ALERTS_WEBHOOK_URL, content);
}

export function sendDiscordNotification(content: string): void {
  post(env.DISCORD_NOTIFICATIONS_WEBHOOK_URL, content);
}

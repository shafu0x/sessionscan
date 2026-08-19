import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "How MPP sessions work";

export default async function AboutOpengraphImage() {
  const icon = await readFile(join(process.cwd(), "public/icon.svg"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        padding: 96,
        background: "#0a0a0a",
        color: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundImage: `url(data:image/svg+xml;base64,${icon.toString("base64")})`,
            backgroundSize: "48px 48px",
          }}
        />
        <div style={{ fontSize: 40, color: "#a1a1a1" }}>SessionScan</div>
      </div>
      <div style={{ fontSize: 86, fontWeight: 600, letterSpacing: -3 }}>
        How MPP sessions work
      </div>
      <div style={{ fontSize: 36, color: "#a1a1a1", lineHeight: 1.3 }}>
        Deposit once, sign a voucher per request, settle onchain in batches
      </div>
    </div>,
    { ...size },
  );
}

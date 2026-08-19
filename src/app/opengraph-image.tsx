import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "SessionScan — Explorer for Tempo MPP sessions";

export default async function OpengraphImage() {
  const icon = await readFile(join(process.cwd(), "public/icon.svg"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: 96,
        background: "#0a0a0a",
        color: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 16,
            backgroundImage: `url(data:image/svg+xml;base64,${icon.toString("base64")})`,
            backgroundSize: "104px 104px",
          }}
        />
        <div
          style={{
            fontSize: 104,
            fontWeight: 600,
            letterSpacing: -4,
            marginLeft: 4,
          }}
        >
          essionScan
        </div>
      </div>
      <div style={{ fontSize: 40, color: "#a1a1a1" }}>
        Explorer for Tempo MPP sessions
      </div>
    </div>,
    { ...size },
  );
}

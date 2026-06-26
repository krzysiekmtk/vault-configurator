import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vault Configurator — Build your perfect Obsidian vault in minutes";

// Dynamically rendered social preview image.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(900px 500px at 12% -10%, rgba(124,92,255,0.35), transparent 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#2a2350",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            📦
          </div>
          <div style={{ fontSize: 30, color: "#8a8aa0" }}>Vault Configurator</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          Build your perfect Obsidian vault in minutes.
        </div>
        <div style={{ fontSize: 30, color: "#4cffbf", marginTop: 32 }}>
          Configure → preview → download ZIP → copy Claude Code prompt
        </div>
      </div>
    ),
    { ...size },
  );
}

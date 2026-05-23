import { ImageResponse } from "next/og";

export const alt = "Jay Hemnani, an engineer who ships agentic systems into production";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf7f0",
          color: "#1a1814",
          padding: "70px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 2,
            color: "#6e6759",
            textTransform: "uppercase",
          }}
        >
          <span>Vol. IV · No. 26</span>
          <span>jayhemnani.me</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 150, lineHeight: 1, letterSpacing: -5 }}>
            <span>Jay&nbsp;</span>
            <span style={{ color: "#b5471f" }}>Hemnani.</span>
          </div>
          <div style={{ display: "flex", fontSize: 42, marginTop: 28, color: "#2c2924" }}>
            Forward Deployed Engineer · Data &amp; AI
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#6e6759" }}>
            Agentic systems, shipped into production.
          </div>
          <div style={{ display: "flex", width: 120, height: 8, background: "#b5471f" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}

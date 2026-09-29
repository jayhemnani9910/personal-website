import { ImageResponse } from "next/og";
import { RESUME } from "@/data/resume";

export const alt = "Jay Hemnani, an engineer who ships agentic systems into production";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The site's own two families and its dark-theme values from globals.css.
const BG = "#0B0C0F";
const TEXT = "#EDEFF3";
const MUTE = "#98A0AC";
const FAINT = "#7E8694";
const ACCENT = "#F4D53A";

async function loadGoogleFont(font: string, weight: number, text: string) {
  const family = `${font.replace(/ /g, "+")}:wght@${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const cssRes = await fetch(url);
  if (!cssRes.ok) throw new Error(`Failed to load font ${font}: ${cssRes.status}`);
  const css = await cssRes.text();
  const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!resource) throw new Error(`Failed to load font ${font}`);
  const fontRes = await fetch(resource[1]);
  if (!fontRes.ok) throw new Error(`Failed to load font ${font}: ${fontRes.status}`);
  return await fontRes.arrayBuffer();
}

export default async function OpengraphImage() {
  const title = "Jay Hemnani.";
  // Written in capitals rather than text-transformed: the font is subset to
  // exactly these characters, so the subset has to match what is drawn.
  const kicker = "PORTFOLIO";
  const url = "JAYHEMNANI.IN";
  const role = RESUME.tagline;
  const tagline = "Agentic systems, shipped into production.";

  const [sans, mono] = await Promise.all([
    loadGoogleFont("Instrument Sans", 500, title + role),
    loadGoogleFont("Geist Mono", 500, kicker + url + tagline),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: TEXT,
          padding: "70px 80px",
          fontFamily: "Geist Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 2,
            color: FAINT,
          }}
        >
          <span>{kicker}</span>
          <span>{url}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: -5,
              fontFamily: "Instrument Sans",
              color: TEXT,
            }}
          >
            <span>{title}</span>
          </div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 30, color: MUTE, fontFamily: "Instrument Sans" }}>
            {role}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: FAINT }}>
            {tagline}
          </div>
          <div style={{ display: "flex", width: 120, height: 8, background: ACCENT }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Sans", data: sans, style: "normal", weight: 500 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 500 },
      ],
    }
  );
}

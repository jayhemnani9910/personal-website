import { ImageResponse } from "next/og";
import { RESUME } from "@/data/resume";

export const alt = "Jay Hemnani, an engineer who ships agentic systems into production";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The site's own families and its Desk values from globals.css: paper, ink,
// ink-2, muted, tomato, and the six dot colours.
const BG = "#f3ede2";
const TEXT = "#1d1a16";
const MUTE = "#3c362e";
const FAINT = "#6b6358";
const ACCENT = "#e8553a";
const BUTTER = "#ffd84d";
const DOTS = [ACCENT, BUTTER, "#7cc3e8", "#9ed39a", "#c9a6f0", "#f6a6c1"];

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
  const title = "Jay Hemnani";
  // The font is subset to exactly these characters, so the subset has to
  // match what is drawn.
  const kicker = "/portfolio";
  const url = "jayhemnani.in";
  const role = RESUME.tagline;
  const tagline = "Agentic systems, shipped into production.";
  // The half of the tagline that sits on a butter highlight, as titles do on the site.
  const cut = tagline.indexOf("shipped");

  const [heavy, sans, mono] = await Promise.all([
    loadGoogleFont("Bricolage Grotesque", 800, `${title}.`),
    loadGoogleFont("Bricolage Grotesque", 500, role),
    loadGoogleFont("JetBrains Mono", 500, kicker + url + tagline),
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
          fontFamily: "JetBrains Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
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
              letterSpacing: -6,
              fontFamily: "Bricolage Grotesque",
              fontWeight: 800,
              color: TEXT,
            }}
          >
            <span>{title}</span>
            <span style={{ color: ACCENT }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 30, color: MUTE, fontFamily: "Bricolage Grotesque", fontWeight: 500 }}>
            {role}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: FAINT }}>
            <span>{tagline.slice(0, cut)}</span>
            <span style={{ marginLeft: 14, background: BUTTER, color: MUTE, padding: "0 8px", borderRadius: 6 }}>{tagline.slice(cut)}</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {DOTS.map((c) => (
              <div key={c} style={{ display: "flex", width: 30, height: 30, borderRadius: 15, background: c, border: `3px solid ${TEXT}` }} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage Grotesque", data: heavy, style: "normal", weight: 800 },
        { name: "Bricolage Grotesque", data: sans, style: "normal", weight: 500 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
      ],
    }
  );
}

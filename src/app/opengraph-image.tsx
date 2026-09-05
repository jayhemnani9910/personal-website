import { ImageResponse } from "next/og";

export const alt = "Jay Hemnani, an engineer who ships agentic systems into production";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(font: string, weight: number, text: string) {
  const family = `${font.replace(/ /g, "+")}:wght@${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!resource) throw new Error(`Failed to load font ${font}`);
  return await (await fetch(resource[1])).arrayBuffer();
}

export default async function OpengraphImage() {
  const title = "Jay Hemnani.";
  const url = "jayhemnani.in";
  const role = "Forward Deployed Engineer · Data & AI";
  const tagline = "Agentic systems, shipped into production.";

  const [newsreader, mono] = await Promise.all([
    loadGoogleFont("Newsreader", 600, title),
    loadGoogleFont("JetBrains Mono", 500, "Portfolio" + url + role + tagline),
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
          background: "#0A0B0D",
          color: "#E8ECF1",
          padding: "70px 80px",
          fontFamily: "JetBrains Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 2,
            color: "#7A8492",
            textTransform: "uppercase",
          }}
        >
          <span>Portfolio</span>
          <span>{url}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: -5,
              fontFamily: "Newsreader",
              color: "#E8ECF1",
            }}
          >
            <span>{title}</span>
          </div>
          <div style={{ display: "flex", fontSize: 38, marginTop: 30, color: "#8A94A3" }}>
            {role}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: "#7A8492" }}>
            {tagline}
          </div>
          <div style={{ display: "flex", width: 120, height: 8, background: "#FF5C2B" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader, style: "normal", weight: 600 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 500 },
      ],
    }
  );
}

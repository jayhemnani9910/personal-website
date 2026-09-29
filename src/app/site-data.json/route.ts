import { buildSiteData } from "@/lib/site-data";

// Built once at build time into a static file. WebMCPProvider fetches it only
// when the browser exposes the WebMCP API.
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await buildSiteData());
}

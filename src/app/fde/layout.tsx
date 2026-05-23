import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forward Deployed Engineer",
  description:
    "Jay Hemnani targeting Forward Deployed Engineer roles. Evidence: agentic systems, MCP protocol work, distributed systems, and the gap he is actively closing.",
};

export default function FDELayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

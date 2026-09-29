import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

const FDE_TITLE = "Forward Deployed Engineer";
const FDE_DESCRIPTION =
  "Jay Hemnani, an engineer targeting Forward Deployed Engineer (FDE) roles. Proof in agentic systems (LangGraph multi-agent), Model Context Protocol work, RAG, distributed systems, and fast 0-to-1 delivery, plus an honest plan for the customer-facing skill being built.";

export const metadata: Metadata = {
  ...pageMetadata({ title: FDE_TITLE, description: FDE_DESCRIPTION, path: "/fde", type: "profile" }),
  keywords: [
    "Forward Deployed Engineer",
    "FDE",
    "Forward Deployed Software Engineer",
    "Applied AI Engineer",
    "AI agents",
    "agentic AI",
    "Model Context Protocol",
    "MCP",
    "RAG",
    "LangGraph",
    "distributed systems",
    "full-stack engineer",
    "Jay Hemnani",
    "FDE India",
    "remote FDE",
  ],
};

export default function FDELayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

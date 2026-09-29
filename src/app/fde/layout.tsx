import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

const FDE_TITLE = "Forward Deployed Engineer";
const FDE_DESCRIPTION =
  "Jay Hemnani, open to Forward Deployed Engineer (FDE) roles. Proof in LangGraph multi-agent systems, Model Context Protocol work, RAG, and distributed systems.";

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

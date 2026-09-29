import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

// The route's metadata. It lives here from when /lab/page.tsx was a client
// component (which cannot export metadata); only the tablist (LabTabs) is
// client code now. Same split /fde uses.
const LAB_TITLE = "Lab";
const LAB_DESCRIPTION =
  "Things Jay Hemnani is building, exploring, and keeping an eye on. Half-finished on purpose, shown anyway.";

export const metadata: Metadata = pageMetadata({ title: LAB_TITLE, description: LAB_DESCRIPTION, path: "/lab" });

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

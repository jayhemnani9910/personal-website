import type { Metadata } from "next";
import { HomeV4 } from "@/components/home/HomeV4";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

// HomeV4 reads the content itself, so the counts it needs stay next to the
// markup that interpolates them rather than being threaded through here.
export default function Home() {
  return <HomeV4 />;
}

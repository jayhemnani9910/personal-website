import type { Metadata } from "next";
import { HomeDesk } from "@/components/home-desk/HomeDesk";
import { PROFILE_PAGE, jsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(PROFILE_PAGE) }} />
      <HomeDesk />
    </>
  );
}

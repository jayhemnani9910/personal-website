import type { Metadata } from "next";
import { EditorialHome } from "@/components/EditorialHome";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default function Home() {
  return <EditorialHome />;
}

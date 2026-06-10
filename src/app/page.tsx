import type { Metadata } from "next";
import { EditorialHome } from "@/components/EditorialHome";
import { getAllProjects, getAllPosts } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Home() {
  const [projects, posts] = await Promise.all([getAllProjects(), getAllPosts()]);
  const projectCount = projects.length;
  const deepDiveCount = projects.filter((p) => p.deepDive).length;
  const essayCount = posts.length;
  return (
    <EditorialHome
      projectCount={projectCount}
      deepDiveCount={deepDiveCount}
      essayCount={essayCount}
    />
  );
}

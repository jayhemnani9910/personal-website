import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ResumeTimeline } from "@/components/ResumeTimeline";
import { AcademicsSection } from "@/components/AcademicsSection";
import { BentoGrid } from "@/components/BentoGrid";
import { CourseworkSection } from "@/components/CourseworkSection";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import { getProjectSummaries } from "@/lib/content";

export default async function Home() {
  const projects = await getProjectSummaries();

  // Calculate stats from projects
  const stats = {
    projects: projects.length,
    technologies: new Set(projects.flatMap((p) => p.tech)).size,
    domains: new Set(projects.map((p) => p.domain)).size,
  };

  return (
    <main id="main-content" className="relative min-h-screen flex flex-col">
      <Navbar />
      <Hero stats={stats} />
      <ResumeTimeline />
      <AcademicsSection />
      <BentoGrid projects={projects} />
      <CourseworkSection />
      <Contact />
      <Footer />
    </main>
  );
}

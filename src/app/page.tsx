import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProjectDNAStrip } from "@/components/ProjectDNAStrip";
import { ResumeTimeline } from "@/components/ResumeTimeline";
import { BentoGrid } from "@/components/BentoGrid";
import { Testimonials } from "@/components/Testimonials";
import { LabSection } from "@/components/LabSection";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

import { getProjectSummaries } from "@/lib/content";

export default async function Home() {
  const projects = await getProjectSummaries();

  return (
    <main id="main-content" className="relative min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ProjectDNAStrip projects={projects} />
      <ResumeTimeline />
      <BentoGrid projects={projects} />
      <Testimonials />
      <LabSection />
      <Contact />
      <Footer />
    </main>
  );
}

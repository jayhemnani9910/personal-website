import { getAllProjects, getAllPosts } from "@/lib/content";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp";
import { RESUME } from "@/data/resume";
import { FEATURED, SECTIONS, LOG_NOTES, buildNav, buildReceipts } from "@/data/home";

import dynamic from "next/dynamic";

import { HomeHeader } from "./HomeHeader";
import { SectionRail } from "./SectionRail";
import { RevealSection } from "./RevealSection";
import { Hero } from "./Hero";
import { Decomposer } from "./Decomposer";
import { Proof } from "./Proof";
import { Receipts } from "./Receipts";
import { WorkTable } from "./WorkTable";
import { Method } from "./Method";
import { MethodCube } from "./MethodCube";
import { Log } from "./Log";
import { Contact } from "./Contact";
import { HomeFooter } from "./HomeFooter";

// Decorative, behind everything, and it renders nothing at all under reduced
// motion or on a machine without WebGL. Loading the shader with the rest of
// the page put it in the first-load bundle for every visitor including the
// ones who never see it, so it comes down on its own after paint instead.
const GlBackdrop = dynamic(() => import("./GlBackdrop").then((m) => m.GlBackdrop));

/**
 * Newest first, which is the order src/data/resume.ts already declares. Each
 * employer's first role is the one the log shows; the note comes from
 * LOG_NOTES, keyed by the employer name exactly as the resume spells it
 * (src/data/home.test.ts asserts those keys match in both directions, so a
 * renamed employer fails the test rather than rendering an empty line).
 *
 * `period` is optional on the Role type, so an entry without one is skipped
 * rather than rendered with an empty date column.
 */
function buildLogEntries() {
  return RESUME.experience.flatMap((org) => {
    const role = org.roles[0];
    const when = role?.period?.label;
    if (!role || !when) return [];
    return [{
      when,
      role: role.title,
      org: org.name,
      what: LOG_NOTES[org.name] ?? "",
    }];
  });
}

export async function HomeV4() {
  const [projects, posts] = await Promise.all([getAllProjects(), getAllPosts()]);

  const projectCount = projects.length;
  const essayCount = posts.length;
  const toolCount = WEBMCP_TOOL_COUNT;

  // A featured entry naming a project that no longer has a file would render a
  // link to a 404. Filtering here means deleting content can only ever shorten
  // the table.
  const ids = new Set(projects.map((p) => p.id));
  const featured = FEATURED.filter((f) => ids.has(f.id));

  return (
    <div className="relative min-h-screen bg-tr-bg text-tr-text">
      <GlBackdrop />
      <HomeHeader nav={buildNav({ projectCount, essayCount })} />
      <SectionRail steps={SECTIONS} />

      <main id="main-content" className="relative z-[1]">
        <Hero>
          <Decomposer />
        </Hero>

        <RevealSection>
          <Proof>
            <Receipts receipts={buildReceipts({ projectCount, toolCount })} />
          </Proof>
        </RevealSection>

        <RevealSection>
          <WorkTable projects={featured} total={projectCount} />
        </RevealSection>

        <RevealSection className="bg-[color-mix(in_srgb,var(--tr-surface-1)_85%,transparent)]">
          <Method>
            <MethodCube />
          </Method>
        </RevealSection>

        <RevealSection>
          <Log entries={buildLogEntries()} />
        </RevealSection>

        <RevealSection>
          <Contact />
        </RevealSection>
      </main>

      <HomeFooter toolCount={toolCount} />
    </div>
  );
}

import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectDetail";
import { FifaSoccerDSPage } from "@/components/projects/FifaSoccerDSPage";
import { SoccerVisionResearchPage } from "@/components/projects/SoccerVisionResearchPage";
import { NobelDataIntelligencePage } from "@/components/projects/NobelDataIntelligencePage";
import { StockDataPlatformPage } from "@/components/projects/StockDataPlatformPage";
import { WebCrawlerPage } from "@/components/projects/WebCrawlerPage";
import { ContextBoxPage } from "@/components/projects/ContextBoxPage";
import { DiabetesStackingPage } from "@/components/projects/DiabetesStackingPage";
import { RubiksCubePage } from "@/components/projects/RubiksCubePage";
import { SchedulingVisualizerPage } from "@/components/projects/SchedulingVisualizerPage";
import { RevoluIdeaPage } from "@/components/projects/RevoluIdeaPage";
import { ChatbotIntentsPage } from "@/components/projects/ChatbotIntentsPage";
import { WikipediaAnalysisPage } from "@/components/projects/WikipediaAnalysisPage";
import { ImmigrationDBPage } from "@/components/projects/ImmigrationDBPage";
import { BasicBankingPage } from "@/components/projects/BasicBankingPage";
import { AccurateGuesserPage } from "@/components/projects/AccurateGuesserPage";
import { KayakDistributedPage } from "@/components/projects/KayakDistributedPage";
import { AirbnbDistributedPage } from "@/components/projects/AirbnbDistributedPage";
import { WebMCPPortfolioPage } from "@/components/projects/WebMCPPortfolioPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ViewCounter } from "@/components/ViewCounter";
import { ReactionBar } from "@/components/ReactionBar";
import { notFound } from "next/navigation";

// Custom pages for specific projects
const CUSTOM_PROJECT_PAGES: Record<string, React.ComponentType<{ project: Awaited<ReturnType<typeof getProject>> & {} }>> = {
    "fifa-soccer-ds": FifaSoccerDSPage,
    "soccer-vision-research": SoccerVisionResearchPage,
    "nobel-dataintelligence": NobelDataIntelligencePage,
    "stock-data-platform": StockDataPlatformPage,
    "webcrawler": WebCrawlerPage,
    "contextbox": ContextBoxPage,
    "diabetes-stacking": DiabetesStackingPage,
    "rubiks-timer": RubiksCubePage,
    "scheduling-visualizer": SchedulingVisualizerPage,
    "revolu-idea": RevoluIdeaPage,
    "chatbot-intents": ChatbotIntentsPage,
    "wikipedia-analysis": WikipediaAnalysisPage,
    "immigration-db": ImmigrationDBPage,
    "basic-banking": BasicBankingPage,
    "accurate-guesser": AccurateGuesserPage,
    "kayak-distributed": KayakDistributedPage,
    "airbnb-distributed": AirbnbDistributedPage,
    "webmcp-portfolio": WebMCPPortfolioPage,
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    // Check if project has a custom page
    const CustomPage = CUSTOM_PROJECT_PAGES[id];
    if (CustomPage) {
        return (
            <>
                <Navbar />
                <CustomPage project={project} />
                <Footer />
            </>
        );
    }

    return (
        <>
            <ProjectDetail project={project} />
            <div className="section-wide py-10 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <ReactionBar slug={id} />
                <ViewCounter slug={id} />
            </div>
        </>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    return {
        title: project.title,
        description: project.summary,
        openGraph: {
            title: project.title,
            description: project.summary,
            type: "article",
            tags: project.tags,
        },
    };
}

export async function generateStaticParams() {
    const projects = await getAllProjects();
    return projects.map((project) => ({
        id: project.id,
    }));
}

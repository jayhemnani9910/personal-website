import { getAllProjects, getProject } from "@/lib/content";
import { ProjectDetail } from "@/components/ProjectDetail";
import { FifaSoccerDSPage } from "@/components/projects/FifaSoccerDSPage";
import { SoccerVisionResearchPage } from "@/components/projects/SoccerVisionResearchPage";
import { NobelDataIntelligencePage } from "@/components/projects/NobelDataIntelligencePage";
import { StockDataPlatformPage } from "@/components/projects/StockDataPlatformPage";
import { BarcaBrainPage } from "@/components/projects/BarcaBrainPage";
import { LaLigaLivePage } from "@/components/projects/LaLigaLivePage";
import { WebCrawlerPage } from "@/components/projects/WebCrawlerPage";
import { CrimeAnalyticsPage } from "@/components/projects/CrimeAnalyticsPage";
import { ContextBoxPage } from "@/components/projects/ContextBoxPage";
import { DiabetesStackingPage } from "@/components/projects/DiabetesStackingPage";
import { RubiksCubePage } from "@/components/projects/RubiksCubePage";
import { SchedulingVisualizerPage } from "@/components/projects/SchedulingVisualizerPage";
import { RevoluIdeaPage } from "@/components/projects/RevoluIdeaPage";
import { OptisupplyPage } from "@/components/projects/OptisupplyPage";
import { VaccineSchedulerPage } from "@/components/projects/VaccineSchedulerPage";
import { ChatbotIntentsPage } from "@/components/projects/ChatbotIntentsPage";
import { SmartWaterIoTPage } from "@/components/projects/SmartWaterIoTPage";
import { WikipediaAnalysisPage } from "@/components/projects/WikipediaAnalysisPage";
import { PatchingSecurityPage } from "@/components/projects/PatchingSecurityPage";
import { MobileConnectPage } from "@/components/projects/MobileConnectPage";
import { ImmigrationDBPage } from "@/components/projects/ImmigrationDBPage";
import { BasicBankingPage } from "@/components/projects/BasicBankingPage";
import { AccurateGuesserPage } from "@/components/projects/AccurateGuesserPage";
import { KayakDistributedPage } from "@/components/projects/KayakDistributedPage";
import { AirbnbDistributedPage } from "@/components/projects/AirbnbDistributedPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";

// Custom pages for specific projects
const CUSTOM_PROJECT_PAGES: Record<string, React.ComponentType<{ project: Awaited<ReturnType<typeof getProject>> & {} }>> = {
    "fifa-soccer-ds": FifaSoccerDSPage,
    "soccer-vision-research": SoccerVisionResearchPage,
    "nobel-dataintelligence": NobelDataIntelligencePage,
    "stock-data-platform": StockDataPlatformPage,
    "barcabrain": BarcaBrainPage,
    "laliga-live": LaLigaLivePage,
    "webcrawler": WebCrawlerPage,
    "crime-analytics": CrimeAnalyticsPage,
    "contextbox": ContextBoxPage,
    "diabetes-stacking": DiabetesStackingPage,
    "rubiks-timer": RubiksCubePage,
    "scheduling-visualizer": SchedulingVisualizerPage,
    "revolu-idea": RevoluIdeaPage,
    "optisupply": OptisupplyPage,
    "vaccine-scheduler": VaccineSchedulerPage,
    "chatbot-intents": ChatbotIntentsPage,
    "smart-water-iot": SmartWaterIoTPage,
    "wikipedia-analysis": WikipediaAnalysisPage,
    "patching-security": PatchingSecurityPage,
    "mobile-connect-suite": MobileConnectPage,
    "immigration-db": ImmigrationDBPage,
    "basic-banking": BasicBankingPage,
    "accurate-guesser": AccurateGuesserPage,
    "kayak-distributed": KayakDistributedPage,
    "airbnb-distributed": AirbnbDistributedPage,
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

    return <ProjectDetail project={project} />;
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

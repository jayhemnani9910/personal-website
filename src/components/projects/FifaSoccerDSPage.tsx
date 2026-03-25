"use client";

import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Github, ExternalLink, ChevronDown } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { CodeBlock } from "@/components/CodeBlock";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { use3DTilt } from "@/hooks/use3DTilt";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA
// =============================================================================

const PIPELINE_STAGES = [
    { label: "Video Input", desc: "MP4/RTSP", metric: "1280×720" },
    { label: "Frame Extract", desc: "OpenCV", metric: "stride 5" },
    { label: "Detection", desc: "YOLOv8n", metric: "conf 0.25" },
    { label: "Tracking", desc: "ByteTrack", metric: "Kalman + Hungarian" },
    { label: "Graph Build", desc: "Spatial", metric: "80px threshold" },
    { label: "GNN Analysis", desc: "GraphSAGE", metric: "3-class" },
];

const DEEP_DIVE_STAGES = [
    {
        number: 1, title: "Detection — YOLOv8 Nano",
        description: "Each frame is processed through YOLOv8n with a confidence threshold of 0.25. The nano variant was chosen for real-time inference speed on consumer GPUs. Detects players, ball, and referees with automatic device selection (CUDA when available).",
        codeTitle: "src/detect/infer.py",
        code: `from ultralytics import YOLO

@dataclass(slots=True)
class InferenceConfig:
    weights: str = "yolov8n.pt"
    device: str = "cuda_if_available"
    confidence: float = 0.25
    max_frames: int = 30

def load_model(config: InferenceConfig) -> YOLO:
    device = _resolve_device(config.device)
    model = YOLO(config.weights)
    model.to(device)
    return model

def run_inference(image_path, config=None, model=None):
    cfg = config or InferenceConfig()
    detector = model or load_model(cfg)
    results = detector.predict(image_path, conf=cfg.confidence, verbose=False)
    return results[0]`,
        example: 'Frame → detections with bboxes, scores, and class IDs',
        output: `[Detection(bbox=[120,340,180,520], score=0.92, class="player"),
 Detection(bbox=[540,280,560,300], score=0.87, class="ball")]`,
    },
    {
        number: 2, title: "Tracking — ByteTrack Runtime",
        description: "A Kalman filter-based tracker with Hungarian algorithm matching. Uses distance-based association with a threshold of 80px, and max_age of 15 frames for track persistence. Features ID reuse with delay to prevent collisions.",
        codeTitle: "src/track/bytetrack_runtime.py",
        code: `class ByteTrackRuntime:
    def __init__(
        self,
        min_confidence: float = 0.25,
        distance_threshold: float = 80.0,
        max_age: int = 15,
        max_track_id: int = 10000,
        id_reuse_delay: int = 30,
    ) -> None:
        self._tracks: list[_TrackState] = []
        self._id_pool: deque[int] = deque()

    def update(self, frame_id, detections) -> Tracklets:
        # Kalman predict → Hungarian match → update tracks
        predictions = [track.predict() for track in self._tracks]
        cost_matrix = # distance between predictions and detections
        track_indices, det_indices = linear_sum_assignment(cost_matrix)
        # Match, create new tracks, clean up old
        return Tracklets(frame_id=frame_id, items=outputs)`,
        example: 'Persistent IDs across frames with Kalman-smoothed bboxes',
        output: `Tracklets(frame_id=150, items=[
  Tracklet(track_id=7, bbox=[125,342,185,522], score=0.91),
  Tracklet(track_id=3, bbox=[400,200,440,380], score=0.88),
])`,
    },
    {
        number: 3, title: "Graph Construction",
        description: "Builds spatial interaction graphs from tracked detections using windowed frames. Nodes are tracked entities, edges connect those within an 80px distance threshold. Supports both spatial and temporal edges for cross-frame relationships.",
        codeTitle: "src/graph/build_graph.py",
        code: `from torch_geometric.data import Data
from src.track.bytetrack_runtime import Tracklets

def build_track_graph(
    track_windows: list[Tracklets],
    window: int = 30,
    distance_threshold: float = 80.0,
    include_temporal_edges: bool = True,
    max_spatial_edges: int = 1000,
):
    # Node features: bbox coordinates [x1, y1, x2, y2]
    # Edges: spatial proximity + temporal identity links
    for i, j in combinations(range(num_nodes), 2):
        dist = torch.linalg.norm(centers[i] - centers[j])
        if dist <= distance_threshold:
            edges.append([i, j])
            edges.append([j, i])

    return Data(x=node_features, edge_index=edge_index)`,
        example: 'Window of 30 frames → spatial + temporal graph',
        output: `Data(
  x=[num_tracks, 4],     # bbox features per track
  edge_index=[2, N],     # spatial + temporal edges
)`,
    },
    {
        number: 4, title: "GraphSAGE Classification",
        description: "A 2-layer GraphSAGE network classifies player interactions into 3 categories. Uses global mean pooling over node embeddings for graph-level predictions. Trained with the standard PyTorch Geometric DataLoader pipeline.",
        codeTitle: "src/models/gcn.py",
        code: `from torch_geometric.nn import SAGEConv, global_mean_pool

class GraphSAGENet(nn.Module):
    def __init__(
        self, in_channels: int = 4,
        hidden_channels: int = 64,
        num_classes: int = 3,
    ) -> None:
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        self.head = nn.Linear(hidden_channels, num_classes)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        pooled = global_mean_pool(x, batch)
        return self.head(pooled)`,
        example: 'Graph-level interaction classification (3 classes)',
        output: `logits: tensor([[-0.12, 1.45, 0.33]])
probabilities: tensor([[0.08, 0.72, 0.20]])`,
    },
];

const PIPELINE_DEMO_STEPS = [
    { stage: "Input", value: "10s clip @ 30fps", detail: "300 frames, 1280×720" },
    { stage: "Preprocess", value: "60 frames extracted", detail: "stride 5, resized" },
    { stage: "Detection", value: "YOLOv8n inference", detail: "conf ≥ 0.25" },
    { stage: "Tracking", value: "Persistent track IDs", detail: "Kalman + Hungarian" },
    { stage: "Graph", value: "Spatial interaction graph", detail: "80px distance threshold" },
    { stage: "GNN", value: "3-class predictions", detail: "GraphSAGE embeddings" },
];

const KEY_DECISIONS = [
    { title: "YOLOv8 Nano for Real-Time Speed", reasoning: "YOLOv8n provides the fastest inference for real-time video processing on consumer GPUs. Nano variant keeps latency low enough for live stream processing while maintaining usable detection accuracy.", alternatives: "Considered YOLOv8s/m/l for better accuracy, but nano was chosen to prioritize throughput and enable consumer GPU deployment." },
    { title: "ByteTrack over DeepSORT", reasoning: "Kalman filter + Hungarian algorithm matching is simpler and faster than DeepSORT's appearance-based re-ID. Distance threshold of 80px works well for soccer where players have predictable motion patterns.", alternatives: "Evaluated DeepSORT (requires separate ReID model), FairMOT (joint detection-tracking), BoT-SORT (camera motion compensation)." },
    { title: "MLflow + DVC over Managed Platforms", reasoning: "Lightweight experiment tracking without Kubernetes. MLflow tracks experiments, DVC versions data and orchestrates the 7-stage pipeline. Total cost: S3 storage only.", alternatives: "W&B (better viz but paid), Kubeflow (requires k8s cluster), SageMaker (vendor lock-in)." },
    { title: "GraphSAGE for Interaction Classification", reasoning: "Graph structure naturally captures spatial relationships between players. SAGEConv layers aggregate neighbor features through message passing, enabling 3-class interaction classification from positional data.", alternatives: "Tried positional features + Random Forest, CNN on position heatmaps. Neither captured spatial relationships between entities." },
];

const LEARNINGS = [
    "FP16 inference is essential for real-time CV on consumer GPUs — 2x speedup with <1% accuracy loss.",
    "Two-stage matching (ByteTrack) dramatically improved track continuity. Don't discard low-confidence detections.",
    "GNNs are perfect for spatial relationship modeling in sports — players' relative positions define tactics.",
    "MLflow + DVC lightweight stack worked surprisingly well for solo ML projects.",
    "Production ML is 20% model training, 80% pipeline engineering.",
    "Weekly automated retraining prevented model drift as data distribution evolved.",
];

const FUTURE_WORK = [
    "Pose estimation with SAM2 for injury risk and fatigue detection",
    "Multi-camera fusion for 3D position estimation",
    "Vision-language models for zero-shot player identification",
    "Automated highlight generation using action detection",
    "Edge deployment with INT8 quantization for mobile",
    "Pass prediction GNN for expected threat heatmaps",
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function FieldSVG() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 1000 600" fill="none" preserveAspectRatio="xMidYMid slice">
            <rect x="50" y="50" width="900" height="500" stroke="currentColor" strokeWidth="2" rx="4" />
            <line x1="500" y1="50" x2="500" y2="550" stroke="currentColor" strokeWidth="2" />
            <circle cx="500" cy="300" r="80" stroke="currentColor" strokeWidth="2" />
            <rect x="50" y="180" width="130" height="240" stroke="currentColor" strokeWidth="2" />
            <rect x="820" y="180" width="130" height="240" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

function MetricCard({ value, label, sublabel, delay = 0 }: {
    value: string; label: string; sublabel?: string; delay?: number;
}) {
    const { cardRef, rotateX, rotateY, glowX, glowY, handleMouseMove, handleMouseLeave } = use3DTilt(3);

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + delay, duration: 0.5, ease: EASINGS.apple }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            style={{ rotateX, rotateY, transformPerspective: 800, transformStyle: "preserve-3d" }}
            className="relative group/card overflow-hidden rounded-xl border p-4 transition-colors duration-300 hover:border-[var(--accent)]/40"
            data-style-bg="secondary"
        >
            <div className="absolute inset-0" style={{ background: "var(--bg-secondary)" }} />
            <motion.div
                className="absolute inset-0 opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [glowX, glowY],
                        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(var(--accent-rgb, 10, 132, 255), 0.08) 0%, transparent 60%)`
                    ),
                }}
            />
            <div className="relative z-10">
                <div className="text-2xl font-bold font-mono" style={{ color: "var(--accent)" }}>{value}</div>
                <div className="text-sm font-medium text-[var(--text-primary)] mt-1">{label}</div>
                {sublabel && <div className="text-xs text-[var(--text-muted)] mt-0.5">{sublabel}</div>}
            </div>
        </motion.div>
    );
}

function PipelineFlowDiagram() {
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % PIPELINE_STAGES.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="py-8">
            {/* Desktop: horizontal */}
            <div className="hidden md:flex items-center justify-center gap-1 lg:gap-2">
                {PIPELINE_STAGES.map((stage, i) => (
                    <div key={stage.label} className="flex items-center gap-1 lg:gap-2">
                        <motion.div
                            animate={{
                                scale: activeStage === i ? 1.05 : 1,
                                borderColor: activeStage === i ? "var(--accent)" : "var(--border)",
                            }}
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.3 }}
                            className="text-center px-3 py-3 lg:px-4 lg:py-4 rounded-xl border-2 min-w-[100px] lg:min-w-[120px] cursor-default"
                            style={{ background: activeStage === i ? "rgba(var(--accent-rgb, 10, 132, 255), 0.06)" : "var(--bg-primary)" }}
                        >
                            <div className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">{stage.label}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{stage.desc}</div>
                            <div className="text-xs font-mono mt-1 transition-colors duration-300" style={{ color: activeStage === i ? "var(--accent)" : "var(--text-muted)" }}>
                                {stage.metric}
                            </div>
                        </motion.div>
                        {i < PIPELINE_STAGES.length - 1 && (
                            <div className="flex items-center">
                                <motion.div animate={{ opacity: activeStage === i ? 1 : 0.3 }} className="w-6 lg:w-8 h-0.5 relative" style={{ background: "var(--border)" }}>
                                    <motion.div
                                        animate={{ x: activeStage === i ? [0, 24] : 0, opacity: activeStage === i ? [1, 0] : 0 }}
                                        transition={{ duration: 0.8, repeat: activeStage === i ? Infinity : 0 }}
                                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                        style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}
                                    />
                                </motion.div>
                                <span className="text-[var(--text-muted)]">›</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile: vertical */}
            <div className="flex md:hidden flex-col items-center gap-3">
                {PIPELINE_STAGES.map((stage, i) => (
                    <div key={stage.label} className="flex flex-col items-center">
                        <motion.div
                            animate={{ borderColor: activeStage === i ? "var(--accent)" : "var(--border)" }}
                            className="text-center px-6 py-3 rounded-xl border-2 w-full max-w-[220px]"
                            style={{ background: activeStage === i ? "rgba(var(--accent-rgb, 10, 132, 255), 0.06)" : "var(--bg-primary)" }}
                        >
                            <div className="text-sm font-semibold text-[var(--text-primary)]">{stage.label}</div>
                            <div className="text-xs text-[var(--text-muted)]">{stage.desc} · <span style={{ color: activeStage === i ? "var(--accent)" : "var(--text-muted)" }}>{stage.metric}</span></div>
                        </motion.div>
                        {i < PIPELINE_STAGES.length - 1 && (
                            <div className="h-4 w-0.5 my-1" style={{ background: activeStage === i ? "var(--accent)" : "var(--border)" }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function DeepDiveStage({ stage, reverse }: { stage: typeof DEEP_DIVE_STAGES[0]; reverse: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.25 });

    return (
        <div ref={ref} className="min-h-[85vh] flex items-center py-16 px-6">
            <div className="max-w-6xl mx-auto w-full">
                <div className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-12 items-start`}>
                    {/* Text side */}
                    <motion.div
                        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: EASINGS.apple }}
                        className="flex-1 lg:sticky lg:top-32"
                    >
                        <div className="flex items-baseline gap-4 mb-4">
                            <span className="text-7xl md:text-8xl font-bold opacity-10 text-[var(--text-primary)] select-none">{stage.number}</span>
                            <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{stage.title}</h3>
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed max-w-xl">{stage.description}</p>

                        {/* Example card */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.3, duration: 0.5, ease: EASINGS.apple }}
                            className="mt-6 p-4 rounded-lg border transition-colors duration-300 hover:border-[var(--accent)]/40"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                        >
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">Example</h4>
                            <p className="text-sm text-[var(--text-secondary)] font-mono">{stage.example}</p>
                        </motion.div>
                    </motion.div>

                    {/* Code side */}
                    <motion.div
                        initial={{ opacity: 0, x: reverse ? -30 : 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.15, duration: 0.6, ease: EASINGS.apple }}
                        className="flex-1 w-full space-y-4"
                    >
                        <CodeBlock snippet={{ title: stage.codeTitle, language: "python", code: stage.code }} />

                        {stage.output && (
                            <div className="p-4 rounded-lg border transition-colors duration-300 hover:border-[var(--accent)]/40" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-2">Output</h4>
                                <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap">{stage.output}</pre>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function StageIndicator({ progress }: { progress: number }) {
    const activeIndex = Math.min(3, Math.floor(progress * 4));

    return (
        <div className="hidden lg:flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: activeIndex === i ? 1.3 : 1,
                        background: activeIndex === i ? "var(--accent)" : "var(--border)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-2.5 h-2.5 rounded-full"
                />
            ))}
        </div>
    );
}

function AnimatedCounter({ value, suffix = "", label, sublabel }: {
    value: number; suffix?: string; label: string; sublabel: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [displayed, setDisplayed] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const duration = 1200;
        const start = performance.now();
        const step = (now: number) => {
            const elapsed = now - start;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplayed(Math.round(eased * value));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, value]);

    return (
        <motion.div
            ref={ref}
            whileHover={{ y: -3, transition: SPRINGS.stiff }}
            className="text-center p-4 rounded-xl border transition-colors duration-300 hover:border-[var(--accent)]/40 cursor-default"
            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
            <div className="text-3xl md:text-4xl font-bold font-mono" style={{ color: "var(--accent)", textShadow: "0 0 20px rgba(var(--accent-rgb, 10, 132, 255), 0.3)" }}>
                {displayed}{suffix}
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] mt-1">{label}</div>
            <div className="text-xs text-[var(--text-muted)]">{sublabel}</div>
        </motion.div>
    );
}

function DecisionCard({ decision }: { decision: typeof KEY_DECISIONS[0] }) {
    const [expanded, setExpanded] = useState(false);
    const { cardRef, rotateX, rotateY, glowX, glowY, handleMouseMove, handleMouseLeave } = use3DTilt(3);

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASINGS.apple }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            style={{ rotateX, rotateY, transformPerspective: 800, transformStyle: "preserve-3d" }}
            className="relative group/card overflow-hidden p-5 rounded-xl border cursor-pointer transition-colors duration-300 hover:border-[var(--accent)]/40"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="absolute inset-0" style={{ background: "var(--bg-secondary)" }} />
            <motion.div
                className="absolute inset-0 opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [glowX, glowY],
                        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(var(--accent-rgb, 10, 132, 255), 0.06) 0%, transparent 60%)`
                    ),
                }}
            />
            <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{decision.title}</h4>
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    </motion.div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{decision.reasoning}</p>
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASINGS.apple }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
                                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>Alternatives Considered</div>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{decision.alternatives}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function FifaSoccerDSPage({ project }: { project: Project }) {
    const deepDiveRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: deepDiveProgress } = useScroll({
        target: deepDiveRef,
        offset: ["start end", "end start"],
    });
    const smoothProgress = useSpring(deepDiveProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const deepDiveInViewRef = useRef<HTMLDivElement>(null);
    const deepDiveInView = useInView(deepDiveInViewRef, { margin: "-40% 0px -40% 0px" });

    const titleWords = "FIFA Soccer DS".split(" ");

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* Stage indicator — fixed dots */}
            {deepDiveInView && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed right-6 top-1/2 -translate-y-1/2 z-40"
                >
                    <StageIndicator progress={smoothProgress.get()} />
                </motion.div>
            )}

            {/* ============================================================= */}
            {/* HERO — max-w-5xl                                              */}
            {/* ============================================================= */}
            <header className="relative pt-28 pb-16 px-6 overflow-hidden">
                <FieldSVG />
                <div className="relative max-w-5xl mx-auto">
                    <div className="flex items-start justify-between mb-8">
                        <BackButton />
                        <span className="eyebrow">Computer Vision</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-4 flex flex-wrap gap-x-4">
                        {titleWords.map((word, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: EASINGS.apple }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5, ease: EASINGS.apple }}
                        className="text-lg md:text-xl text-[var(--text-secondary)] mb-6 max-w-3xl leading-relaxed"
                    >
                        Multi-model computer vision pipeline for soccer video analysis. YOLOv8n detection, ByteTrack persistence, and GraphSAGE neural networks for tactical pattern recognition.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5, ease: EASINGS.apple }}
                        className="flex flex-wrap items-center gap-4 mb-10"
                    >
                        <a href={project.github} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> View on GitHub
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {project.tech.slice(0, 6).map((tech) => (
                                <span key={tech} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricCard value="YOLOv8n" label="Detection Model" sublabel="Nano variant" delay={0} />
                        <MetricCard value="7 Stages" label="DVC Pipeline" sublabel="End-to-end" delay={0.06} />
                        <MetricCard value="3-Class" label="GNN Classification" sublabel="GraphSAGE" delay={0.12} />
                        <MetricCard value="50+" label="MLflow Experiments" sublabel="Tracked" delay={0.18} />
                    </div>
                </div>
            </header>

            {/* ============================================================= */}
            {/* PIPELINE FLOW — full-width bg, max-w-5xl content             */}
            {/* ============================================================= */}
            <section className="py-12 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2 text-center">Pipeline Architecture</p>
                    <PipelineFlowDiagram />
                </div>
            </section>

            {/* ============================================================= */}
            {/* DEEP DIVE — full-width scroll sections                        */}
            {/* ============================================================= */}
            <div ref={deepDiveRef}>
                <div ref={deepDiveInViewRef}>
                    {/* Section header */}
                    <div className="py-12 px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: EASINGS.apple }}
                            className="max-w-5xl mx-auto"
                        >
                            <p className="eyebrow mb-2">Deep Dive</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">How It Works</h2>
                        </motion.div>
                    </div>

                    {DEEP_DIVE_STAGES.map((stage, i) => (
                        <DeepDiveStage key={stage.number} stage={stage} reverse={i % 2 === 1} />
                    ))}
                </div>
            </div>

            {/* ============================================================= */}
            {/* PERFORMANCE — max-w-4xl (narrow)                              */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-8 text-center"
                    >
                        Performance
                    </motion.p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <AnimatedCounter value={7} label="Pipeline Stages" sublabel="DVC orchestrated" />
                        <AnimatedCounter value={50} suffix="+" label="MLflow Experiments" sublabel="Tracked & versioned" />
                        <AnimatedCounter value={3} label="GNN Classes" sublabel="Interaction types" />
                        <AnimatedCounter value={30} label="Frame Window" sublabel="Temporal context" />
                    </div>
                    <div className="flex justify-center gap-8 mt-8 text-center">
                        <div><div className="text-lg font-mono font-bold text-[var(--text-primary)]">YOLOv8n</div><div className="text-xs text-[var(--text-muted)]">Detection backbone</div></div>
                        <div><div className="text-lg font-mono font-bold text-[var(--text-primary)]">DVC + MLflow</div><div className="text-xs text-[var(--text-muted)]">Pipeline & tracking</div></div>
                        <div><div className="text-lg font-mono font-bold text-[var(--text-primary)]">Docker</div><div className="text-xs text-[var(--text-muted)]">Containerized</div></div>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* PIPELINE DEMO — full-width bg, max-w-4xl                     */}
            {/* ============================================================= */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-4xl mx-auto">
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-6">Full Pipeline</p>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#161b22" }}>
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                            <span className="text-xs text-[var(--text-muted)] ml-2 font-mono">pipeline.sh</span>
                        </div>
                        <div className="p-6" style={{ background: "#0d1117" }}>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">Processing a 10-second La Liga clip (Barcelona vs Real Madrid):</p>
                            <div className="space-y-3 mb-8">
                                {PIPELINE_DEMO_STEPS.map((item, i) => (
                                    <motion.div
                                        key={item.stage}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1, duration: 0.4, ease: EASINGS.apple }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-20 text-sm font-mono font-medium shrink-0" style={{ color: "var(--accent)" }}>{item.stage}</div>
                                        <div className="flex-1 h-px bg-[var(--border)]" />
                                        <div className="text-right shrink-0">
                                            <div className="text-sm font-mono text-[var(--text-primary)]">{item.value}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{item.detail}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <CodeBlock snippet={{ title: "Run the full pipeline", language: "bash", code: `# Run the DVC pipeline end-to-end
dvc repro

# Or run individual stages
python src/detect/infer.py --weights yolov8n.pt --confidence 0.25
python src/pipeline_full.py \\
    --video data/raw/sample.mp4 \\
    --model build/detection_yolov8n.plan \\
    --output outputs/tracking_results` }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* KEY DECISIONS — max-w-5xl (wide)                             */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Key Decisions</h2>
                    </motion.div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {KEY_DECISIONS.map((d) => <DecisionCard key={d.title} decision={d} />)}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* LEARNINGS + FUTURE — max-w-3xl (narrowest)                   */}
            {/* ============================================================= */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-12">
                    <div>
                        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="eyebrow mb-4">What I Learned</motion.p>
                        <div className="space-y-3">
                            {LEARNINGS.map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                    <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="eyebrow mb-4">Future Work</motion.p>
                        <div className="space-y-3">
                            {FUTURE_WORK.map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                    <span className="shrink-0 mt-1 text-[var(--text-muted)]">◦</span>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* RELATED + FOOTER                                              */}
            {/* ============================================================= */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                        <Github className="w-4 h-4" /> jayhemnani9910/fifa-soccer-ds <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link href="/projects/soccer-vision-research" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                        Related: Soccer Vision Research →
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-6 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    <ReactionBar slug={project.id} />
                    <ViewCounter slug={project.id} />
                </div>
            </div>
        </div>
    );
}

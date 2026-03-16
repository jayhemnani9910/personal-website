"use client";

import { motion, useScroll, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Github, ExternalLink, ChevronDown } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { CodeBlock } from "@/components/CodeBlock";
import { Footer } from "@/components/Footer";
import { use3DTilt } from "@/hooks/use3DTilt";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA
// =============================================================================

const PIPELINE_STAGES = [
    { label: "Video Input", desc: "MP4/RTSP", metric: "1080p" },
    { label: "Frame Extract", desc: "OpenCV", metric: "30 FPS" },
    { label: "Detection", desc: "YOLOv8", metric: "95%+" },
    { label: "Tracking", desc: "ByteTrack", metric: "0 switches" },
    { label: "Graph Build", desc: "Spatial", metric: "47 edges" },
    { label: "GNN Analysis", desc: "GraphSAGE", metric: "89% F1" },
];

const DEEP_DIVE_STAGES = [
    {
        number: 1, title: "Detection — YOLOv8",
        description: "Each frame is processed through a fine-tuned YOLOv8 model that identifies three object classes: players, ball, and referees. The model runs at 95%+ precision with confidence threshold of 0.35 to balance recall vs false positives for distant players.",
        codeTitle: "src/detect/inference.py",
        code: `from ultralytics import YOLO

model = YOLO("models/yolov8n_soccer.pt")

def detect_frame(frame, conf=0.35):
    results = model(frame, conf=conf, verbose=False)
    boxes = results[0].boxes

    return {
        "boxes": boxes.xyxy.cpu().numpy(),
        "scores": boxes.conf.cpu().numpy(),
        "classes": boxes.cls.cpu().numpy()
    }`,
        example: 'Frame 001 → 22 detections (players: 20, ball: 1, referee: 1)',
        output: `{
  "frame_id": 1,
  "detections": [
    {"box": [120, 340, 180, 520], "class": "player", "conf": 0.92},
    {"box": [540, 280, 560, 300], "class": "ball", "conf": 0.87}
  ]
}`,
    },
    {
        number: 2, title: "Tracking — ByteTrack",
        description: "ByteTrack maintains consistent player IDs across frames using Kalman filter prediction and Hungarian algorithm matching. Handles occlusions with a max_age of 20 frames, allowing track recovery after brief disappearances.",
        codeTitle: "src/track/bytetrack.py",
        code: `from src.track.byte_tracker import BYTETracker

tracker = BYTETracker(
    track_thresh=0.5,
    match_thresh=0.8,
    track_buffer=30,
    frame_rate=30
)

def track_frame(detections, frame_id):
    dets = np.hstack([detections["boxes"],
                      detections["scores"][:, None]])
    tracks = tracker.update(dets, frame_id)
    return tracks`,
        example: 'Player #7 tracked across 847 frames with 3 occlusion recoveries',
        output: `{
  "track_id": 7,
  "total_frames": 847,
  "occlusions_recovered": 3
}`,
    },
    {
        number: 3, title: "Graph Construction",
        description: "For each frame, we build a spatial graph where nodes are tracked players and edges connect players within a distance threshold. This captures tactical structure — who is near whom, potential passing lanes, defensive coverage.",
        codeTitle: "src/graph/builder.py",
        code: `import torch
from torch_geometric.data import Data

def build_frame_graph(tracks, distance_threshold=120.0):
    positions = get_centroids(tracks)
    n_players = len(positions)
    edges = []
    for i in range(n_players):
        for j in range(i + 1, n_players):
            dist = np.linalg.norm(positions[i] - positions[j])
            if dist < distance_threshold:
                edges.append([i, j])
                edges.append([j, i])

    edge_index = torch.tensor(edges, dtype=torch.long).T
    x = torch.tensor(positions, dtype=torch.float)
    return Data(x=x, edge_index=edge_index)`,
        example: 'Frame 150: 22 nodes, 47 edges (avg degree: 4.3)',
        output: `Graph(
  x=[22, 2],
  edge_index=[2, 94],
)`,
    },
    {
        number: 4, title: "GraphSAGE Analysis",
        description: "A 2-layer GraphSAGE model learns 64-dimensional embeddings for each player. Players in similar tactical roles cluster together in embedding space, enabling formation detection and role classification.",
        codeTitle: "src/models/graphsage.py",
        code: `from torch_geometric.nn import SAGEConv
import torch.nn.functional as F

class TacticalGNN(torch.nn.Module):
    def __init__(self, in_dim=2, hidden_dim=32, out_dim=64):
        super().__init__()
        self.conv1 = SAGEConv(in_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, out_dim)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.conv2(x, edge_index)
        return x`,
        example: 'Clustering accuracy: 89% across formations',
        output: `Cosine similarity:
  LW ↔ RW: 0.94 (similar roles)
  LW ↔ CB: 0.12 (different roles)`,
    },
];

const PIPELINE_DEMO_STEPS = [
    { stage: "Input", value: "10s clip @ 30fps", detail: "300 frames, 1920x1080" },
    { stage: "Detection", value: "6,600 bounding boxes", detail: "~22 detections/frame" },
    { stage: "Tracking", value: "22 unique tracks", detail: "0 ID switches" },
    { stage: "Graphs", value: "300 frame graphs", detail: "avg 45 edges/frame" },
    { stage: "Output", value: "4-3-3 vs 4-4-2", detail: "Role predictions for all 22" },
];

const KEY_DECISIONS = [
    { title: "YOLOv8 Medium over Extra-Large", reasoning: "94.8% mAP vs 96.1% for YOLOv8x, but 22 FPS vs 12 FPS. The 1.3% accuracy drop is worth it for real-time performance on consumer GPUs.", alternatives: "Considered YOLOv8x for max accuracy, YOLOv8s for edge deployment. Medium is the sweet spot." },
    { title: "ByteTrack over DeepSORT", reasoning: "Two-stage matching reduced ID switches from 47/match to 12/match. No separate re-ID model needed, cutting latency by 30%.", alternatives: "Evaluated DeepSORT, FairMOT, BoT-SORT. ByteTrack's simplicity and performance won." },
    { title: "MLflow + DVC over Managed Platforms", reasoning: "2 hours setup, $15/month vs $200+ for managed. Full reproducibility maintained with open-source stack.", alternatives: "W&B ($50/month), Kubeflow (requires k8s), SageMaker (vendor lock-in)." },
    { title: "GraphSAGE over Traditional ML", reasoning: "Graph structure naturally represents tactics. Clustering F1 improved from 0.72 (k-means on positions) to 0.89 (GraphSAGE embeddings).", alternatives: "Tried positional features + RF, CNN on heatmaps, LSTM on sequences." },
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

function ComparisonBar() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} className="mt-8 max-w-lg mx-auto">
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 text-center">
                ID Switches per Match
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium" style={{ color: "var(--accent)" }}>ByteTrack</span>
                        <span className="font-mono text-[var(--text-primary)]">12</span>
                    </div>
                    <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${(12 / 47) * 100}%` } : { width: 0 }}
                            transition={{ ...SPRINGS.slow, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: "var(--accent)" }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[var(--text-muted)]">DeepSORT</span>
                        <span className="font-mono text-[var(--text-muted)]">47</span>
                    </div>
                    <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={isInView ? { width: "100%" } : { width: 0 }}
                            transition={{ ...SPRINGS.slow, delay: 0.4 }}
                            className="h-full rounded-full bg-[var(--text-muted)]/20"
                        />
                    </div>
                </div>
            </div>
        </div>
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
                        End-to-end computer vision pipeline for soccer video analysis. Real-time tracking at 22 FPS with YOLOv8, ByteTrack, and GraphSAGE.
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
                        <MetricCard value="22 FPS" label="Real-time Inference" sublabel="RTX 3070" delay={0} />
                        <MetricCard value="95.2%" label="Detection Precision" sublabel="@ 0.35 conf" delay={0.06} />
                        <MetricCard value="12" label="ID Switches/Match" sublabel="vs 47 DeepSORT" delay={0.12} />
                        <MetricCard value="89%" label="Formation F1" sublabel="4-3-3, 4-4-2, 3-5-2" delay={0.18} />
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
                        <AnimatedCounter value={22} suffix=" FPS" label="Real-time Inference" sublabel="RTX 3070 8GB" />
                        <AnimatedCounter value={95} suffix="%" label="Detection Precision" sublabel="@ 0.35 confidence" />
                        <AnimatedCounter value={12} label="ID Switches/Match" sublabel="Down from 47" />
                        <AnimatedCounter value={89} suffix="%" label="Formation F1" sublabel="3 formations" />
                    </div>
                    <ComparisonBar />
                    <div className="flex justify-center gap-8 mt-8 text-center">
                        <div><div className="text-lg font-mono font-bold text-[var(--text-primary)]">280ms</div><div className="text-xs text-[var(--text-muted)]">End-to-end latency</div></div>
                        <div><div className="text-lg font-mono font-bold text-[var(--text-primary)]">50+</div><div className="text-xs text-[var(--text-muted)]">MLflow experiments</div></div>
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
                            <CodeBlock snippet={{ title: "Run the full pipeline", language: "bash", code: `python -m src.pipeline_full \\
    --video data/raw/barca_vs_real.mp4 \\
    --output-dir outputs/match_analysis \\
    --confidence 0.35 \\
    --distance-threshold 120.0 \\
    --max-age 20` }} />
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
            </div>
            <Footer />
        </div>
    );
}

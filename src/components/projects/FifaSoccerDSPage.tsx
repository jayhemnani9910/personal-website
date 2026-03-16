"use client";

import { motion, useScroll, useSpring, useInView, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Github, ExternalLink, ChevronDown } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { CodeBlock } from "@/components/CodeBlock";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA CONSTANTS
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
        number: 1,
        title: "Detection — YOLOv8",
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
    {"box": [540, 280, 560, 300], "class": "ball", "conf": 0.87},
    ...
  ]
}`,
    },
    {
        number: 2,
        title: "Tracking — ByteTrack",
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
    return tracks  # Each track has persistent ID`,
        example: 'Player #7 tracked across 847 frames with 3 occlusion recoveries',
        output: `{
  "track_id": 7,
  "history": [
    {"frame": 1, "box": [120, 340, 180, 520]},
    {"frame": 2, "box": [125, 342, 185, 522]},
    ...
  ],
  "total_frames": 847,
  "occlusions_recovered": 3
}`,
    },
    {
        number: 3,
        title: "Graph Construction",
        description: "For each frame, we build a spatial graph where nodes are tracked players and edges connect players within a distance threshold. This captures the tactical structure — who is near whom, potential passing lanes, defensive coverage.",
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
  x=[22, 2],           # 22 players, (x, y) position
  edge_index=[2, 94],  # 47 bidirectional edges
)`,
    },
    {
        number: 4,
        title: "GraphSAGE Analysis",
        description: "A 2-layer GraphSAGE model learns 64-dimensional embeddings for each player based on their position and neighborhood. Players in similar tactical roles cluster together in embedding space, enabling formation detection and role classification.",
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
        return x  # [N, 64] player embeddings`,
        example: 'Similar embeddings → similar tactical roles (clustering accuracy: 89%)',
        output: `Player embeddings [22, 64]:
  Player #7 (LW):  [0.12, -0.34, 0.89, ...]
  Player #11 (RW): [0.15, -0.31, 0.85, ...]  # Similar!
  Player #4 (CB):  [-0.67, 0.23, -0.12, ...]

Cosine similarity LW-RW: 0.94
Cosine similarity LW-CB: 0.12`,
    },
];

const PIPELINE_DEMO_STEPS = [
    { stage: "Input", value: "10s clip @ 30fps", detail: "300 frames, 1920x1080" },
    { stage: "Detection", value: "6,600 bounding boxes", detail: "~22 detections/frame" },
    { stage: "Tracking", value: "22 unique tracks", detail: "0 ID switches" },
    { stage: "Graphs", value: "300 frame graphs", detail: "avg 45 edges/frame" },
    { stage: "Output", value: "Formation: 4-3-3 vs 4-4-2", detail: "Role predictions for all 22" },
];

const KEY_DECISIONS = [
    {
        title: "YOLOv8 Medium over Extra-Large",
        reasoning: "YOLOv8m achieves 94.8% mAP vs 96.1% for YOLOv8x, but runs at 22 FPS vs 12 FPS. The 1.3% accuracy drop is acceptable for real-time performance on consumer GPUs.",
        alternatives: "Considered YOLOv8x for max accuracy and YOLOv8s for edge deployment. Chose medium as sweet spot — can scale based on target without retraining.",
    },
    {
        title: "ByteTrack over DeepSORT",
        reasoning: "Two-stage matching improved track continuity in crowded scenes — reduced ID switches from 47/match (DeepSORT) to 12/match. No separate re-ID model needed, reducing latency by 30%.",
        alternatives: "Evaluated DeepSORT (appearance features), FairMOT (joint detection-tracking), BoT-SORT (camera motion compensation). ByteTrack's simplicity won.",
    },
    {
        title: "MLflow + DVC over Managed Platforms",
        reasoning: "Lightweight experiment tracking without Kubernetes. MLflow + DVC: 2 hours setup, $15/month S3. Managed platforms: $200+/month. Full reproducibility maintained.",
        alternatives: "W&B ($50/month, better viz), Kubeflow (requires k8s), SageMaker (vendor lock-in). Open-source stack won for cost and portability.",
    },
    {
        title: "GraphSAGE over Traditional ML",
        reasoning: "Graph structure naturally represents tactics — players as nodes, proximity as edges. Clustering F1 improved from 0.72 (k-means on positions) to 0.89 (GraphSAGE embeddings).",
        alternatives: "Tried positional feature engineering + RF, CNN on heatmaps, LSTM on sequences. None captured both spatial and temporal team-level patterns.",
    },
];

const LEARNINGS = [
    "FP16 inference is essential for real-time CV on consumer GPUs — 2x speedup with <1% accuracy loss.",
    "Two-stage matching (ByteTrack) dramatically improved track continuity. Don't discard low-confidence detections.",
    "GNNs are perfect for spatial relationship modeling in sports — players' relative positions define tactics.",
    "MLflow + DVC lightweight stack worked surprisingly well for solo ML projects. No Kubernetes needed.",
    "Production ML is 20% model training, 80% pipeline engineering.",
    "Weekly automated retraining prevented model drift as data distribution evolved.",
];

const FUTURE_WORK = [
    "Pose estimation with SAM2 for injury risk and fatigue detection",
    "Multi-camera fusion for 3D position estimation",
    "Vision-language models for zero-shot player identification",
    "Automated highlight generation using action detection",
    "Edge deployment with INT8 quantization for mobile devices",
    "Pass prediction GNN for 'expected threat' heatmaps",
];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function BroadcastBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: EASINGS.apple }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: "rgba(239, 68, 68, 0.9)", color: "#fff" }}
        >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Match Analysis
        </motion.div>
    );
}

function MetricOverlay({ value, label, sublabel, delay = 0 }: {
    value: string; label: string; sublabel?: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + delay, duration: 0.5, ease: EASINGS.apple }}
            className="px-4 py-3 rounded-lg backdrop-blur-sm"
            style={{
                background: "rgba(0, 0, 0, 0.5)",
                borderLeft: "2px solid #00e676",
            }}
        >
            <div className="text-xl font-bold font-mono" style={{ color: "#00e676" }}>{value}</div>
            <div className="text-xs font-medium text-[var(--text-primary)]">{label}</div>
            {sublabel && <div className="text-xs text-[var(--text-muted)]">{sublabel}</div>}
        </motion.div>
    );
}

function FieldSVG() {
    return (
        <svg
            className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
            viewBox="0 0 1000 600"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
        >
            <rect x="50" y="50" width="900" height="500" stroke="white" strokeWidth="2" rx="4" />
            <line x1="500" y1="50" x2="500" y2="550" stroke="white" strokeWidth="2" />
            <circle cx="500" cy="300" r="80" stroke="white" strokeWidth="2" />
            <circle cx="500" cy="300" r="3" fill="white" />
            <rect x="50" y="180" width="130" height="240" stroke="white" strokeWidth="2" />
            <rect x="820" y="180" width="130" height="240" stroke="white" strokeWidth="2" />
            <rect x="50" y="230" width="50" height="140" stroke="white" strokeWidth="2" />
            <rect x="900" y="230" width="50" height="140" stroke="white" strokeWidth="2" />
        </svg>
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
                                borderColor: activeStage === i ? "#00e676" : "var(--border)",
                            }}
                            transition={{ duration: 0.3 }}
                            className="text-center px-3 py-3 lg:px-4 lg:py-4 rounded-xl border-2 min-w-[100px] lg:min-w-[120px]"
                            style={{ background: activeStage === i ? "rgba(0, 230, 118, 0.08)" : "var(--bg-primary)" }}
                        >
                            <div className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">{stage.label}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{stage.desc}</div>
                            <div
                                className="text-xs font-mono mt-1 transition-colors duration-300"
                                style={{ color: activeStage === i ? "#00e676" : "var(--text-muted)" }}
                            >
                                {stage.metric}
                            </div>
                        </motion.div>
                        {i < PIPELINE_STAGES.length - 1 && (
                            <div className="flex items-center">
                                <motion.div
                                    animate={{ opacity: activeStage === i ? 1 : 0.3 }}
                                    className="w-6 lg:w-8 h-0.5 relative"
                                    style={{ background: "var(--border)" }}
                                >
                                    <motion.div
                                        animate={{
                                            x: activeStage === i ? [0, 24] : 0,
                                            opacity: activeStage === i ? [1, 0] : 0,
                                        }}
                                        transition={{ duration: 0.8, repeat: activeStage === i ? Infinity : 0 }}
                                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                        style={{ background: "#00e676", boxShadow: "0 0 8px #00e676" }}
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
                            animate={{
                                scale: activeStage === i ? 1.03 : 1,
                                borderColor: activeStage === i ? "#00e676" : "var(--border)",
                            }}
                            transition={{ duration: 0.3 }}
                            className="text-center px-6 py-3 rounded-xl border-2 w-full max-w-[200px]"
                            style={{ background: activeStage === i ? "rgba(0, 230, 118, 0.08)" : "var(--bg-primary)" }}
                        >
                            <div className="text-sm font-semibold text-[var(--text-primary)]">{stage.label}</div>
                            <div className="text-xs text-[var(--text-muted)]">{stage.desc} · {stage.metric}</div>
                        </motion.div>
                        {i < PIPELINE_STAGES.length - 1 && (
                            <motion.div
                                animate={{ opacity: activeStage === i ? 1 : 0.3 }}
                                className="h-4 w-0.5 my-1"
                                style={{ background: activeStage === i ? "#00e676" : "var(--border)" }}
                            />
                        )}
                    </div>
                ))}
            </div>
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
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, value]);

    return (
        <div ref={ref} className="text-center">
            <div
                className="text-3xl md:text-4xl font-bold font-mono"
                style={{ color: "#00e676", textShadow: "0 0 20px rgba(0, 230, 118, 0.3)" }}
            >
                {displayed}{suffix}
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] mt-1">{label}</div>
            <div className="text-xs text-[var(--text-muted)]">{sublabel}</div>
        </div>
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
                        <span className="font-medium" style={{ color: "#00e676" }}>ByteTrack</span>
                        <span className="font-mono text-[var(--text-primary)]">12</span>
                    </div>
                    <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${(12 / 47) * 100}%` } : { width: 0 }}
                            transition={{ ...SPRINGS.slow, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(90deg, #00e676, #00c853)" }}
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
                            className="h-full rounded-full bg-[var(--text-muted)]/30"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeepDiveStage({ stage }: { stage: typeof DEEP_DIVE_STAGES[0] }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} className="relative pl-16 md:pl-20 pb-16 last:pb-0">
            {/* Timeline dot */}
            <motion.div
                animate={{
                    background: isInView ? "var(--accent)" : "var(--bg-tertiary)",
                    borderColor: isInView ? "var(--accent)" : "var(--border)",
                    scale: isInView ? 1 : 0.8,
                }}
                transition={{ duration: 0.4, ease: EASINGS.apple }}
                className="absolute left-0 top-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center z-10"
            >
                <span className={`text-sm md:text-base font-bold ${isInView ? "text-white" : "text-[var(--text-muted)]"}`}>
                    {stage.number}
                </span>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.apple }}
            >
                <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3">{stage.title}</h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-3xl leading-relaxed">{stage.description}</p>

                <div className="grid lg:grid-cols-2 gap-4">
                    <CodeBlock snippet={{ title: stage.codeTitle, language: "python", code: stage.code }} />

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Example</h4>
                            <p className="text-sm text-[var(--text-secondary)] font-mono">{stage.example}</p>
                        </div>

                        {stage.output && (
                            <div className="p-4 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Output Format</h4>
                                <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap">{stage.output}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function DecisionCard({ decision }: { decision: typeof KEY_DECISIONS[0] }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASINGS.apple }}
            className="p-5 rounded-xl border cursor-pointer transition-colors duration-200"
            style={{
                background: "var(--bg-secondary)",
                borderColor: expanded ? "var(--accent)" : "var(--border)",
            }}
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{decision.title}</h4>
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </motion.div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                {decision.reasoning}
            </p>
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
                            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                Alternatives Considered
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {decision.alternatives}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FifaSoccerDSPage({ project }: { project: Project }) {
    const timelineRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ["start center", "end center"],
    });
    const timelineSpring = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Staggered word reveal for title
    const titleWords = "FIFA Soccer DS".split(" ");

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* ============================================================= */}
            {/* HERO — Sports Broadcast Style                                 */}
            {/* ============================================================= */}
            <header
                className="relative pt-28 pb-16 px-6 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0a1a0f 0%, var(--bg-primary) 40%, #0a0f1a 100%)",
                }}
            >
                <FieldSVG />

                <div className="relative max-w-5xl mx-auto">
                    <div className="flex items-start justify-between mb-8">
                        <BackButton />
                        <BroadcastBadge />
                    </div>

                    {/* Title — word reveal */}
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
                        End-to-end computer vision pipeline for soccer video analysis. Processes footage at 22 FPS
                        with YOLOv8 detection, ByteTrack tracking, and GraphSAGE for tactical pattern recognition.
                    </motion.p>

                    {/* GitHub + tech */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5, ease: EASINGS.apple }}
                        className="flex flex-wrap items-center gap-4 mb-10"
                    >
                        <a
                            href="https://github.com/jayhemnani9910/fifa-soccer-ds"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                        >
                            <Github className="w-4 h-4" />
                            View on GitHub
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {project.tech.slice(0, 6).map((tech) => (
                                <span
                                    key={tech}
                                    className="px-2 py-1 text-xs font-mono rounded"
                                    style={{ background: "rgba(var(--accent-rgb, 10, 132, 255), 0.1)", color: "var(--accent)", border: "1px solid rgba(var(--accent-rgb, 10, 132, 255), 0.2)" }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Metric overlays */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <MetricOverlay value="22 FPS" label="Real-time Inference" sublabel="RTX 3070" delay={0} />
                        <MetricOverlay value="95.2%" label="Detection Precision" sublabel="@ 0.35 conf" delay={0.08} />
                        <MetricOverlay value="12" label="ID Switches/Match" sublabel="vs 47 DeepSORT" delay={0.16} />
                        <MetricOverlay value="89%" label="Formation F1" sublabel="4-3-3, 4-4-2, 3-5-2" delay={0.24} />
                    </div>
                </div>
            </header>

            {/* ============================================================= */}
            {/* PIPELINE FLOW DIAGRAM — Animated                              */}
            {/* ============================================================= */}
            <section className="py-12 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2 text-center">
                            Pipeline Architecture
                        </p>
                        <PipelineFlowDiagram />
                    </motion.div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* DEEP DIVE TIMELINE — Scroll-triggered                         */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                        className="mb-12"
                    >
                        <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">
                            Deep Dive
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                            How It Works
                        </h2>
                    </motion.div>

                    <div ref={timelineRef} className="relative">
                        {/* Timeline background line */}
                        <div
                            className="absolute left-5 md:left-6 top-0 bottom-0 w-0.5"
                            style={{ background: "var(--border)" }}
                        />
                        {/* Timeline progress fill */}
                        <motion.div
                            className="absolute left-5 md:left-6 top-0 w-0.5 origin-top"
                            style={{
                                scaleY: timelineSpring,
                                background: "var(--accent)",
                                height: "100%",
                            }}
                        />

                        {DEEP_DIVE_STAGES.map((stage) => (
                            <DeepDiveStage key={stage.number} stage={stage} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* PERFORMANCE — Broadcast Stats                                 */}
            {/* ============================================================= */}
            <section
                className="py-16 px-6"
                style={{
                    background: "linear-gradient(135deg, #0a1a0f 0%, var(--bg-primary) 50%, #0a0f1a 100%)",
                }}
            >
                <div className="max-w-5xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-8 text-center"
                    >
                        Performance
                    </motion.p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <AnimatedCounter value={22} suffix=" FPS" label="Real-time Inference" sublabel="RTX 3070 8GB" />
                        <AnimatedCounter value={95} suffix="%" label="Detection Precision" sublabel="@ 0.35 confidence" />
                        <AnimatedCounter value={12} label="ID Switches/Match" sublabel="Down from 47" />
                        <AnimatedCounter value={89} suffix="%" label="Formation F1" sublabel="3 formations" />
                    </div>

                    <ComparisonBar />

                    {/* Secondary stats */}
                    <div className="flex justify-center gap-8 mt-8 text-center">
                        <div>
                            <div className="text-lg font-mono font-bold text-[var(--text-primary)]">280ms</div>
                            <div className="text-xs text-[var(--text-muted)]">End-to-end latency</div>
                        </div>
                        <div>
                            <div className="text-lg font-mono font-bold text-[var(--text-primary)]">50+</div>
                            <div className="text-xs text-[var(--text-muted)]">MLflow experiments</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* FULL PIPELINE DEMO — Terminal Style                           */}
            {/* ============================================================= */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-6"
                    >
                        Full Pipeline
                    </motion.p>

                    {/* Terminal chrome */}
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                        <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#161b22" }}>
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            <span className="text-xs text-[var(--text-muted)] ml-2 font-mono">pipeline.sh</span>
                        </div>

                        <div className="p-6" style={{ background: "#0d1117" }}>
                            <p className="text-sm text-[var(--text-secondary)] mb-6">
                                Processing a 10-second La Liga clip (Barcelona vs Real Madrid):
                            </p>

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
                                        <div className="w-20 text-sm font-mono font-medium shrink-0" style={{ color: "#00e676" }}>{item.stage}</div>
                                        <div className="flex-1 h-px bg-[var(--border)]" />
                                        <div className="text-right shrink-0">
                                            <div className="text-sm font-mono text-[var(--text-primary)]">{item.value}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{item.detail}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <CodeBlock
                                snippet={{
                                    title: "Run the full pipeline",
                                    language: "bash",
                                    code: `python -m src.pipeline_full \\
    --video data/raw/barca_vs_real.mp4 \\
    --output-dir outputs/match_analysis \\
    --confidence 0.35 \\
    --distance-threshold 120.0 \\
    --max-age 20

# Output structure:
# outputs/match_analysis/
# ├── detections/          # Per-frame detection JSON
# ├── tracklets.json       # Complete track histories
# ├── graphs/              # PyG graph objects
# ├── embeddings.npy       # Player embeddings [N, 64]
# └── pipeline_summary.json`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* KEY DECISIONS — Expandable Cards                              */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                        className="mb-8"
                    >
                        <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">
                            Architecture
                        </p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Key Decisions</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {KEY_DECISIONS.map((decision) => (
                            <DecisionCard key={decision.title} decision={decision} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* LEARNINGS + FUTURE WORK                                       */}
            {/* ============================================================= */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
                    {/* Learnings */}
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: EASINGS.apple }}
                            className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4"
                        >
                            What I Learned
                        </motion.p>
                        <div className="space-y-3">
                            {LEARNINGS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }}
                                    className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed"
                                >
                                    <span className="shrink-0 mt-1" style={{ color: "#00e676" }}>▸</span>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Future Work */}
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: EASINGS.apple }}
                            className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-4"
                        >
                            Future Work
                        </motion.p>
                        <div className="space-y-3">
                            {FUTURE_WORK.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }}
                                    className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed"
                                >
                                    <span className="shrink-0 mt-1 text-[var(--accent)]">◦</span>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* FOOTER — Broadcast Style                                      */}
            {/* ============================================================= */}
            <footer className="py-12 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a
                        href="https://github.com/jayhemnani9910/fifa-soccer-ds"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all hover:brightness-110"
                        style={{ background: "#00e676", color: "#000" }}
                    >
                        <ExternalLink className="w-4 h-4" />
                        Full Replay
                    </a>

                    <Link
                        href="/projects/soccer-vision-research"
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                        Related: Soccer Vision Research →
                    </Link>
                </div>
            </footer>
        </div>
    );
}

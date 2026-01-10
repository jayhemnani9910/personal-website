"use client";

import Link from "next/link";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Code block component with syntax highlighting styling
function CodeBlock({ title, language, code }: { title?: string; language: string; code: string }) {
    return (
        <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[#0d1117]">
            {title && (
                <div className="px-4 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border)] text-xs text-[var(--text-muted)] font-mono">
                    {title}
                </div>
            )}
            <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-[#e6edf3] font-mono whitespace-pre">{code}</code>
            </pre>
        </div>
    );
}

// Pipeline stage section
function PipelineStage({
    number,
    title,
    description,
    code,
    codeTitle,
    example,
    output
}: {
    number: number;
    title: string;
    description: string;
    code: string;
    codeTitle: string;
    example: string;
    output?: string;
}) {
    return (
        <section className="py-12 border-b border-[var(--border)]">
            <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-bold text-[var(--accent)]">{number}</span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
            </div>

            <p className="text-[var(--text-secondary)] mb-6 max-w-3xl leading-relaxed">
                {description}
            </p>

            <div className="grid lg:grid-cols-2 gap-6">
                <CodeBlock title={codeTitle} language="python" code={code} />

                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Example</h4>
                        <p className="text-sm text-[var(--text-secondary)] font-mono">{example}</p>
                    </div>

                    {output && (
                        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Output Format</h4>
                            <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap">{output}</pre>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export function FifaSoccerDSPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
                        FIFA Soccer DS
                    </h1>

                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl">
                        End-to-end computer vision pipeline for soccer video analysis. Processes footage at 22 FPS
                        with YOLOv8 detection, ByteTrack multi-object tracking, and GraphSAGE for tactical pattern recognition.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <a
                            href="https://github.com/jayhemnani9910/fifa-soccer-ds"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-sm"
                        >
                            <Github className="w-4 h-4" />
                            View on GitHub
                        </a>

                        <div className="flex flex-wrap gap-2">
                            {project.tech.slice(0, 6).map((tech) => (
                                <span
                                    key={tech}
                                    className="px-2 py-1 text-xs font-mono rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Pipeline Overview */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Pipeline Architecture</h2>

                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-8">
                        {[
                            { label: "Video Input", desc: "MP4/RTSP" },
                            { label: "Frame Extraction", desc: "30 FPS" },
                            { label: "Detection", desc: "YOLOv8" },
                            { label: "Tracking", desc: "ByteTrack" },
                            { label: "Graph Build", desc: "Spatial" },
                            { label: "GNN Analysis", desc: "GraphSAGE" }
                        ].map((stage, i, arr) => (
                            <div key={stage.label} className="flex items-center gap-2 md:gap-4">
                                <div className="text-center">
                                    <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)]">
                                        {stage.label}
                                    </div>
                                    <span className="text-xs text-[var(--text-muted)] mt-1 block">{stage.desc}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <span className="text-[var(--accent)] text-lg">→</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Sections */}
            <div className="px-6">
                <div className="max-w-4xl mx-auto">

                    <PipelineStage
                        number={1}
                        title="Detection — YOLOv8"
                        description="Each frame is processed through a fine-tuned YOLOv8 model that identifies three object classes: players, ball, and referees. The model runs at 95%+ precision with confidence threshold of 0.35 to balance recall vs false positives for distant players."
                        codeTitle="src/detect/inference.py"
                        code={`from ultralytics import YOLO

model = YOLO("models/yolov8n_soccer.pt")

def detect_frame(frame, conf=0.35):
    results = model(frame, conf=conf, verbose=False)
    boxes = results[0].boxes

    return {
        "boxes": boxes.xyxy.cpu().numpy(),  # [x1, y1, x2, y2]
        "scores": boxes.conf.cpu().numpy(),
        "classes": boxes.cls.cpu().numpy()  # 0=player, 1=ball, 2=referee
    }`}
                        example="Frame 001 → 22 detections (players: 20, ball: 1, referee: 1)"
                        output={`{
  "frame_id": 1,
  "detections": [
    {"box": [120, 340, 180, 520], "class": "player", "conf": 0.92},
    {"box": [540, 280, 560, 300], "class": "ball", "conf": 0.87},
    ...
  ]
}`}
                    />

                    <PipelineStage
                        number={2}
                        title="Tracking — ByteTrack"
                        description="ByteTrack maintains consistent player IDs across frames using Kalman filter prediction and Hungarian algorithm matching. Handles occlusions (passes, tackles) with a max_age of 20 frames, allowing track recovery after brief disappearances."
                        codeTitle="src/track/bytetrack.py"
                        code={`from src.track.byte_tracker import BYTETracker

tracker = BYTETracker(
    track_thresh=0.5,    # High-confidence threshold
    match_thresh=0.8,    # IoU matching threshold
    track_buffer=30,     # Frames to keep lost tracks
    frame_rate=30
)

def track_frame(detections, frame_id):
    # Format: [x1, y1, x2, y2, score]
    dets = np.hstack([detections["boxes"],
                      detections["scores"][:, None]])

    tracks = tracker.update(dets, frame_id)
    return tracks  # Each track has persistent ID`}
                        example="Player #7 tracked across 847 frames with 3 occlusion recoveries"
                        output={`{
  "track_id": 7,
  "history": [
    {"frame": 1, "box": [120, 340, 180, 520]},
    {"frame": 2, "box": [125, 342, 185, 522]},
    ...
  ],
  "total_frames": 847,
  "occlusions_recovered": 3
}`}
                    />

                    <PipelineStage
                        number={3}
                        title="Graph Construction"
                        description="For each frame, we build a spatial graph where nodes are tracked players and edges connect players within a distance threshold (120px ≈ 8-10 meters on pitch). This captures the tactical structure — who is near whom, potential passing lanes, defensive coverage."
                        codeTitle="src/graph/builder.py"
                        code={`import torch
from torch_geometric.data import Data

def build_frame_graph(tracks, distance_threshold=120.0):
    positions = get_centroids(tracks)  # [N, 2]
    n_players = len(positions)

    # Build edges based on distance
    edges = []
    for i in range(n_players):
        for j in range(i + 1, n_players):
            dist = np.linalg.norm(positions[i] - positions[j])
            if dist < distance_threshold:
                edges.append([i, j])
                edges.append([j, i])  # Undirected

    edge_index = torch.tensor(edges, dtype=torch.long).T
    x = torch.tensor(positions, dtype=torch.float)

    return Data(x=x, edge_index=edge_index)`}
                        example="Frame 150: 22 nodes, 47 edges (avg degree: 4.3)"
                        output={`Graph(
  x=[22, 2],           # 22 players, (x, y) position
  edge_index=[2, 94],  # 47 bidirectional edges
)`}
                    />

                    <PipelineStage
                        number={4}
                        title="GraphSAGE Analysis"
                        description="A 2-layer GraphSAGE model learns 64-dimensional embeddings for each player based on their position and neighborhood. Players in similar tactical roles (e.g., wide midfielders) cluster together in embedding space, enabling formation detection and role classification."
                        codeTitle="src/models/graphsage.py"
                        code={`from torch_geometric.nn import SAGEConv
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

        return x  # [N, 64] player embeddings`}
                        example="Similar embeddings → similar tactical roles (clustering accuracy: 89%)"
                        output={`Player embeddings [22, 64]:
  Player #7 (LW):  [0.12, -0.34, 0.89, ...]
  Player #11 (RW): [0.15, -0.31, 0.85, ...]  # Similar!
  Player #4 (CB):  [-0.67, 0.23, -0.12, ...]  # Different

Cosine similarity LW-RW: 0.94
Cosine similarity LW-CB: 0.12`}
                    />
                </div>
            </div>

            {/* Full Pipeline Example */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)] mt-12">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Full Pipeline Example</h2>

                    <p className="text-[var(--text-secondary)] mb-8">
                        Processing a 10-second La Liga clip (Barcelona vs Real Madrid) through the complete pipeline:
                    </p>

                    <div className="space-y-4 mb-8">
                        {[
                            { stage: "Input", value: "10s clip @ 30fps", detail: "300 frames, 1920x1080" },
                            { stage: "Detection", value: "6,600 bounding boxes", detail: "~22 detections/frame" },
                            { stage: "Tracking", value: "22 unique tracks", detail: "0 ID switches" },
                            { stage: "Graphs", value: "300 frame graphs", detail: "avg 45 edges/frame" },
                            { stage: "Output", value: "Formation: 4-3-3 vs 4-4-2", detail: "Role predictions for all 22 players" }
                        ].map((item, i) => (
                            <div key={item.stage} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium text-[var(--accent)]">{item.stage}</div>
                                <div className="flex-1 h-px bg-[var(--border)]" />
                                <div className="text-right">
                                    <div className="text-sm font-medium text-[var(--text-primary)]">{item.value}</div>
                                    <div className="text-xs text-[var(--text-muted)]">{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <CodeBlock
                        title="Run the full pipeline"
                        language="bash"
                        code={`# Full pipeline execution
python -m src.pipeline_full \\
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
# └── pipeline_summary.json`}
                    />
                </div>
            </section>

            {/* Performance */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Performance</h2>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <div className="text-2xl font-bold text-[var(--accent)]">22 FPS</div>
                            <div className="text-sm text-[var(--text-muted)]">Real-time inference</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">RTX 3070 8GB</div>
                        </div>
                        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <div className="text-2xl font-bold text-[var(--accent)]">95%+</div>
                            <div className="text-sm text-[var(--text-muted)]">Detection precision</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">@ 0.35 confidence</div>
                        </div>
                        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <div className="text-2xl font-bold text-[var(--accent)]">0</div>
                            <div className="text-sm text-[var(--text-muted)]">ID switches</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">On test clips</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a
                        href="https://github.com/jayhemnani9910/fifa-soccer-ds"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                    >
                        <Github className="w-5 h-5" />
                        jayhemnani9910/fifa-soccer-ds
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    <div className="flex gap-4 text-sm">
                        <Link href="/projects/soccer-vision-research" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                            Related: Soccer Vision Research
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

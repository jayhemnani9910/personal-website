"use client";

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge,
    MiniMap,
    Node,
    addEdge,
    useEdgesState,
    useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { ArchitectureData, ArchitectureNode } from "@/data/types";
import { useReducedMotion } from "framer-motion";

/**
 * Custom Node Component - styled with Liquid Glass aesthetic
 */
export const typeColors: Record<ArchitectureNode["type"], string> = {
    database: "var(--neon-purple)",
    service: "var(--neon-cyan)",
    stream: "var(--neon-blue)",
    client: "#c7d2fe",
    cache: "#fbbf24",
    queue: "#22d3ee",
    ml: "#c084fc",
    search: "#a855f7",
    other: "var(--glass-border)"
};

const CustomNode = ({ data }: { data: { label: string; type?: ArchitectureNode["type"] } }) => {
    const color = data.type ? typeColors[data.type] ?? "var(--glass-border)" : "var(--glass-border)";

    return (
        <div
            className="glass-panel px-4 py-2 rounded-lg min-w-[140px] text-center"
            style={{
                borderColor: color,
                boxShadow: `0 0 10px ${color}33`,
                willChange: "transform"
            }}
        >
            <div className="text-xs font-mono text-[var(--text-muted)] mb-1 uppercase">
                {data.type || "node"}
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
                {data.label}
            </div>
        </div>
    );
};

const nodeTypes = { custom: CustomNode };

interface ArchitectureVisualizerProps {
    data?: ArchitectureData;
    className?: string;
    height?: number;
}

/**
 * ArchitectureVisualizer Component
 *
 * Fully data-driven React Flow canvas.
 * All nodes/edges/colors come from project.architecture.
 */
export function ArchitectureVisualizer({ data, className = "", height = 500 }: ArchitectureVisualizerProps) {
    const prefersReducedMotion = useReducedMotion();

    const mappedNodes: Node[] = useMemo(() => {
        const nodes = data?.nodes ?? [];
        const colWidth = 220;
        const rowHeight = 170;

        return nodes.map((n, idx) => {
            const x = n.x ?? (idx % 3) * colWidth;
            const y = n.y ?? Math.floor(idx / 3) * rowHeight;
            return {
                id: n.id,
                type: "custom",
                position: { x, y },
                data: { label: n.label, type: n.type },
            };
        });
    }, [data]);

    const mappedEdges: Edge[] = useMemo(() => {
        return (data?.edges ?? []).map((e, idx) => ({
            id: e.label ? `e-${e.source}-${e.target}-${idx}` : `e-${e.source}-${e.target}-${idx}`,
            source: e.source,
            target: e.target,
            label: e.label,
            animated: prefersReducedMotion ? false : e.animated,
        }));
    }, [data, prefersReducedMotion]);

    const [nodes, setNodes, onNodesChange] = useNodesState(mappedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges);

    useEffect(() => {
        setNodes(mappedNodes);
    }, [mappedNodes, setNodes]);

    useEffect(() => {
        setEdges(mappedEdges);
    }, [mappedEdges, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    if (!data || !data.nodes.length) {
        return null;
    }

    return (
        <div className={`${className} rounded-2xl overflow-hidden glass-panel`} style={{ height }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                style={{
                    background: "var(--bg-abyss)",
                    willChange: "transform"
                }}
                defaultEdgeOptions={{
                    style: { stroke: "var(--neon-cyan)", strokeWidth: 2 },
                    type: "smoothstep",
                }}
                minZoom={0.6}
                maxZoom={1.6}
                panOnScroll
                zoomOnDoubleClick={!prefersReducedMotion}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="var(--glass-border)"
                />
                <Controls
                    style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                    }}
                />
                <MiniMap
                    nodeColor={(node) => {
                        const nodeType = node?.data?.type as ArchitectureNode["type"] | undefined;
                        return (nodeType && typeColors[nodeType]) || "#ffffff";
                    }}
                    style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                    }}
                    maskColor="rgba(0, 0, 0, 0.5)"
                />
            </ReactFlow>
        </div>
    );
}

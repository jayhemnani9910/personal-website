"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

// Constants
const NODE_COUNT = 25;
const CONNECTION_DISTANCE = 2.5;
const COLORS = {
  cyan: new THREE.Color("#00F5FF"),
  purple: new THREE.Color("#A855F7"),
};

// Generate random node positions in a sphere distribution
function generateNodePositions(count: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    // Distribute nodes in a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 2 + Math.random() * 2;

    positions.push(
      new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
    );
  }
  return positions;
}

// Individual data node with glow effect
interface DataNodeProps {
  position: THREE.Vector3;
  index: number;
  reducedMotion: boolean;
}

function DataNode({ position, index, reducedMotion }: DataNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Interpolate color based on index
  const color = useMemo(() => {
    const t = index / NODE_COUNT;
    return COLORS.cyan.clone().lerp(COLORS.purple, t);
  }, [index]);

  // Animate node pulsing
  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  const floatConfig = reducedMotion
    ? { speed: 0, rotationIntensity: 0, floatIntensity: 0 }
    : { speed: 1.5, rotationIntensity: 0.2, floatIntensity: 0.3 };

  return (
    <Float {...floatConfig}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {/* Glow effect - slightly larger transparent sphere */}
      <mesh position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </Float>
  );
}

// Connection lines between nearby nodes
interface ConnectionLinesProps {
  positions: THREE.Vector3[];
  reducedMotion: boolean;
}

function ConnectionLines({ positions, reducedMotion }: ConnectionLinesProps) {
  const linesRef = useRef<THREE.LineSegments>(null);

  // Calculate connections between nearby nodes
  const { geometry, colors } = useMemo(() => {
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = positions[i].distanceTo(positions[j]);
        if (distance < CONNECTION_DISTANCE) {
          // Add line segment
          linePositions.push(
            positions[i].x,
            positions[i].y,
            positions[i].z,
            positions[j].x,
            positions[j].y,
            positions[j].z
          );

          // Interpolate colors for each vertex
          const t1 = i / positions.length;
          const t2 = j / positions.length;
          const color1 = COLORS.cyan.clone().lerp(COLORS.purple, t1);
          const color2 = COLORS.cyan.clone().lerp(COLORS.purple, t2);

          lineColors.push(color1.r, color1.g, color1.b);
          lineColors.push(color2.r, color2.g, color2.b);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    geo.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));

    return { geometry: geo, colors: lineColors };
  }, [positions]);

  // Animate line opacity
  useFrame((state) => {
    if (reducedMotion || !linesRef.current) return;
    const material = linesRef.current.material as THREE.LineBasicMaterial;
    material.opacity = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={0.3} />
    </lineSegments>
  );
}

// Camera rig for mouse parallax effect
interface CameraRigProps {
  reducedMotion: boolean;
}

function CameraRig({ reducedMotion }: CameraRigProps) {
  const { camera } = useThree();
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion) return;

    // Subtle camera movement following mouse
    const targetX = mousePosition.current.x * 0.5;
    const targetY = mousePosition.current.y * 0.3;

    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main scene group with rotation
interface SceneGroupProps {
  children: React.ReactNode;
  reducedMotion: boolean;
}

function SceneGroup({ children, reducedMotion }: SceneGroupProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
  });

  return <group ref={groupRef}>{children}</group>;
}

// Inner scene content
function SceneContent({ reducedMotion }: { reducedMotion: boolean }) {
  const nodePositions = useMemo(() => generateNodePositions(NODE_COUNT), []);

  return (
    <>
      <CameraRig reducedMotion={reducedMotion} />
      <SceneGroup reducedMotion={reducedMotion}>
        {/* Data nodes */}
        {nodePositions.map((position, index) => (
          <DataNode
            key={index}
            position={position}
            index={index}
            reducedMotion={reducedMotion}
          />
        ))}
        {/* Connection lines */}
        <ConnectionLines positions={nodePositions} reducedMotion={reducedMotion} />
      </SceneGroup>
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
    </>
  );
}

// Main exported component
export default function DataFlowScene() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setIsWebGLSupported(!!gl);
    } catch {
      setIsWebGLSupported(false);
    }
  }, []);

  if (!isWebGLSupported) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <SceneContent reducedMotion={prefersReducedMotion} />
      </Canvas>
    </div>
  );
}

// Export WebGL check for use in HeroBackground
export function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

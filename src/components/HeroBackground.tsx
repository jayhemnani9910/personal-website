"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { GradientOrb } from "./GradientOrb";

// Dynamically import DataFlowScene with no SSR
const DataFlowScene = dynamic(
  () => import("./three/DataFlowScene"),
  {
    ssr: false,
    loading: () => <GradientOrb />,
  }
);

export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion();
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean | null>(null);

  // Check WebGL support on client
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

  // Show nothing while checking (brief flash prevention)
  if (isWebGLSupported === null) {
    return <GradientOrb />;
  }

  // Fall back to GradientOrb if WebGL not supported or user prefers reduced motion
  if (!isWebGLSupported || prefersReducedMotion) {
    return <GradientOrb />;
  }

  // Render 3D scene
  return <DataFlowScene />;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface MousePositionContextType {
  mousePosition: MousePosition;
}

const MousePositionContext = createContext<MousePositionContextType | undefined>(
  undefined
);

export const MousePositionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
        document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
        rafRef.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <MousePositionContext.Provider value={{ mousePosition }}>
      {children}
    </MousePositionContext.Provider>
  );
};

export const useMousePosition = () => {
  const context = useContext(MousePositionContext);
  if (context === undefined) {
    throw new Error(
      "useMousePosition must be used within a MousePositionProvider"
    );
  }
  return context;
};

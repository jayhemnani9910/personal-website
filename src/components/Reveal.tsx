"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface RevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    className?: string;
    stagger?: boolean;
}

export function Reveal({ children, width = "fit-content", delay = 0.25, className = "", stagger = false }: RevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 60, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{
                    duration: 0.8,
                    delay,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}

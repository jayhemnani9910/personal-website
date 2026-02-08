"use client";

import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { useRef, ReactNode, Children } from "react";

type RevealVariant = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "scale" | "blur";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
  /** @deprecated Use className with width styles instead */
  width?: "fit-content" | "100%";
}

const variants: Record<RevealVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.6,
  stagger = 0,
  className = "",
  once = true,
  width,
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  // Build style object for backward compatibility with width prop
  const style = width ? { width } : undefined;

  if (prefersReducedMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  // If stagger is set, wrap each child
  if (stagger > 0) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
        }}
        className={className}
        style={style}
      >
        {Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={variants[variant]}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={variants[variant]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Export container for manual stagger control
export function RevealContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className = ""
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Export a RevealItem for use within RevealContainer
export function RevealItem({
  children,
  variant = "fadeUp",
  duration = 0.6,
  className = "",
}: {
  children: ReactNode;
  variant?: RevealVariant;
  duration?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants[variant]}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

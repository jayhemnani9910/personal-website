/**
 * Motion System - Project AETHER
 * 
 * Centralized motion tokens for Framer Motion.
 * Provides consistent animation feel across the entire site.
 * 
 * Usage:
 *   import { MOTION, getMotionProps, useMotion } from '@/lib/motion';
 *   
 *   <motion.div {...getMotionProps('fadeInUp', prefersReducedMotion)} />
 */

import { Variants, Transition } from "framer-motion";

// ============================================================================
// DURATIONS
// ============================================================================
export const DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  cinematic: 0.8,
  glacial: 1.2,
} as const;

// ============================================================================
// EASINGS
// ============================================================================
export const EASINGS = {
  /** Standard ease-out for most animations */
  easeOut: [0.25, 0.1, 0.25, 1] as const,
  /** Smooth ease-in-out for emphasis */
  easeInOut: [0.42, 0, 0.58, 1] as const,
  /** Apple-style cubic-bezier */
  apple: [0.25, 0.46, 0.45, 0.94] as const,
  /** Snappy deceleration */
  decel: [0.0, 0.0, 0.2, 1] as const,
} as const;

// ============================================================================
// SPRING PRESETS
// ============================================================================
export const SPRINGS = {
  /** Default spring - balanced feel */
  default: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  /** Stiff spring - snappy interactions */
  stiff: {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 0.8,
  },
  /** Soft spring - gentle movements */
  soft: {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
  },
  /** Magnetic spring - for hover effects */
  magnetic: {
    type: "spring" as const,
    stiffness: 150,
    damping: 15,
    mass: 0.1,
  },
  /** Bouncy spring - playful */
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 10,
    mass: 1,
  },
  /** Slow spring - cinematic reveals */
  slow: {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
    mass: 1.5,
  },
} as const;

// ============================================================================
// TWEEN PRESETS
// ============================================================================
export const TWEENS = {
  smooth: {
    type: "tween" as const,
    duration: DURATIONS.normal,
    ease: EASINGS.easeOut,
  } as Transition,
  cinematic: {
    type: "tween" as const,
    duration: DURATIONS.cinematic,
    ease: EASINGS.apple,
  } as Transition,
  instant: {
    type: "tween" as const,
    duration: DURATIONS.instant,
  } as Transition,
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
export const VARIANTS = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,
  
  fadeInUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 24 },
  } as Variants,
  
  fadeInDown: {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -24 },
  } as Variants,

  /** Subtle fade with small upward slide - matches CSS @keyframes fadeSlideUp */
  fadeSlideUp: {
    hidden: { opacity: 0, y: 10 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay },
    }),
  } as Variants,

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  } as Variants,
  
  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  } as Variants,
  
  // Slide animations
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  } as Variants,
  
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  } as Variants,
  
  // Container (for staggered children)
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  } as Variants,
  
  staggerContainerFast: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  } as Variants,
  
  staggerContainerSlow: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } as Variants,
} as const;

// ============================================================================
// HOVER/TAP PRESETS
// ============================================================================
export const INTERACTIONS = {
  /** Subtle lift on hover */
  hoverLift: {
    whileHover: { y: -2, transition: SPRINGS.stiff },
    whileTap: { scale: 0.98 },
  },
  
  /** Scale up on hover */
  hoverScale: {
    whileHover: { scale: 1.02, transition: SPRINGS.stiff },
    whileTap: { scale: 0.98 },
  },
  
  /** Glow effect on hover (use with appropriate CSS) */
  hoverGlow: {
    whileHover: {
      boxShadow: "0 0 24px rgba(0, 240, 255, 0.2)",
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  
  /** Button press */
  buttonPress: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.95 },
  },
  
  /** Card hover */
  cardHover: {
    whileHover: {
      y: -4,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
      transition: SPRINGS.default,
    },
  },
} as const;

// ============================================================================
// REDUCED MOTION UTILITIES
// ============================================================================

/**
 * Get motion props with reduced motion support.
 * Returns empty animation for users who prefer reduced motion.
 * 
 * @param variant - The variant name from VARIANTS
 * @param prefersReducedMotion - From useReducedMotion()
 * @param options - Additional options like delay
 */
export function getMotionProps(
  variant: keyof typeof VARIANTS,
  prefersReducedMotion: boolean | null,
  options: { delay?: number; transition?: Transition } = {}
) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: VARIANTS[variant].animate,
      transition: { duration: 0 },
    };
  }
  
  return {
    variants: VARIANTS[variant],
    initial: "initial",
    animate: "animate",
    exit: "exit",
    transition: options.transition || { ...SPRINGS.default, delay: options.delay },
  };
}

/**
 * Get viewport animation props for scroll-triggered animations.
 */
export function getViewportProps(
  variant: keyof typeof VARIANTS,
  prefersReducedMotion: boolean | null,
  options: { 
    once?: boolean; 
    margin?: string;
    delay?: number;
  } = {}
) {
  const { once = true, margin = "-100px", delay = 0 } = options;
  
  if (prefersReducedMotion) {
    return {
      initial: false,
      whileInView: VARIANTS[variant].animate,
      viewport: { once },
      transition: { duration: 0 },
    };
  }
  
  return {
    variants: VARIANTS[variant],
    initial: "initial",
    whileInView: "animate",
    viewport: { once, margin },
    transition: { ...SPRINGS.default, delay },
  };
}

// ============================================================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================================================
export const springStiff = SPRINGS.stiff;
export const springSoft = SPRINGS.soft;
export const springMagnetic = SPRINGS.magnetic;
export const hoverScale = INTERACTIONS.hoverScale.whileHover;
export const hoverGlow = INTERACTIONS.hoverGlow.whileHover;

// Re-export for convenience
export const TRANSITIONS = {
  spring: SPRINGS.default,
  smooth: TWEENS.smooth,
} as const;

export type VariantName = keyof typeof VARIANTS;
export type SpringName = keyof typeof SPRINGS;
export type DurationName = keyof typeof DURATIONS;


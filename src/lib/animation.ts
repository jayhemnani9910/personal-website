export const springStiff = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
} as const;

export const springSoft = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    mass: 1
} as const;

export const springMagnetic = {
    type: "spring",
    stiffness: 150,
    damping: 15,
    mass: 0.1
} as const;

export const hoverScale = {
    scale: 1.02,
    transition: springStiff
};

export const hoverGlow = {
    boxShadow: "0 0 20px rgba(0, 240, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.2)"
};

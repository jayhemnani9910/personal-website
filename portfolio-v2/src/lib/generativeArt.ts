/**
 * Generative Art Library for Project AETHER
 * 
 * Creates deterministic visual backgrounds for backend engineering projects
 * that typically lack screenshots. Each project gets a unique gradient seeded
 * by its ID, ensuring consistency across renders.
 */

/**
 * Generate a deterministic linear gradient based on a string seed (project ID).
 * 
 * @param seed - Unique identifier (e.g., project ID)
 * @returns CSS linear-gradient string
 */
export function generateProjectGradient(seed: string): string {
    // Simple hash function to convert string to number
    const hash = seed.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Generate hue values (0-360) deterministically
    const hue1 = Math.abs(hash % 360);
    const hue2 = Math.abs((hash * 2) % 360);
    const hue3 = Math.abs((hash * 3) % 360);

    // Determine gradient angle based on seed length
    const angle = (seed.length * 45) % 360;

    // Create a linear gradient with deep, saturated colors
    return `linear-gradient(
    ${angle}deg,
    hsl(${hue1}, 70%, 30%) 0%,
    hsl(${hue2}, 60%, 25%) 50%,
    hsl(${hue3}, 65%, 20%) 100%
  )`;
}

/**
 * Generate a radial gradient pattern with noise-like effect.
 * Alternative style for different project types.
 * 
 * @param seed - Unique identifier (e.g., project ID)
 * @returns CSS radial-gradient string
 */
export function generateRadialPattern(seed: string): string {
    const hash = seed.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = Math.abs(hash % 360);
    const saturation = 60 + Math.abs(hash % 20);

    // Position the gradient center pseudo-randomly
    const centerX = 30 + (Math.abs(hash % 40));
    const centerY = 30 + (Math.abs((hash * 2) % 40));

    return `radial-gradient(
    circle at ${centerX}% ${centerY}%,
    hsla(${hue}, ${saturation}%, 40%, 0.3) 0%,
    hsla(${hue + 30}, ${saturation - 10}%, 30%, 0.2) 40%,
    transparent 70%
  )`;
}

/**
 * Generate a multi-layer gradient combining linear and radial for complexity.
 * 
 * @param seed - Unique identifier
 * @returns CSS background string with multiple layers
 */
export function generateComplexGradient(seed: string): string {
    const linear = generateProjectGradient(seed);
    const radial = generateRadialPattern(seed + "_overlay");

    return `${radial}, ${linear}`;
}

/**
 * Get a gradient style based on project category/tags.
 * Different visual styles for different engineering domains.
 * 
 * @param seed - Project ID
 * @param tags - Array of project tags
 * @returns CSS gradient string
 */
export function getProjectGradientByType(seed: string, tags: string[] = []): string {
    // Data/Analytics projects: Cool blues and purples
    if (tags.some(tag => ['analytics', 'data', 'warehouse', 'etl'].includes(tag.toLowerCase()))) {
        return generateProjectGradient(seed);
    }

    // ML/AI projects: Purple and magenta tones
    if (tags.some(tag => ['ml', 'ai', 'neural', 'learning'].includes(tag.toLowerCase()))) {
        const angle = (seed.length * 45) % 360;
        return `linear-gradient(${angle}deg, hsl(280, 70%, 30%), hsl(320, 60%, 25%), hsl(260, 65%, 20%))`;
    }

    // Streaming/Real-time: Cyan and electric blue
    if (tags.some(tag => ['streaming', 'kafka', 'realtime', 'live'].includes(tag.toLowerCase()))) {
        const angle = (seed.length * 45) % 360;
        return `linear-gradient(${angle}deg, hsl(190, 70%, 30%), hsl(200, 60%, 25%), hsl(210, 65%, 20%))`;
    }

    // Default: Use standard generative gradient
    return generateProjectGradient(seed);
}

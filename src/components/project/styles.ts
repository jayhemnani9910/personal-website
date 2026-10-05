// Class strings and helpers shared by the project page (a server component)
// and its client islands, so a token change is made once.
export const MONO = "font-[family-name:var(--ff-mono)]";
export const SHELL = "px-[clamp(1rem,4vw,2rem)]";
export const WRAP = "mx-auto max-w-[1280px]";
export const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";
export const LABEL = `${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`;

export const pad = (n: number) => String(n).padStart(2, "0");

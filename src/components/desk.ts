// The Desk design's shared class strings (ADR 0018), so every page draws the
// same card, pill and label from one place and a token change is made once.

export const MONO = "font-mono";
export const HAND_FONT = "font-hand";

/** The page column: 1200px, the home page's width, so every route lines up. */
export const WRAP = "mx-auto max-w-[1200px]";
export const SHELL = "px-[clamp(16px,4vw,48px)]";

/** An inner page's title: a label, smaller than the home page's statement. */
export const H1 =
  "text-[length:var(--tr-t-display-sm)] font-extrabold leading-[var(--tr-lh-display)] tracking-[-0.035em] text-tr-text [text-wrap:balance]";
export const H2 = "text-[length:var(--tr-t-h2)] font-extrabold leading-[var(--tr-lh-h2)] tracking-[-0.035em] text-tr-text";
/** The phrase in a title that sits on a butter highlight. */
export const HIGHLIGHT = "desk-hl rounded-[6px] bg-tr-butter px-[0.12em] [box-decoration-break:clone]";
export const LEDE = "text-[17px] leading-[var(--tr-lh-body)] text-tr-text-mute [text-wrap:pretty]";
/** Mono kicker above a title, e.g. "/work · 2019 → 2026". */
export const KICKER = "font-mono text-[13px] text-tr-text-faint";
export const LABEL = "font-mono text-[11px] uppercase tracking-[0.08em] text-tr-text-faint";
/** The page's one handwritten aside: Caveat at 24px, the large-text floor for tomato. */
export const HAND = "font-hand text-[24px] leading-[var(--tr-lh-hand)] text-tr-accent-hand";

export const CARD = "rounded-[var(--tr-r-xl)] border-[1.5px] border-tr-hairline bg-tr-surface-1";
/** Adds the springy hover lift and the hard shadow (globals.css). */
export const CARD_HOVER = "desk-card";
export const INK_PANEL = "ink-panel rounded-[var(--tr-r-2xl)] bg-tr-text text-tr-on-ink";

export const PILL =
  "inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-tr-hairline bg-tr-surface-1 px-3 py-1.5 font-mono text-[12px] text-tr-text hover:text-tr-text";
// Important, so it wins over PILL's card background when both are applied.
export const PILL_ACTIVE = "bg-tr-butter! shadow-[2px_2px_0_var(--tr-text)]";

export const BTN =
  "desk-press inline-flex items-center gap-2 rounded-[var(--tr-r-md)] border-[1.5px] border-tr-hairline bg-tr-surface-1 px-4 py-2.5 font-semibold text-tr-text shadow-[var(--tr-shadow-btn)] hover:text-tr-text";
export const BTN_PRIMARY =
  "desk-press inline-flex items-center gap-2 rounded-[var(--tr-r-md)] border-[1.5px] border-tr-hairline bg-tr-accent px-4 py-2.5 font-bold text-tr-on-accent shadow-[var(--tr-shadow-btn)] hover:bg-tr-accent-hover hover:text-tr-on-accent";

/** Tech tags and inline code: a paper chip. */
export const CHIP = "inline-block rounded-[var(--tr-r-sm)] bg-tr-surface-2 px-2 py-[3px] font-mono text-[11px] text-tr-text";

/** The six dot colours, cycled by index. */
export const DOTS = [
  "var(--tr-accent)",
  "var(--tr-butter)",
  "var(--tr-sky)",
  "var(--tr-mint)",
  "var(--tr-lilac)",
  "var(--tr-pink)",
];
export const DOT = "inline-block size-3.5 shrink-0 rounded-full border-[1.5px] border-tr-hairline";

export const pad = (n: number) => String(n).padStart(2, "0");

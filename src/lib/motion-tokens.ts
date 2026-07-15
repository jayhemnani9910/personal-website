// Two Readers motion values, kept in sync with the --tr-ease / --tr-dur-*
// custom properties in globals.css so framer-motion and CSS animate on the
// same numbers. No variants library here on purpose — see globals.css for
// the CSS side of these tokens.
export const EASE = [0.16, 1, 0.3, 1] as const; // matches --tr-ease
export const DUR = { fast: 0.15, base: 0.3, slow: 0.6 } as const; // seconds, for framer-motion
export const STAGGER = 0.04 as const;

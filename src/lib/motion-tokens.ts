// Motion values. EASE and DUR.base match --tr-ease and
// --tr-dur-base in globals.css, so framer-motion and CSS animate on the same
// numbers; DUR.slow is used by framer-motion only. No variants library here on purpose — see globals.css for
// the CSS side of these tokens.
export const EASE = [0.16, 1, 0.3, 1] as const; // matches --tr-ease
export const DUR = { base: 0.3, slow: 0.6 } as const; // seconds, for framer-motion

// Two Readers motion values. EASE and DUR.base match --tr-ease and
// --tr-dur-base in globals.css, so framer-motion and CSS animate on the same
// numbers; DUR.slow is used by framer-motion only. No variants library here on purpose — see globals.css for
// the CSS side of these tokens.
export const EASE = [0.16, 1, 0.3, 1] as const; // matches --tr-ease
export const DUR = { base: 0.3, slow: 0.6 } as const; // seconds, for framer-motion
// How far inside the bottom of the viewport a home section must be before it
// reveals. Buddy's handover uses the same inset, so he never lands on a rule
// that is still at opacity 0.
export const REVEAL_INSET = "-12%";

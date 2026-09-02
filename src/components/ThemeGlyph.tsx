/**
 * The theme toggle's glyph, chosen by CSS rather than by JavaScript.
 *
 * The theme lives in localStorage and is applied by the anti-flash script in
 * layout.tsx, so the server has no way to know it and always rendered the dark
 * glyph. Every light-theme visitor therefore hit a React hydration error on
 * every page: server text `◐`, client text `◑`, which React reports as #418 and
 * recovers from by throwing away and re-rendering that subtree.
 *
 * Rendering both and letting an attribute selector pick one has no such
 * mismatch, because the markup is identical on both sides. `data-theme` is set
 * before first paint, so the right glyph is the only one ever painted.
 *
 * Decorative: the button that wraps this carries `aria-label="Toggle theme"`.
 */
export function ThemeGlyph() {
  return (
    <>
      <span aria-hidden="true" className="[[data-theme=light]_&]:hidden">
        ◐
      </span>
      <span aria-hidden="true" className="hidden [[data-theme=light]_&]:inline">
        ◑
      </span>
    </>
  );
}

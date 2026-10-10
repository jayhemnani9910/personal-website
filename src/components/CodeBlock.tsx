import type { CodeSnippet } from "@/lib/definitions";

// An ink panel, like every code sample on the site: on-ink text on the ink
// token, so the page's palette and the code's stay one set of values.
// The scroll shade on an ink panel: ink to cover it, a butter edge to see it.
export const INK_HINT = "[--hint-bg:var(--tr-text)] [--hint-edge:color-mix(in_srgb,var(--tr-butter)_45%,transparent)]";

export function CodeBlock({ snippet }: { snippet: CodeSnippet }) {
  const title = snippet.title || snippet.label || 'Code';
  const language = snippet.language || '';
  const explanation = snippet.explanation;

  return (
    <div className="ink-panel overflow-hidden rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-on-ink-line bg-tr-text text-tr-on-ink">
      <div className="flex items-center justify-between gap-3 border-b border-tr-on-ink-line px-4 py-2.5 font-mono text-[12px] text-tr-on-ink-mute">
        <span>{title}</span>
        {language && <span>{language}</span>}
      </div>
      {/* Scrolls sideways, so it is a named, focusable region: Chromium makes a
          scroller focusable by itself, Safari does not. The ring is drawn
          inside because the card's overflow-hidden clips anything outside. */}
      <pre tabIndex={0} role="region" aria-label={title} className={`overflow-x-auto p-4 text-[12.5px] leading-[var(--tr-lh-body)] focus-visible:-outline-offset-2 scroll-hint ${INK_HINT}`}>
        <code className="whitespace-pre font-mono">{snippet.code}</code>
      </pre>
      {explanation && (
        <div className="border-t border-tr-on-ink-line px-4 py-3">
          <p className="text-[13px] leading-normal text-tr-on-ink-mute">{explanation}</p>
        </div>
      )}
    </div>
  );
}

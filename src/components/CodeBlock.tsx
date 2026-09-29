import type { CodeSnippet } from "@/lib/definitions";

// Built on the --tr-* tokens, so a code sample follows the theme like the rest
// of the page (it used to be a fixed GitHub-dark slab inside the light theme).
export function CodeBlock({ snippet }: { snippet: CodeSnippet }) {
  const title = snippet.title || snippet.label || 'Code';
  const language = snippet.language || '';
  const explanation = snippet.explanation;

  return (
    <div className="overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-surface-2">
      <div className="flex items-center justify-between border-b border-tr-hairline bg-tr-surface-1 px-4 py-2">
        <span className="font-mono text-xs text-tr-text-mute">{title}</span>
        {language && <span className="font-mono text-xs text-tr-text-mute">{language}</span>}
      </div>
      {/* Scrollable, so browsers make it keyboard-focusable; the ring is drawn
          inside because the card's overflow-hidden clips anything outside. */}
      <pre className="overflow-x-auto p-4 text-sm focus-visible:-outline-offset-2">
        <code className="whitespace-pre font-mono text-tr-text">{snippet.code}</code>
      </pre>
      {explanation && (
        <div className="border-t border-tr-hairline bg-tr-surface-1 px-4 py-3">
          <p className="text-sm text-tr-text-mute">{explanation}</p>
        </div>
      )}
    </div>
  );
}

import type { CodeSnippet } from "@/lib/definitions";

export function CodeBlock({ snippet }: { snippet: CodeSnippet }) {
  const title = snippet.title || snippet.label || 'Code';
  const language = snippet.language || '';
  const explanation = snippet.explanation;

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--border)] bg-[#0d1117]">
      <div className="px-4 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] font-mono">{title}</span>
        {language && <span className="text-xs text-[var(--text-muted)] font-mono opacity-60">{language}</span>}
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-[#e6edf3] font-mono whitespace-pre">{snippet.code}</code>
      </pre>
      {explanation && (
        <div className="px-4 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)]">{explanation}</p>
        </div>
      )}
    </div>
  );
}

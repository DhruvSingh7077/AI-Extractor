export default function Header({ title }) {
  return (
    <header className="px-6 py-3.5 border-b border-border bg-surface flex items-center justify-between flex-shrink-0">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-xs text-muted mt-0.5">Ask anything · Upload docs for RAG</p>
      </div>
      <div className="flex gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-accent/40 text-accent2 bg-accent/8">
          Gemini 2.0
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/40 text-green-300 bg-green-500/8">
          RAG · pgvector
        </span>
      </div>
    </header>
  )
}

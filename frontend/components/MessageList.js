'use client'

const CHIPS = [
  'Explain how RAG pipelines work',
  'What is pgvector used for?',
  'How does LangGraph manage state?',
  'Summarize an uploaded document',
]

export default function MessageList({ messages, loading, user, onChip }) {
  const initial = user?.username?.[0]?.toUpperCase() || 'U'

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 overflow-y-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent2/20 border border-accent/30 flex items-center justify-center text-3xl">
          ✦
        </div>
        <h3 className="text-xl font-semibold tracking-tight">What can I help you with?</h3>
        <p className="text-sm text-muted max-w-xs text-center leading-relaxed">
          Ask questions, upload PDFs for document Q&A, or explore the RAG pipeline.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {CHIPS.map(c => (
            <button key={c} onClick={() => onChip?.(c)}
              className="px-3.5 py-2 bg-surface border border-border rounded-full text-xs text-slate-300 hover:border-accent hover:text-accent2 transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      {messages.map((m, i) => (
        <div key={i} className={`flex gap-3 max-w-3xl fade-in ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>

          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
            m.role === 'user'
              ? 'bg-gradient-to-br from-accent to-accent2 text-white font-semibold text-xs'
              : 'bg-surface border border-border'
          }`}>
            {m.role === 'user' ? initial : '✦'}
          </div>

          {/* Bubble */}
          <div className={`flex flex-col gap-1 max-w-[calc(100%-3rem)] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
              m.role === 'user'
                ? 'bg-[#1e1b4b] border border-accent/30 rounded-br-sm'
                : 'bg-surface border border-border rounded-bl-sm'
            }`}>
              {m.content}
            </div>
            <div className="text-xs text-muted px-1 flex gap-2">
              {m.time && <span>{m.time}</span>}
              {m.tokens > 0 && <span>· {m.tokens} tokens</span>}
            </div>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {loading && (
        <div className="flex gap-3 max-w-3xl fade-in">
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-sm flex-shrink-0">✦</div>
          <div className="px-4 py-3.5 bg-surface border border-border rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      )}
    </div>
  )
}

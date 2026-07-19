'use client'
import { MessageSquare, Plus, LogOut } from 'lucide-react'

export default function Sidebar({ sessions, currentSessionId, onNewChat, onSelectSession, user, onLogout }) {
  const initial = user?.username?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="w-64 min-w-64 bg-surface border-r border-border flex flex-col h-screen">

      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-base">🤖</div>
          <span className="text-sm font-semibold">AI<span className="text-accent2">Chat</span></span>
        </div>
        <button onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={15} /> New Conversation
        </button>
      </div>

      {/* Sessions */}
      <div className="px-2 pt-3 pb-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-widest text-muted mb-1">Recent</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-muted">No conversations yet</p>
        ) : (
          sessions.map(s => (
            <button key={s.id} onClick={() => onSelectSession(s.id, s.title)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors mb-0.5 ${
                s.id === currentSessionId
                  ? 'bg-accent/15 text-white'
                  : 'text-slate-300 hover:bg-border'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.id === currentSessionId ? 'bg-accent2' : 'bg-muted'}`} />
              <span className="truncate">{s.title || 'New Conversation'}</span>
            </button>
          ))
        )}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.email || ''}</p>
          </div>
          <button onClick={onLogout} title="Sign out"
            className="text-muted hover:text-red-400 transition-colors p-1 rounded">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}

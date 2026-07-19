'use client'
import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

export default function ChatInput({ onSend, onUpload, loading }) {
  const [text, setText] = useState('')
  const fileRef = useRef()

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    if (!text.trim() || loading) return
    onSend(text.trim())
    setText('')
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="px-6 pb-6 pt-3 bg-bg border-t border-border flex-shrink-0">
      <div className={`flex items-end gap-2 bg-surface border rounded-2xl px-4 py-3 transition-colors ${loading ? 'border-border' : 'border-border focus-within:border-accent'}`}>

        {/* Upload */}
        <button onClick={() => fileRef.current?.click()}
          className="text-muted hover:text-accent2 transition-colors mb-0.5 flex-shrink-0" title="Upload PDF">
          <Paperclip size={18} />
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={handleFile} />

        {/* Textarea */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message AIChatbot..."
          rows={1}
          disabled={loading}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none resize-none max-h-32 leading-relaxed disabled:opacity-50"
          style={{ height: 'auto' }}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px' }}
        />

        {/* Send */}
        <button onClick={submit} disabled={!text.trim() || loading}
          className="w-9 h-9 rounded-xl bg-accent hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0 mb-0.5">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={15} />
          }
        </button>
      </div>
      <p className="text-center text-xs text-muted mt-2">
        Enter to send · Shift+Enter for new line · Upload PDFs for document Q&A
      </p>
    </div>
  )
}

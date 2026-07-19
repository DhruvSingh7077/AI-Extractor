'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn, getUser, clearAuth } from '@/lib/auth'
import api from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import MessageList from '@/components/MessageList'
import ChatInput from '@/components/ChatInput'
import Header from '@/components/Header'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('New Conversation')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return }
    setUser(getUser())
    fetchSessions()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function fetchSessions() {
    try {
      const { data } = await api.get('/chatbot/chat-agent/sessions/')
      setSessions(data)
    } catch {}
  }

  async function loadSession(sessionId, title) {
    setCurrentSessionId(sessionId)
    setSessionTitle(title || 'Conversation')
    setMessages([])
    try {
      const { data } = await api.get(`/chatbot/chat-agent/history/${sessionId}/`)
      const mapped = data.map(m => ({
        role: m.role === 'human' ? 'user' : 'ai',
        content: m.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
      setMessages(mapped)
    } catch {}
  }

  function newChat() {
    setCurrentSessionId(null)
    setSessionTitle('New Conversation')
    setMessages([])
  }

  function logout() {
    clearAuth()
    router.replace('/login')
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return

    const userMsg = {
      role: 'user', content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const body = { message: text }
      if (currentSessionId) body.session_id = currentSessionId

      const { data } = await api.post('/chatbot/chat-agent/send/', body)

      setCurrentSessionId(data.session_id)

      const aiMsg = {
        role: 'ai', content: data.response,
        tokens: data.tokens_used,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
      fetchSessions()
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ ${errMsg}`, time: '' }])
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(file) {
    const fd = new FormData()
    fd.append('file', file)
    if (currentSessionId) fd.append('chat_session_id', currentSessionId)
    try {
      await api.post('/chatbot/documents/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `✅ **${file.name}** uploaded and indexed for RAG. You can now ask questions about this document.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '⚠️ File upload failed.', time: '' }])
    }
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={newChat}
        onSelectSession={loadSession}
        user={user}
        onLogout={logout}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={sessionTitle} />
        <MessageList messages={messages} loading={loading} user={user} />
        <div ref={bottomRef} />
        <ChatInput onSend={sendMessage} onUpload={uploadFile} loading={loading} />
      </div>
    </div>
  )
}

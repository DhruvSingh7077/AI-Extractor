'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', password2: '',
    first_name: '', last_name: '', username: ''
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

 async function handleLogin(e) {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const { data } = await api.post('/accounts/auth/login/', {
      email: form.email,
      password: form.password
    })

    console.log('LOGIN RESPONSE:', data)

    // Backend returns data.tokens.access inside data.data
    // const token = data?.data?.tokens?.access
    // const user = data?.data?.user
   const token = data?.data?.tokens?.access || data?.tokens?.access
const user = data?.data?.user || data?.user

    if (!token) {
      throw new Error('No access token returned from server')
    }

    saveAuth(token, user)

    console.log('Saved Token:', token)
    console.log('Saved User:', user)

    router.push('/chat')
  } catch (err) {
    console.error(err)

    const d = err.response?.data

    setError(
      d?.message ||
      d?.detail ||
      err.message ||
      'Invalid credentials'
    )
  } finally {
    setLoading(false)
  }
}

 async function handleRegister(e) {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    const { data } = await api.post('/accounts/auth/register/', {
      email: form.email,
      username: form.username || form.email.split('@')[0],
      password1: form.password,
      password2: form.password2,
      first_name: form.first_name,
      last_name: form.last_name,
    })

    // const token = data?.data?.tokens?.access
    // const user = data?.data?.user
    const token = data?.tokens?.access || data?.data?.tokens?.access
const user = data?.user || data?.data?.user

    if (!token) {
      throw new Error('No access token returned from server')
    }

    saveAuth(token, user)

    router.push('/chat')
  } catch (err) {
    const d = err.response?.data

    setError(
      d?.message ||
      Object.values(d?.errors || {}).flat().join(' ') ||
      err.message ||
      'Registration failed'
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-3xl mx-auto mb-4">🤖</div>
          <h1 className="text-2xl font-semibold tracking-tight">AIChatbot</h1>
          <p className="text-sm text-muted mt-1">Django · LangChain · pgvector · RAG</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-8">

          {/* Tabs */}
          <div className="flex gap-1 bg-bg rounded-xl p-1 mb-6">
            {['login','register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab===t ? 'bg-accent text-white' : 'text-muted hover:text-white'}`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-300 mb-4">
              {error}
            </div>
          )}

          {/* Login */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
              <SubmitBtn loading={loading}>Sign In →</SubmitBtn>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-3">
                <Field label="First Name" type="text" value={form.first_name} onChange={set('first_name')} placeholder="John" />
                <Field label="Last Name" type="text" value={form.last_name} onChange={set('last_name')} placeholder="Doe" />
              </div>
              <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
              <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
              <Field label="Confirm Password" type="password" value={form.password2} onChange={set('password2')} placeholder="••••••••" />
              <SubmitBtn loading={loading}>Create Account →</SubmitBtn>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Built with Django 6 · LangGraph · pgvector
        </p>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">{label}</label>
      <input {...props} required
        className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-sm text-white placeholder:text-muted outline-none focus:border-accent transition-colors" />
    </div>
  )
}

function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-2.5 bg-gradient-to-r from-accent to-accent2 rounded-lg text-sm font-semibold text-white mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
      {loading
        ? <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Loading…
          </span>
        : children}
    </button>
  )
}
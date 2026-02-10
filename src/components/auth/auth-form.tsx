"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface AuthFormProps {
  view: 'login' | 'signup'
}

export function AuthForm({ view }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    if (!supabase) {
      setError('Supabase is not configured. Please try again later.')
      setLoading(false)
      return
    }

    try {
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        router.push('/login?message=Check email to continue sign in process')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-md p-8 rounded-2xl shadow-2xl"
      style={{ background: 'var(--alg-white)', border: '1px solid var(--border-color)' }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--alg-text)' }}>
          {view === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {view === 'login'
            ? 'Enter your credentials to access your dashboard'
            : 'Sign up to start learning algorithms visually'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--alg-primary)' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none transition-colors focus:ring-2 focus:ring-offset-0"
            style={{
              background: 'var(--alg-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--alg-text)',
            }}
            placeholder="name@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5 ml-1" style={{ color: 'var(--alg-primary)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border outline-none transition-colors focus:ring-2 focus:ring-offset-0"
            style={{
              background: 'var(--alg-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--alg-text)',
            }}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold focus:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: 'var(--alg-secondary)' }}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {view === 'login' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {view === 'login' ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={view === 'login' ? '/signup' : '/login'}
            className="font-semibold transition-colors hover:opacity-90"
            style={{ color: 'var(--alg-secondary)' }}
          >
            {view === 'login' ? 'Sign Up' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  )
}

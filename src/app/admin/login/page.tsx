"use client"

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ArcaneNavigation from '@/components/arcane/ArcaneNavigation'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-900 text-white">
      <ArcaneNavigation />
      <Suspense fallback={<LoginPageFallback />}>
        <LoginPageContent />
      </Suspense>
    </div>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTarget = searchParams.get('redirect') ?? '/admin'
  const missingSecret = searchParams.get('reason') === 'missing-secret'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (missingSecret) {
      setError('Das Administrator-Passwort ist nicht konfiguriert. Bitte Umgebung prüfen.')
      return
    }

    if (!password.trim()) {
      setError('Bitte gib das Administrator-Passwort ein.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? 'Login fehlgeschlagen.')
      }

      router.replace(redirectTarget)
      router.refresh()
    } catch (loginError) {
      console.error('Admin login failed:', loginError)
      setError(loginError instanceof Error ? loginError.message : 'Login fehlgeschlagen.')
    } finally {
      setIsSubmitting(false)
      setPassword('')
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl shadow-purple-900/40 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.4em] text-purple-300">Administrator</p>
        <h1 className="mt-3 text-3xl font-semibold">ArcanePixels Login</h1>
        <p className="mt-2 text-sm text-purple-200">
          Zugang zum Control Center ist passwortgeschützt. Bitte gib das hinterlegte Passwort ein.
        </p>

        {missingSecret && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Das Administrator-Passwort ist derzeit nicht konfiguriert. Hinterlege die Umgebungsvariable
            <code className="mx-1 rounded bg-amber-500/20 px-1 py-0.5 text-xs">ADMIN_PASSWORD</code>
            und starte die Anwendung neu.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-widest text-purple-300">
              Passwort
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-3 w-full rounded-xl border border-purple-500/40 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-300"
              placeholder="••••••••"
              disabled={isSubmitting || missingSecret}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || missingSecret}
            className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Wird geprüft…' : 'Anmelden'}
          </button>

          <p className="text-center text-xs text-purple-200/80">
            Du wirst nach erfolgreichem Login weitergeleitet.
          </p>
        </form>
      </div>
    </main>
  )
}

function LoginPageFallback() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="rounded-3xl border border-white/10 bg-black/20 p-8 backdrop-blur">
        <div className="h-3 w-24 rounded-full bg-purple-400/30" />
        <div className="mt-4 h-8 w-48 rounded-full bg-purple-300/30" />
        <div className="mt-3 h-4 w-56 rounded-full bg-purple-200/30" />
        <div className="mt-8 space-y-4">
          <div className="h-12 w-full rounded-xl bg-purple-500/20" />
          <div className="h-12 w-full rounded-full bg-purple-500/30" />
        </div>
      </div>
    </main>
  )
}

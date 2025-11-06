'use client'

import { useActionState } from 'react'
import { signIn, type LoginState } from '@/app/(eventhub)/eventhub/actions/auth'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(signIn, initialState)

  return (
    <form
      action={formAction}
      className="flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-xl shadow-blue-900/30"
    >
      <h2 className="text-2xl font-semibold text-white">Login</h2>
      <p className="text-sm text-slate-300">
        Melde dich mit deinem EventHub-Account an, um das geschützte Dashboard aufzurufen.
      </p>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        E-Mail
        <input
          type="email"
          name="email"
          required
          className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-base text-white shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/40"
          placeholder="du@example.com"
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
        Passwort
        <input
          type="password"
          name="password"
          required
          minLength={6}
          className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-base text-white shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600/40"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </label>
      {state.error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-blue-500 px-6 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Anmeldung läuft…' : 'Anmelden'}
      </button>
    </form>
  )
}

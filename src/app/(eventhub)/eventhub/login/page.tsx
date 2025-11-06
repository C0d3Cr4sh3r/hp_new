import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LoginForm } from '@/components/eventhub/LoginForm'
import { getSessionUser } from '@/lib/session'

export default async function EventHubLoginPage() {
  const user = await getSessionUser()
  if (user) {
    redirect('/eventhub/dashboard')
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-10 text-center text-slate-100">
      <div className="space-y-4">
        <span className="text-xs uppercase tracking-[0.4em] text-blue-200/80">EventHub</span>
        <h1 className="text-3xl font-semibold text-white">Willkommen zurück</h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-300">
          Greife auf das geschützte EventHub-Dashboard zu, verwalte Inhalte und halte dein Team auf
          dem Laufenden.
        </p>
      </div>
      <LoginForm />
      <p className="text-xs text-slate-400">
        Noch keinen Zugang? Bitte kontaktiere eine Administratorin oder einen Administrator.
      </p>
      <Link
        href="/eventhub"
        className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-blue-200"
      >
        ← Zur EventHub-Übersicht
      </Link>
    </div>
  )
}

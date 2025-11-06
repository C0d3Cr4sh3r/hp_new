'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const links = [
  { name: 'Übersicht', href: '/eventhub' },
  { name: 'Funktionen', href: '/eventhub#features' },
  { name: 'Sicherheit', href: '/eventhub#security' },
  { name: 'Login', href: '/eventhub/login' },
  { name: 'Dashboard', href: '/eventhub/dashboard' },
]

export function EventHubNavigation() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-slate-950/80 backdrop-blur border border-slate-800/40 rounded-2xl px-4 py-3">
      <nav className="flex items-center justify-between">
        <Link
          href="/eventhub"
          className="text-xl font-semibold tracking-tight text-white hover:text-blue-200 transition"
        >
          EventHub
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
          {links.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-blue-300 transition">
              {link.name}
            </Link>
          ))}
        </div>
        <button
          className="md:hidden text-slate-100"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Navigation umschalten"
        >
          {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="mt-4 space-y-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900/80"
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

export function EventHubSecurity() {
  return (
    <section id="security" className="mt-20 grid gap-10 lg:grid-cols-2">
      <div className="rounded-3xl border border-blue-500/40 bg-blue-900/30 p-8 shadow-lg shadow-blue-900/30">
        <h3 className="text-2xl font-semibold text-white">Sicherheit & Sessions</h3>
        <p className="mt-4 text-sm md:text-base text-slate-100 leading-relaxed">
          Der Login bleibt integraler Bestandteil von EventHub. Wir setzen auf Supabase Auth und
          speichern Sessions über signierte Cookies. So können wir das Dashboard im selben Projekt
          betreiben, ohne den öffentlichen ArcanePixels-Bereich zu öffnen.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-blue-100">
          <li>• Serverseitige Überprüfung der Session in jedem geschützten View</li>
          <li>• Sofortige Weiterleitung auf das Dashboard nach erfolgreichem Login</li>
          <li>• Logout-Action, die Sessions sauber entfernt und auf die Übersicht zurückbringt</li>
          <li>• Flexible Erweiterung für Rollen und Berechtigungen</li>
        </ul>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
        <h3 className="text-2xl font-semibold text-white">Getrennte Erlebniswelten</h3>
        <p className="mt-4 text-sm md:text-base text-slate-200 leading-relaxed">
          Obwohl EventHub jetzt im selben Next.js Projekt lebt, behandeln wir Inhalte, Navigation und
          Deployments eigenständig. Nutzer:innen finden den Zugang bequem über die Hauptnavigation,
          bleiben nach dem Login jedoch komplett im EventHub-Kontext.
        </p>
        <div className="mt-6 grid gap-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4">
            <h4 className="text-lg font-semibold text-white">Eigenes Layout</h4>
            <p className="mt-2 text-slate-300">
              Ein angepasstes Layout sorgt für Wiedererkennung und passt sich dennoch an die neue
              Farbwelt des Projekts an.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4">
            <h4 className="text-lg font-semibold text-white">Gemeinsame Infrastruktur</h4>
            <p className="mt-2 text-slate-300">
              Deployment, Supabase und Env-Variablen werden gemeinsam genutzt, wodurch Wartung und
              Weiterentwicklung einfacher bleiben.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

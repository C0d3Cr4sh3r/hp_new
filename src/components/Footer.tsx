'use client';

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    {
      title: 'Projekt',
      items: [
        { name: 'GitHub Repository', href: 'https://github.com/C0d3Cr4sh3r/hp_new', external: true },
        { name: 'Issues', href: 'https://github.com/C0d3Cr4sh3r/hp_new/issues', external: true },
        { name: 'Pull Requests', href: 'https://github.com/C0d3Cr4sh3r/hp_new/pulls', external: true },
        { name: 'Releases', href: 'https://github.com/C0d3Cr4sh3r/hp_new/releases', external: true },
      ],
    },
    {
      title: 'Technologien',
      items: [
        { name: 'Next.js', href: 'https://nextjs.org', external: true },
        { name: 'TypeScript', href: 'https://typescriptlang.org', external: true },
        { name: 'Tailwind CSS', href: 'https://tailwindcss.com', external: true },
        { name: 'Vercel', href: 'https://vercel.com', external: true },
      ],
    },
    {
      title: 'Ressourcen',
      items: [
        { name: 'Dokumentation', href: 'https://github.com/C0d3Cr4sh3r/hp_new#readme', external: true },
        { name: 'MCP Protocol', href: 'https://modelcontextprotocol.io', external: true },
        { name: 'GitHub Actions', href: 'https://github.com/features/actions', external: true },
        { name: 'Dependabot', href: 'https://github.com/dependabot', external: true },
      ],
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <button
              onClick={scrollToTop}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-500 transition-all duration-200 mb-4"
            >
              HP New
            </button>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Ein modernes Webentwicklungsprojekt mit Next.js, TypeScript und 
              MCP-Integration für professionelle Anwendungen.
            </p>
            
            {/* Technology Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">Next.js 16</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">TypeScript</span>
              <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded">MCP</span>
            </div>
          </div>

          {/* Links Columns */}
          {links.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="text-slate-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1 group"
                    >
                      <span>{item.name}</span>
                      {item.external && (
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © {currentYear} HP New. Open Source unter MIT License.
            </div>
            
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/C0d3Cr4sh3r/hp_new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1"
              >
                <span>Star on GitHub</span>
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
              
              <a
                href="https://github.com/C0d3Cr4sh3r/hp_new/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1"
              >
                <span>Fork</span>
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Build Info */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <div className="text-xs text-slate-500 space-y-1">
            <div>Deployed with Vercel • Built with Next.js 16 • Powered by GitHub Actions</div>
            <div>Last updated: {new Date().toLocaleDateString('de-DE')}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
'use client';

import { 
  RocketLaunchIcon, 
  CogIcon, 
  ShieldCheckIcon, 
  CodeBracketIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Feature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  highlight?: boolean;
}

const features: Feature[] = [
  {
    icon: RocketLaunchIcon,
    title: 'Next.js 16 mit App Router',
    description: 'Modernste React-Framework-Version mit Server Components und optimierter Performance.',
    highlight: true,
  },
  {
    icon: CodeBracketIcon,
    title: 'TypeScript Integration',
    description: 'Vollständige TypeScript-Unterstützung für typsichere Entwicklung und bessere Developer Experience.',
  },
  {
    icon: BoltIcon,
    title: 'MCP Server Integration',
    description: 'Model Context Protocol Server für erweiterte AI-Integration und Automatisierung.',
    highlight: true,
  },
  {
    icon: CogIcon,
    title: 'Automatisierte CI/CD',
    description: 'GitHub Actions für kontinuierliche Integration, Tests und automatisches Deployment.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Sicherheit & Qualität',
    description: 'ESLint, Security Audits, Dependabot und Branch Protection für höchste Code-Qualität.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Vercel Deployment',
    description: 'Optimiertes Hosting auf Vercel mit Edge Functions und globalem CDN.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Moderne Technologien
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Entwickelt mit den neuesten Webstandards und Best Practices für 
            Performance, Sicherheit und Skalierbarkeit.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                feature.highlight 
                  ? 'bg-blue-100 dark:bg-blue-800' 
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                <feature.icon className={`w-6 h-6 ${
                  feature.highlight 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Technology Stack Details */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Vollständiger Technology Stack
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'React 19', version: 'Latest' },
              { name: 'Tailwind CSS', version: '3.x' },
              { name: 'ESLint', version: 'Latest' },
              { name: 'Node.js', version: '20.x' },
            ].map((tech, index) => (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{tech.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{tech.version}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
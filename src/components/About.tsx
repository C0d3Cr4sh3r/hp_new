'use client';

import { useState } from 'react';
import { CheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export function About() {
  const [activeTab, setActiveTab] = useState('project');

  const projectHighlights = [
    'Modern Next.js 16 mit App Router und Server Components',
    'Vollständige TypeScript-Integration für Type Safety',
    'Tailwind CSS für effizientes und responsives Design',
    'GitHub Actions CI/CD Pipeline für automatisierte Deployments',
    'MCP (Model Context Protocol) Server Integration',
    'Vercel Hosting mit Edge Functions und globaler Verfügbarkeit',
    'ESLint und Prettier für konsistente Code-Qualität',
    'Dependabot für automatische Dependency-Updates',
    'Comprehensive Security Auditing und Branch Protection',
  ];

  const mcpFeatures = [
    'Projektstruktur-Analyse und -Management',
    'Automatisierte Code-Qualitätsprüfungen',
    'Build-Status und Konfiguration Monitoring',
    'React Component Discovery und Analyse',
    'Dependency Management und Updates',
    'Performance Monitoring und Optimierung',
  ];

  return (
    <section id="about" className="py-20 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Über das Projekt
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            HP New ist ein modernes Webentwicklungsprojekt, das die neuesten Technologien 
            und Best Practices für professionelle Webentwicklung demonstriert.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 bg-white dark:bg-slate-900 rounded-lg p-2 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('project')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'project'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Projekt
          </button>
          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              activeTab === 'mcp'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            MCP Integration
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Content */}
          <div>
            {activeTab === 'project' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Enterprise-Ready Webentwicklung
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                  Dieses Projekt zeigt, wie moderne Webentwicklung mit Next.js, TypeScript 
                  und einer robusten CI/CD-Pipeline funktioniert. Es kombiniert Performance, 
                  Sicherheit und Developer Experience in einem professionellen Setup.
                </p>
                
                <div className="space-y-3">
                  {projectHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mcp' && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Model Context Protocol Server
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                  Der integrierte MCP-Server ermöglicht erweiterte Automatisierung und 
                  AI-gestützte Projektanalyse. Er bietet Tools für Projektmanagement, 
                  Code-Analyse und Performance-Monitoring.
                </p>
                
                <div className="space-y-3">
                  {mcpFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats/Metrics */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-lg">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Projekt-Metriken
            </h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">TypeScript</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">A+</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">16</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Next.js Version</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Uptime</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <a 
                href="https://github.com/C0d3Cr4sh3r/hp_new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                <span>GitHub Repository</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import { useState } from 'react';
import { 
  EnvelopeIcon, 
  CodeBracketIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export function Contact() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const contactOptions = [
    {
      id: 'github',
      icon: CodeBracketIcon,
      title: 'GitHub',
      description: 'Schaue dir den Source Code an, erstelle Issues oder trage bei',
      link: 'https://github.com/C0d3Cr4sh3r/hp_new',
      linkText: 'Zum Repository',
      color: 'bg-slate-900 hover:bg-slate-800',
    },
    {
      id: 'documentation',
      icon: DocumentTextIcon,
      title: 'Dokumentation',
      description: 'Detaillierte Anleitungen für Setup, Deployment und MCP-Integration',
      link: 'https://github.com/C0d3Cr4sh3r/hp_new#readme',
      linkText: 'Dokumentation lesen',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'contact',
      icon: EnvelopeIcon,
      title: 'Direkter Kontakt',
      description: 'Fragen zum Projekt, Kollaborationen oder technische Diskussionen',
      link: 'mailto:contact@example.com',
      linkText: 'Email senden',
      color: 'bg-green-600 hover:bg-green-700',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Kontakt & Zusammenarbeit
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Interessiert an dem Projekt? Möchtest du beitragen oder hast Fragen zur Implementierung? 
            Hier findest du verschiedene Wege, um in Kontakt zu treten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactOptions.map((option) => (
            <div
              key={option.id}
              className={`relative p-6 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                activeCard === option.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => setActiveCard(option.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <option.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {option.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {option.description}
              </p>
              
              <a
                href={option.link}
                target={option.link.startsWith('http') ? '_blank' : undefined}
                rel={option.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center gap-2 px-4 py-2 ${option.color} text-white rounded-lg font-medium transition-colors duration-200`}
              >
                <span>{option.linkText}</span>
                {option.link.startsWith('http') && (
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                )}
              </a>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Open Source Projekt
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                HP New ist ein Open Source Projekt, das als Referenz für moderne 
                Webentwicklung mit Next.js und TypeScript dient. Contributions, 
                Feedback und Diskussionen sind herzlich willkommen!
              </p>
              
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  MIT License
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  Contributors Welcome
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                  Active Development
                </span>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  100%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Open Source
                </div>
              </div>
              
              <a
                href="https://github.com/C0d3Cr4sh3r/hp_new/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                <CodeBracketIcon className="w-5 h-5" />
                <span>Fork on GitHub</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
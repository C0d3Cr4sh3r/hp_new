'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700 opacity-20" />
      
      {/* Content */}
      <div className={`relative z-10 max-w-6xl mx-auto px-6 text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HP New
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
          Moderne Webentwicklung mit <strong>Next.js</strong>, <strong>TypeScript</strong> und 
          innovativen Technologien wie <strong>MCP (Model Context Protocol)</strong>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button 
            onClick={scrollToFeatures}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Entdecke die Features
          </button>
          
          <a 
            href="https://github.com/C0d3Cr4sh3r/hp_new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors duration-200"
          >
            GitHub Repository
          </a>
        </div>
        
        {/* Tech Stack Icons */}
        <div className="flex flex-wrap justify-center gap-6 opacity-80">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Next.js 16</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">TypeScript</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-md">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">MCP Server</span>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <button 
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
      >
        <ChevronDownIcon className="w-8 h-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" />
      </button>
    </section>
  );
}
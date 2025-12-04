'use client';

import {
  CameraIcon,
  PhotoIcon,
  NewspaperIcon,
  BugAntIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface ArcaneFeature {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  href: string;
  color: string;
}

const arcaneFeatures: ArcaneFeature[] = [
  {
    icon: CameraIcon,
    title: 'Fotografie Portfolio',
    description: 'Professionelle Galerie mit Lightbox-Funktion und kategorisierten Sammlungen.',
    href: '/#screenshots',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: PhotoIcon,
    title: 'ShootingHub App',
    description: 'Mobile App für Zeit- und Projektmanagement bei Fotoshootings.',
    href: '/#shootinghub',
    color: 'from-rose-500 to-orange-500',
  },
  {
    icon: Cog6ToothIcon,
    title: 'Admin Control Center',
    description: 'Verwalte Downloads, Themes, Inhalte und veröffentliche News im Admin-Bereich.',
    href: '/admin',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: NewspaperIcon,
    title: 'News & Updates',
    description: 'Aktuelle Informationen zu neuen Projekten und App-Updates.',
    href: '/arcane/news',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: BugAntIcon,
    title: 'Bug Tracker',
    description: 'Feedback und Fehlermeldungen für die kontinuierliche Verbesserung.',
    href: '/arcane/bugs',
    color: 'from-amber-500 to-yellow-500',
  },
];

export function ArcanePixelsSection() {
  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <CameraIcon className="w-4 h-4 mr-2" />
            Photography Business Platform
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            ArcanePixels
          </h2>
          
          <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
            Professionelle Fotografie-Plattform mit TFP-Management, Event-Organisation 
            und Portfolio-Präsentation für kreative Fotografen.
          </p>

          <button
            onClick={() => handleNavigation('/')}
            className="inline-flex items-center px-8 py-4 bg-white text-purple-800 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Jetzt entdecken
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arcaneFeatures.map((feature, index) => (
            <div 
              key={index}
              onClick={() => handleNavigation(feature.href)}
              className="group p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-200 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-purple-100 leading-relaxed mb-4">
                {feature.description}
              </p>

              <div className="flex items-center text-purple-200 group-hover:text-white transition-colors duration-300">
                <span className="text-sm font-medium">Mehr erfahren</span>
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-white mb-2">50+</div>
            <div className="text-purple-200">Erfolgreiche TFP-Shootings</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-white mb-2">1000+</div>
            <div className="text-purple-200">Portfolio Bilder</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-white mb-2">25+</div>
            <div className="text-purple-200">Zufriedene Models</div>
          </div>
        </div>
      </div>
    </section>
  );
}
import Link from 'next/link'

export default function ArcaneHero() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              ArcanePixels
            </span>
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-purple-200 max-w-3xl mx-auto">
            Digital Art & Professional Photography
          </p>
          <p className="mt-4 text-lg text-purple-300 max-w-2xl mx-auto">
            Spezialisiert auf kreative Fotografie, TFP-Shootings und digitale Kunstwerke. 
            Entdecke unsere innovative TFP-Manager App für professionelle Fotoshootings.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="#portfolio"
              className="rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-purple-500 hover:to-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all"
            >
              Portfolio ansehen
            </Link>
            <Link
              href="#tfp-manager"
              className="text-sm font-semibold leading-6 text-purple-300 hover:text-purple-100 transition-colors"
            >
              TFP-Manager App <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </section>
  )
}
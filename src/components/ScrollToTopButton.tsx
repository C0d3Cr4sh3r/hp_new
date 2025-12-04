'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpIcon } from '@heroicons/react/24/outline'

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  const handleScroll = useCallback(() => {
    const offset = window.scrollY || document.documentElement.scrollTop || 0
    setIsVisible(offset > 320)
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Nach oben scrollen"
      className={`fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-xl transition-opacity duration-200 hover:from-purple-500 hover:to-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ArrowUpIcon className="h-6 w-6" aria-hidden="true" />
    </button>
  )
}

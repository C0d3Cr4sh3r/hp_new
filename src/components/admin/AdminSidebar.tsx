'use client'

import { useState } from 'react'
import {
  CloudArrowDownIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  PaintBrushIcon,
  BugAntIcon,
  PhotoIcon,
  SparklesIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  HomeIcon,
  DocumentTextIcon,
  SwatchIcon,
  ScaleIcon,
  MegaphoneIcon,
  Bars3Icon,
  XMarkIcon,
  Bars3BottomLeftIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'

export type AdminTabId =
  | 'dashboard'
  | 'news'
  | 'downloads'
  | 'landing'
  | 'landing-sections'
  | 'screenshots'
  | 'portfolio'
  | 'services'
  | 'theme-colors'
  | 'theme-footer'
  | 'theme-navigation'
  | 'settings-website'
  | 'settings-legal'
  | 'settings-hero'
  | 'settings-services'
  | 'settings-seo'
  | 'settings-grid'
  | 'assistant'
  | 'assistant-settings'
  | 'bugs'

type NavItem = {
  id: AdminTabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type NavGroup = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  // === ÜBERSICHT ===
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: HomeIcon,
    items: [{ id: 'dashboard', label: 'Übersicht', icon: HomeIcon }],
  },
  // === INHALTE & MEDIEN ===
  {
    id: 'content',
    label: 'Inhalte',
    icon: PencilSquareIcon,
    items: [
      { id: 'news', label: 'News & Changelog', icon: PencilSquareIcon },
      { id: 'downloads', label: 'Downloads', icon: CloudArrowDownIcon },
    ],
  },
  {
    id: 'media',
    label: 'Medien & Portfolio',
    icon: PhotoIcon,
    items: [
      { id: 'screenshots', label: 'Screenshots', icon: PhotoIcon },
      { id: 'portfolio', label: 'Portfolio', icon: BriefcaseIcon },
      { id: 'services', label: 'Services', icon: Cog6ToothIcon },
    ],
  },
  // === LANDING PAGE ===
  {
    id: 'landing',
    label: 'Landing Page',
    icon: Squares2X2Icon,
    items: [
      { id: 'settings-grid', label: 'Seitenbereiche', icon: Squares2X2Icon },
      { id: 'settings-hero', label: 'Hero-Bereich', icon: MegaphoneIcon },
      { id: 'settings-services', label: 'Services-Bereich', icon: BriefcaseIcon },
      { id: 'landing-sections', label: 'Dynamische Sections', icon: PencilSquareIcon },
      { id: 'landing', label: 'ShootingHub Content', icon: MegaphoneIcon },
    ],
  },
  // === DESIGN & LAYOUT ===
  {
    id: 'design',
    label: 'Design & Layout',
    icon: PaintBrushIcon,
    items: [
      { id: 'theme-colors', label: 'Farben & Theme', icon: SwatchIcon },
      { id: 'theme-navigation', label: 'Navigation', icon: Bars3BottomLeftIcon },
      { id: 'theme-footer', label: 'Footer', icon: DocumentTextIcon },
    ],
  },
  // === EINSTELLUNGEN ===
  {
    id: 'settings',
    label: 'Einstellungen',
    icon: Cog6ToothIcon,
    items: [
      { id: 'settings-website', label: 'Website-Infos', icon: HomeIcon },
      { id: 'settings-legal', label: 'Rechtliches', icon: ScaleIcon },
      { id: 'settings-seo', label: 'SEO', icon: DocumentTextIcon },
    ],
  },
  // === KI & TOOLS ===
  {
    id: 'ai',
    label: 'KI-Assistent',
    icon: SparklesIcon,
    items: [
      { id: 'assistant', label: 'Chat', icon: SparklesIcon },
      { id: 'assistant-settings', label: 'Einstellungen', icon: Cog6ToothIcon },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: BugAntIcon,
    items: [{ id: 'bugs', label: 'Bug Tracker', icon: BugAntIcon }],
  },
]

type AdminSidebarProps = {
  activeTab: AdminTabId
  onTabChange: (tab: AdminTabId) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(NAV_GROUPS.map((g) => g.id))
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const handleTabClick = (tabId: AdminTabId) => {
    onTabChange(tabId)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <nav className="space-y-1">
      {NAV_GROUPS.map((group) => {
        const isExpanded = expandedGroups.has(group.id)
        const hasActiveItem = group.items.some((item) => item.id === activeTab)

        return (
          <div key={group.id}>
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                hasActiveItem
                  ? 'bg-purple-500/20 text-purple-100'
                  : 'text-purple-300 hover:bg-purple-500/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <group.icon className="h-5 w-5" />
                {group.label}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-purple-500/30 pl-3">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-purple-500/30 text-white font-medium'
                        : 'text-purple-300 hover:bg-purple-500/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-purple-600 px-4 py-3 text-white shadow-lg lg:hidden"
      >
        {mobileOpen ? (
          <>
            <XMarkIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Schließen</span>
          </>
        ) : (
          <>
            <Bars3Icon className="h-5 w-5" />
            <span className="text-sm font-medium">Menü</span>
          </>
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-400">
            Navigation
          </h2>
          {sidebarContent}
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform overflow-y-auto border-r border-purple-500/30 bg-gradient-to-b from-purple-950 to-indigo-950 p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            Navigation
          </h2>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-purple-300 hover:bg-purple-500/20 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}

export { NAV_GROUPS }


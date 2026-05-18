'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/home', label: '흘려쓰기', icon: '✏️' },
  { href: '/tarot', label: '타로 방', icon: '🔮' },
  { href: '/history', label: '기록 흐름', icon: '🕰️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 border-t border-white/5 py-3 px-8 flex justify-around items-center backdrop-blur-sm">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-accentViolet' : 'text-white/40 hover:text-white'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium font-sans">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

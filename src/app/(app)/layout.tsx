import type { ReactNode } from 'react'
import StarsBackground from '@/components/ui/StarsBackground'
import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-midnight text-white">
      <StarsBackground />
      <main className="relative z-10 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

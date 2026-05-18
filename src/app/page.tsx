'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StarsBackground from '@/components/ui/StarsBackground'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('onboarded') === 'true') {
      router.replace('/home')
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return <div className="min-h-screen bg-midnight" />

  return (
    <div className="relative min-h-screen bg-midnight">
      <StarsBackground />
      <OnboardingFlow />
    </div>
  )
}

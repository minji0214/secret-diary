'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StarsBackground from '@/components/ui/StarsBackground'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('onboarded') === 'true') {
      router.replace('/home')
    }
  }, [router])

  return (
    <div className="relative min-h-screen bg-midnight">
      <StarsBackground />
      <OnboardingFlow />
    </div>
  )
}

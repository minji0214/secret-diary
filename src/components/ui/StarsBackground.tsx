// src/components/ui/StarsBackground.tsx
export default function StarsBackground() {
  return (
    <>
      <div className="fixed inset-0 stars z-0 pointer-events-none" />
      <div
        className="fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'rgba(138, 114, 214, 0.25)',
          filter: 'blur(140px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: 'rgba(59, 45, 84, 0.30)',
          filter: 'blur(140px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}

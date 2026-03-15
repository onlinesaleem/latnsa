'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
  language?: 'english' | 'arabic'
}

export default function SplashScreen({ onComplete, language = 'english' }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const isArabic = language === 'arabic'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'),  2500)
    const t3 = setTimeout(() => onComplete(),     3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#A31755',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.75s cubic-bezier(0.4,0,0.2,1)',
      opacity: phase === 'out' ? 0 : 1,
      pointerEvents: phase === 'out' ? 'none' : 'auto',
    }}>
      {/* Grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        opacity: 0.6, mixBlendMode: 'overlay',
      }} />
      {/* Rings */}
      {[640, 440, 270].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: s, height: s, borderRadius: '50%',
          border: `1px solid rgba(255,255,255,${0.05 + i * 0.03})`,
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2, animation: 'sReveal 0.85s cubic-bezier(0.16,1,0.3,1) 0.1s both', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '24px 52px', boxShadow: '0 20px 70px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 200, height: 80 }}>
            <Image src="/logo.png" alt="LaTnsa" fill style={{ objectFit: 'contain' }} priority />
          </div>
        </div>
        <div style={{ textAlign: 'center', animation: 'sReveal 0.85s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}>
          <p style={{ fontFamily: "'DM Serif Display',Georgia,serif", fontSize: 18, fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', marginBottom: 7, letterSpacing: '0.2px' }}>
            {isArabic ? 'نحن معك… حتى لا تنسى' : 'With you… so you never forget'}
          </p>
          <p style={{ fontFamily: "'Instrument Sans',system-ui,sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
            Memory Assessment System
          </p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 52, zIndex: 2, display: 'flex', gap: 9, alignItems: 'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: `sDot 1.4s ease-in-out ${i*0.22}s infinite` }} />
        ))}
      </div>

      <style jsx>{`
        @keyframes sReveal { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes sDot { 0%,80%,100%{opacity:0.25;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.2)} }
      `}</style>
    </div>
  )
}
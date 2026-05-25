import { useEffect, useState } from 'react'
import { Heart, Music, Sparkles } from 'lucide-react'

export default function Header() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const timeStr = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div
      className="relative overflow-hidden rounded-t-[28px] select-none"
      style={{
        background: 'linear-gradient(135deg, #FFB6D9 0%, #D4A5F5 50%, #A8D8F0 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.1)',
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      <div className="flex items-center justify-between px-6 py-4" style={{ paddingLeft: '80px' }}>
        {/* Left: Logo & Title */}
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white/40 rounded-2xl blur-md" />
            <div
              className="relative bg-white/80 backdrop-blur-sm p-2.5 rounded-2xl shadow-lg"
              style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 6px rgba(0,0,0,0.15)' }}
            >
              <Music className="w-6 h-6 text-pink-500" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1
              className="text-white font-bold"
              style={{ fontSize: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              Study Buddy
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-yellow-300 drop-shadow-sm" />
              <span className="text-xs text-white/90 drop-shadow-sm">Let's work together!</span>
            </div>
          </div>
        </div>

        {/* Right: Date & Time */}
        <div
          className="flex items-center gap-4"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/40 shadow-md">
            <div className="text-xs text-white/80 drop-shadow-sm mb-0.5">{dateStr}</div>
            <div
              className="text-lg font-bold text-white tabular-nums"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              {timeStr}
            </div>
          </div>
          <Heart className="w-5 h-5 text-red-400 fill-red-400 drop-shadow-md animate-pulse" />
        </div>
      </div>
    </div>
  )
}

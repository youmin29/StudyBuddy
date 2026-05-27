import { Palette, Check } from 'lucide-react'
import { useRef, useState } from 'react'
import { THEMES, useThemeStore } from '../store/useThemeStore'

export default function ThemePicker() {
  const { theme, setTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
    setIsOpen((v) => !v)
  }

  const handleSelect = (id: string) => {
    setTheme(id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        title="배경 테마 변경"
        className="flex items-center justify-center w-8 h-8 rounded-xl transition-all hover:bg-white/40"
        style={{
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <Palette className="w-4 h-4 text-white drop-shadow-sm" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="fixed z-40 rounded-2xl overflow-hidden"
            style={{
              top: dropdownPos.top,
              right: dropdownPos.right,
              background: 'linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 100%)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8)',
              border: '2px solid rgba(255,182,217,0.4)',
              width: '220px',
            }}
          >
            {/* 헤더 */}
            <div
              className="px-4 py-3 border-b border-pink-200/50"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.3))',
              }}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-purple-500" />
                <p className="text-sm font-bold text-purple-700">배경 테마</p>
              </div>
            </div>

            {/* 테마 목록 */}
            <div className="p-3 space-y-1.5">
              {THEMES.map((t) => {
                const isActive = theme.id === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: isActive
                        ? 'linear-gradient(to right, rgba(255,182,217,0.25), rgba(196,181,253,0.25))'
                        : 'rgba(255,255,255,0.6)',
                      border: isActive
                        ? '1.5px solid rgba(196,181,253,0.5)'
                        : '1.5px solid transparent',
                      boxShadow: isActive
                        ? 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 6px rgba(167,139,250,0.15)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                  >
                    {/* 그라데이션 스와치 */}
                    <div
                      className="w-8 h-8 rounded-xl flex-shrink-0 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${t.swatch[0]} 0%, ${t.swatch[1]} 50%, ${t.swatch[2]} 100%)`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)',
                      }}
                    />

                    {/* 이름 */}
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isActive ? 'text-purple-700' : 'text-purple-600'}`}>
                        {t.emoji} {t.name}
                      </p>
                    </div>

                    {/* 선택 체크 */}
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

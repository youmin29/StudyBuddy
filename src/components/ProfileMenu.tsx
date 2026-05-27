import { Cloud, LogOut, User, Check } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export default function ProfileMenu() {
  const { user, signOut } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (!user) return null

  const displayName = user.email?.split('@')[0] ?? 'User'

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-white/40"
        style={{
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <p className="text-xs font-medium text-white drop-shadow-sm max-w-[80px] truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-1">
            <Cloud className="w-2.5 h-2.5 text-white/80" />
            <p className="text-xs text-white/80 drop-shadow-sm">동기화됨</p>
          </div>
        </div>
      </button>

      {/* Dropdown — fixed 포지션으로 overflow:hidden 탈출 */}
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
              width: '240px',
            }}
          >
            {/* User Info */}
            <div
              className="px-4 py-3 border-b border-pink-200/50"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.3))',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-purple-700 truncate">{displayName}</p>
                  <p className="text-xs text-purple-400 truncate">{user.email}</p>
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background:
                    'linear-gradient(to right, rgba(168,216,240,0.2), rgba(167,139,250,0.2))',
                }}
              >
                <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-purple-600">클라우드 동기화 활성화</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  signOut()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 transition-all hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">로그아웃</span>
              </button>
            </div>

            {/* Footer */}
            <div
              className="px-4 py-3 border-t border-pink-200/50"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.5))',
              }}
            >
              <p className="text-xs text-center text-purple-400">
                모든 데이터가 안전하게 동기화됐어요 ☁️
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

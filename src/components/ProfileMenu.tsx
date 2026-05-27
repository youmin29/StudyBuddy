import { Cloud, LogOut, User, Check, Pencil, X, Palette, ChevronDown } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore, THEMES } from '../store/useThemeStore'

export default function ProfileMenu() {
  const { user, signOut, updateNickname } = useAuthStore()
  const { theme: currentTheme, setTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 닉네임 편집 상태
  const [isEditingNick, setIsEditingNick] = useState(false)
  const [nickDraft, setNickDraft] = useState('')
  const [nickError, setNickError] = useState('')
  const [nickSaving, setNickSaving] = useState(false)
  const nickInputRef = useRef<HTMLInputElement>(null)

  // 테마 아코디언
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  // 드롭다운 닫히면 서브메뉴도 닫기
  useEffect(() => {
    if (!isOpen) setShowThemeMenu(false)
  }, [isOpen])

  if (!user) return null

  const nickname = (user.user_metadata?.nickname as string | undefined)?.trim()
  const emailName = user.email?.split('@')[0] ?? 'User'
  const displayName = nickname || emailName

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 2,
        right: window.innerWidth - rect.right,
      })
    }
    setIsOpen(!isOpen)
    setIsEditingNick(false)
    setNickError('')
  }

  const startEdit = () => {
    setNickDraft(nickname ?? emailName)
    setNickError('')
    setIsEditingNick(true)
    setTimeout(() => nickInputRef.current?.focus(), 50)
  }

  const cancelEdit = () => {
    setIsEditingNick(false)
    setNickError('')
  }

  const saveNick = async () => {
    const trimmed = nickDraft.trim()
    if (!trimmed) { setNickError('닉네임을 입력해주세요'); return }
    if (trimmed.length > 20) { setNickError('20자 이내로 입력해주세요'); return }
    setNickSaving(true)
    const err = await updateNickname(trimmed)
    setNickSaving(false)
    if (err) { setNickError(err); return }
    setIsEditingNick(false)
    setNickError('')
  }

  const handleNickKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveNick()
    if (e.key === 'Escape') cancelEdit()
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
            background: 'linear-gradient(135deg, var(--t-avatar-a) 0%, var(--t-avatar-b) 100%)',
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

      {/* Dropdown */}
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
              width: '260px',
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
                    background: 'linear-gradient(135deg, var(--t-avatar-a) 0%, var(--t-avatar-b) 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  {isEditingNick ? (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          ref={nickInputRef}
                          type="text"
                          value={nickDraft}
                          onChange={(e) => setNickDraft(e.target.value)}
                          onKeyDown={handleNickKeyDown}
                          maxLength={20}
                          className="flex-1 min-w-0 px-2 py-1 text-sm rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-purple-700 font-bold"
                          style={{ background: 'white' }}
                        />
                        <button
                          onClick={saveNick}
                          disabled={nickSaving}
                          className="p-1 rounded-lg hover:bg-green-100 transition-all flex-shrink-0"
                          title="저장"
                        >
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 rounded-lg hover:bg-red-100 transition-all flex-shrink-0"
                          title="취소"
                        >
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                      {nickError && (
                        <p className="text-xs text-red-500">{nickError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 group/nick">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--t-text)' }}>{displayName}</p>
                      <button
                        onClick={startEdit}
                        className="p-0.5 rounded opacity-0 group-hover/nick:opacity-100 hover:bg-purple-100 transition-all flex-shrink-0"
                        title="닉네임 변경"
                      >
                        <Pencil className="w-3 h-3" style={{ color: 'var(--t-text-light)' }} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs truncate" style={{ color: 'var(--t-text-light)' }}>{user.email}</p>
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: 'linear-gradient(to right, rgba(168,216,240,0.2), rgba(167,139,250,0.2))',
                }}
              >
                <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <p className="text-xs" style={{ color: 'var(--t-text-soft)' }}>클라우드 동기화 활성화</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">

              {/* 테마 변경 (아코디언) */}
              <button
                onClick={() => setShowThemeMenu((v) => !v)}
                className="w-full px-4 py-2.5 flex items-center gap-3 transition-all hover:bg-white/60"
              >
                <Palette className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--t-c2)' }} />
                <span className="text-sm flex-1 text-left" style={{ color: 'var(--t-text)' }}>테마 변경</span>
                {/* 현재 테마 스와치 미리보기 */}
                <div className="flex gap-0.5 mr-1">
                  {currentTheme.swatch.map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <ChevronDown
                  className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: 'var(--t-text-light)',
                    transform: showThemeMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* 테마 목록 인라인 */}
              {showThemeMenu && (
                <div className="mx-3 mb-1 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.55)' }}>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setIsOpen(false) }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 transition-all hover:bg-white/80"
                    >
                      <div className="flex gap-0.5 flex-shrink-0">
                        {t.swatch.map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full shadow-sm" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-xs flex-1 text-left font-medium" style={{ color: 'var(--t-text)' }}>
                        {t.emoji} {t.name}
                      </span>
                      {currentTheme.id === t.id && (
                        <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--t-c1)' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* 로그아웃 */}
              <button
                onClick={() => { signOut(); setIsOpen(false) }}
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
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.5))',
              }}
            >
              <p className="text-xs text-center" style={{ color: 'var(--t-text-light)' }}>
                모든 데이터가 안전하게 동기화됐어요 ☁️
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

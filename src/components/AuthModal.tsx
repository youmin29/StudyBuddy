import { useState } from 'react'
import {
  X,
  Cloud,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CloudOff,
  UserPlus,
  LogIn,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuthStore()

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)

    if (tab === 'login') {
      const err = await signIn(email, password)
      if (err) {
        setError(err)
      } else {
        onClose()
      }
    } else {
      const { error: err, needsConfirmation } = await signUp(email, password)
      if (err) {
        setError(err)
      } else if (needsConfirmation) {
        setMessage('📩 확인 이메일을 보냈어요! 메일함에서 링크를 클릭한 뒤 로그인하세요.')
        setTab('login')
        setEmail('')
        setPassword('')
      } else {
        onClose()
      }
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit()
  }

  const handleClose = () => {
    setError('')
    setMessage('')
    setEmail('')
    setPassword('')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div
          className="w-[420px] rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #E8F5FF 0%, #FFF0F8 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8)',
            border: '2px solid rgba(168,216,240,0.4)',
          }}
        >
          {/* Header */}
          <div
            className="relative overflow-hidden px-6 py-5"
            style={{
              background: 'linear-gradient(135deg, #A8D8F0 0%, #D4A5F5 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="bg-white/90 p-2.5 rounded-xl shadow-lg"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <Cloud className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3
                    className="text-white font-bold drop-shadow-md"
                    style={{ fontSize: '18px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                  >
                    {tab === 'login' ? 'Account Login' : 'Create Account'}
                  </h3>
                  <p className="text-xs text-white/90 drop-shadow-sm mt-0.5">
                    Sync your workspace across devices
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="bg-white/30 hover:bg-white/50 backdrop-blur-sm p-1.5 rounded-lg transition-all"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                <X className="w-4 h-4 text-white drop-shadow-md" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Cloud Sync Banner */}
            <div
              className="mb-5 p-4 rounded-2xl border border-blue-200/50"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 mt-0.5 p-2 rounded-xl shadow-md"
                  style={{ background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Cloud Sync Benefits</p>
                  <ul className="text-xs text-purple-600 space-y-0.5">
                    <li>✨ 여러 기기에서 할 일 · 플레이리스트 동기화</li>
                    <li>☁️ 자동 클라우드 백업</li>
                    <li>💖 어디서나 내 워크스페이스 접근</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div
              className="flex rounded-2xl p-1 mb-5"
              style={{
                background: 'rgba(196,181,253,0.15)',
                border: '1px solid rgba(196,181,253,0.3)',
              }}
            >
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setMessage('') }}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                  style={
                    tab === t
                      ? {
                          background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(168,216,240,0.4)',
                        }
                      : { color: '#9333ea' }
                  }
                >
                  {t === 'login' ? (
                    <><LogIn className="w-3.5 h-3.5" /> 로그인</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5" /> 회원가입</>
                  )}
                </button>
              ))}
            </div>

            {/* Message */}
            {message && (
              <div
                className="mb-4 px-4 py-3 rounded-2xl text-sm text-purple-700 text-center"
                style={{
                  background: 'rgba(196,181,253,0.2)',
                  border: '1px solid rgba(196,181,253,0.4)',
                }}
              >
                {message}
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-600 text-center"
                style={{
                  background: 'rgba(255,182,193,0.3)',
                  border: '1px solid rgba(255,182,193,0.5)',
                }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-purple-700 mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="이메일 주소 입력"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-all text-sm text-purple-800 placeholder-purple-300"
                  style={{
                    background: 'white',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={tab === 'signup' ? '6자리 이상' : '비밀번호 입력'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-all text-sm text-purple-800 placeholder-purple-300"
                  style={{
                    background: 'white',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
                  }}
                />
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Guest Mode Note */}
            <div className="mt-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CloudOff className="w-3.5 h-3.5 text-purple-400" />
                <p className="text-xs text-purple-500">로그인 없이도 사용 가능해요!</p>
              </div>
              <p className="text-xs text-purple-400">Guest Mode에서는 이 기기에만 데이터가 저장돼요</p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t border-blue-200/50"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.5))',
            }}
          >
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(168,216,240,0.4)',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-white font-medium drop-shadow-sm">
                    {tab === 'login' ? 'Login & Sync' : '계정 만들기'}
                  </span>
                )}
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-3 rounded-2xl transition-all bg-white/60 hover:bg-white/80"
              >
                <span className="text-purple-600 font-medium">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

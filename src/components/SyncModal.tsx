import { useState } from 'react'
import { Cloud, Upload, HardDrive, ArrowRight, X, CheckCircle, AlertCircle } from 'lucide-react'

interface SyncModalProps {
  isOpen: boolean
  onUpload: () => Promise<{ todos: number; playlists: number }>  // 성공 시 업로드 카운트 반환
  onUseCloud: () => void
  onSkip: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SyncModal({ isOpen, onUpload, onUseCloud, onSkip }: SyncModalProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [uploaded, setUploaded] = useState({ todos: 0, playlists: 0 })

  if (!isOpen) return null

  const handleUpload = async () => {
    setStatus('loading')
    try {
      const result = await onUpload()
      setUploaded(result)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '업로드 중 오류가 발생했어요.')
      setStatus('error')
    }
  }

  const handleClose = () => {
    setStatus('idle')
    setErrorMsg('')
    onSkip()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <div
          className="w-[460px] rounded-3xl overflow-hidden"
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
                  className="bg-white/90 p-2.5 rounded-xl"
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
                    클라우드 동기화
                  </h3>
                  <p className="text-xs text-white/90 drop-shadow-sm mt-0.5">
                    이 기기의 로컬 데이터를 어떻게 할까요?
                  </p>
                </div>
              </div>
              {status !== 'loading' && (
                <button
                  onClick={handleClose}
                  className="bg-white/30 hover:bg-white/50 backdrop-blur-sm p-1.5 rounded-lg transition-all"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  <X className="w-4 h-4 text-white drop-shadow-md" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">

            {/* ── 성공 상태 ── */}
            {status === 'success' && (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)' }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-bold text-purple-800 mb-1">업로드 완료!</p>
                <p className="text-sm text-purple-500 mb-4">로컬 데이터가 클라우드에 저장됐어요</p>
                <div className="flex justify-center gap-3 mb-6">
                  {uploaded.todos > 0 && (
                    <div
                      className="px-4 py-2 rounded-xl text-sm font-medium text-purple-700"
                      style={{ background: 'rgba(196,181,253,0.2)', border: '1px solid rgba(196,181,253,0.4)' }}
                    >
                      ✅ 투두 {uploaded.todos}개
                    </div>
                  )}
                  {uploaded.playlists > 0 && (
                    <div
                      className="px-4 py-2 rounded-xl text-sm font-medium text-purple-700"
                      style={{ background: 'rgba(196,181,253,0.2)', border: '1px solid rgba(196,181,253,0.4)' }}
                    >
                      🎵 플레이리스트 {uploaded.playlists}개
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="px-8 py-2.5 rounded-2xl text-white font-medium transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)' }}
                >
                  시작하기
                </button>
              </div>
            )}

            {/* ── 에러 상태 ── */}
            {status === 'error' && (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FFB6D9 0%, #FF6B9D 100%)' }}
                >
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-bold text-purple-800 mb-1">업로드 실패</p>
                <p className="text-sm text-red-500 mb-6">{errorMsg}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleUpload}
                    className="px-6 py-2.5 rounded-2xl text-white font-medium transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)' }}
                  >
                    다시 시도
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-2xl font-medium transition-all bg-white/60 hover:bg-white/80"
                  >
                    <span className="text-purple-600">건너뛰기</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── 로딩 상태 ── */}
            {status === 'loading' && (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)' }}
                >
                  <div className="w-8 h-8 border-3 border-white/40 border-t-white rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                </div>
                <p className="text-base font-bold text-purple-800 mb-1">업로드 중...</p>
                <p className="text-sm text-purple-400">투두, 플레이리스트, 설정을 저장하고 있어요</p>
              </div>
            )}

            {/* ── 기본 상태 ── */}
            {status === 'idle' && (
              <>
                {/* Local data summary */}
                <div
                  className="p-4 rounded-2xl border border-blue-200/50 mb-3"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.5))',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-semibold text-purple-700">이 기기의 로컬 데이터</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { emoji: '✅', label: '투두리스트' },
                      { emoji: '🎵', label: '플레이리스트' },
                      { emoji: '⚙️', label: '앱 설정' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(196,181,253,0.12)' }}
                      >
                        <span className="text-base">{item.emoji}</span>
                        <p className="text-xs font-medium text-purple-700">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Option 1 — Upload */}
                <button
                  onClick={handleUpload}
                  className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group mb-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,216,240,0.3) 0%, rgba(167,139,250,0.3) 100%)',
                    border: '2px solid rgba(168,216,240,0.5)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(168,216,240,0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #A8D8F0 0%, #A78BFA 100%)' }}
                    >
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-purple-800">로컬 데이터를 클라우드에 업로드</p>
                      <p className="text-xs text-purple-500 mt-0.5">
                        이 기기의 데이터를 클라우드에 저장하고 다른 기기와 동기화해요
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Option 2 — Use Cloud */}
                <button
                  onClick={onUseCloud}
                  className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.4))',
                    border: '1.5px solid rgba(196,181,253,0.3)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #FFC9E5 0%, #D4A5F5 100%)' }}
                    >
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-purple-700">클라우드 데이터 사용</p>
                      <p className="text-xs text-purple-400 mt-0.5">
                        클라우드에 저장된 데이터로 시작해요 (로컬 데이터는 유지)
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          {status === 'idle' && (
            <div
              className="px-6 py-4 border-t border-blue-200/40"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.4))',
              }}
            >
              <button
                onClick={handleClose}
                className="w-full py-2 text-sm text-purple-400 hover:text-purple-600 transition-colors"
              >
                나중에 결정할게요
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { useEffect } from 'react'
import Header from '../components/Header'
import YouTubePlayer from '../components/YouTubePlayer'
import MiniCalendar from '../components/MiniCalendar'
import TodoPanel from '../components/TodoPanel'
import { useTodoStore } from '../store/useTodoStore'
import { useAuthStore } from '../store/useAuthStore'

export default function Home() {
  const { user, loading } = useAuthStore()
  const { setSelectedDate, loadTodoCounts, loadSettings } = useTodoStore()

  // 로그인 상태가 바뀔 때마다 (로그인·로그아웃·초기 로드) 데이터 새로 로드
  // loading이 false가 된 후부터 user 변화를 감지
  useEffect(() => {
    if (loading) return
    loadTodoCounts()
    loadSettings()
    setSelectedDate(new Date())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  return (
    <div
      className="h-screen overflow-hidden flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #FFF5F7 0%, #E8F4FF 50%, #F5E8FF 100%)',
      }}
    >
      <div
        className="w-full max-w-6xl h-full max-h-[920px] flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.72), rgba(255,255,255,0.55))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        <Header />

        <div className="flex-1 min-h-0 p-5 overflow-y-auto">
          <div className="mb-5">
            <YouTubePlayer />
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 3fr' }}>
            <MiniCalendar />
            <TodoPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

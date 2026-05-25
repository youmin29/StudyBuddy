import { useEffect } from 'react'
import Header from '../components/Header'
import YouTubePlayer from '../components/YouTubePlayer'
import MiniCalendar from '../components/MiniCalendar'
import TodoPanel from '../components/TodoPanel'
import { useTodoStore } from '../store/useTodoStore'

export default function Home() {
  const { setSelectedDate, loadTodoCounts } = useTodoStore()

  useEffect(() => {
    loadTodoCounts()
    setSelectedDate(new Date())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex-1 min-h-0 p-5 overflow-y-auto">
          {/* YouTube Player */}
          <div className="mb-5">
            <YouTubePlayer />
          </div>

          {/* Calendar + Todo – 자연 높이로 나란히 */}
          <div className="grid gap-5" style={{ gridTemplateColumns: '2fr 3fr' }}>
            <MiniCalendar />
            <TodoPanel />
          </div>
        </div>

      </div>
    </div>
  )
}

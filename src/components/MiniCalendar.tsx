import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useTodoStore } from '../store/useTodoStore'

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function MiniCalendar() {
  const { selectedDate, todoCounts, importantCounts, completedCounts, completedImportantCounts, hideCompletedFromCalendar, setSelectedDate } = useTodoStore()
  const [viewMonth, setViewMonth] = useState(new Date())

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) =>
    day === selectedDate.getDate() &&
    month === selectedDate.getMonth() &&
    year === selectedDate.getFullYear()

  const handleSelect = (day: number) => {
    setSelectedDate(new Date(year, month, day))
  }

  return (
    <div
      className="rounded-2xl overflow-hidden h-full"
      style={{
        background: 'linear-gradient(135deg, #FFF9E6 0%, #FFEEF8 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewMonth(new Date(year, month - 1))}
            className="p-1.5 rounded-lg transition-all"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'color-mix(in srgb, var(--t-c1) 10%, transparent)' }}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--t-c1)' }} />
          </button>
          <span className="font-bold" style={{ fontSize: '15px', color: 'var(--t-text)' }}>
            {viewMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </span>
          <button
            onClick={() => setViewMonth(new Date(year, month + 1))}
            className="p-1.5 rounded-lg transition-all"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'color-mix(in srgb, var(--t-c1) 10%, transparent)' }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--t-c1)' }} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--t-text-light)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid – h-8 고정 높이로 창 너비와 무관하게 일정 */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = toDateStr(day)
            const count = todoCounts[dateStr] ?? 0
            const impCount = importantCounts[dateStr] ?? 0
            const regularCount = count - impCount
            const completedImpCount = completedImportantCounts[dateStr] ?? 0
            const completedRegCount = (completedCounts[dateStr] ?? 0) - completedImpCount
            const hasImportant = impCount > 0 && (
              !hideCompletedFromCalendar || completedImpCount < impCount
            )
            const hasRegular = regularCount > 0 && (
              !hideCompletedFromCalendar || completedRegCount < regularCount
            )
            const selected = isSelected(day)
            const today = isToday(day)

            return (
              <button
                key={day}
                onClick={() => handleSelect(day)}
                className="h-8 w-full rounded-lg transition-all relative group flex flex-col items-center justify-center"
                style={{
                  background: selected
                    ? 'linear-gradient(135deg, var(--t-c1) 0%, var(--t-c1b) 100%)'
                    : today
                    ? 'linear-gradient(135deg, var(--t-scroll-track) 0%, var(--t-c2-soft) 100%)'
                    : 'transparent',
                  boxShadow: selected
                    ? 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px var(--t-c1-glow)'
                    : undefined,
                }}
              >
                <span
                  className="text-xs font-medium leading-none"
                  style={{
                    color: selected ? 'white' : today ? 'var(--t-text-soft)' : 'var(--t-text)',
                    fontWeight: selected || today ? 700 : 500,
                  }}
                >
                  {day}
                </span>
                {(hasImportant || hasRegular) && (
                  <div className="flex gap-0.5 mt-0.5 items-center">
                    {hasImportant && (
                      <Star
                        className="w-2 h-2"
                        style={{ color: selected ? 'white' : 'var(--t-c1)', fill: selected ? 'white' : 'var(--t-c1)' }}
                      />
                    )}
                    {hasRegular && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: selected ? 'white' : 'linear-gradient(135deg, var(--t-c1), var(--t-c1b))' }}
                      />
                    )}
                  </div>
                )}
                {!selected && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'color-mix(in srgb, var(--t-c1) 15%, transparent)' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Date Label */}
        <div className="mt-2 pt-2 border-t border-pink-200/60">
          <p className="text-xs text-center" style={{ color: 'var(--t-text-light)' }}>
            {selectedDate.toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

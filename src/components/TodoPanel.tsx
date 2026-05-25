import { useState } from 'react'
import { Plus, Star, Trash2 } from 'lucide-react'
import { useTodoStore } from '../store/useTodoStore'

export default function TodoPanel() {
  const { todos, selectedDate, isLoading, addTodo, toggleTodo, toggleImportant, deleteTodo } =
    useTodoStore()
  const [newText, setNewText] = useState('')

  const handleAdd = async () => {
    if (!newText.trim()) return
    await addTodo(newText.trim())
    setNewText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd()
  }

  const dateLabel = selectedDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const completedCount = todos.filter((t) => t.completed).length
  const importantCount = todos.filter((t) => t.important).length

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #E8F9FF 0%, #F8E8FF 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-purple-700" style={{ fontSize: '16px' }}>
            Daily Tasks
          </h3>
          <p className="text-xs text-purple-400 mt-0.5">{dateLabel}</p>
        </div>

        {/* Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="새 할 일 추가..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 text-sm rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-all text-purple-800 placeholder-purple-300"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #fefbff)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
            }}
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(167,139,250,0.4)',
            }}
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Todo List */}
        <div
          className="overflow-y-auto space-y-2 pr-1"
          style={{ maxHeight: '220px', scrollbarWidth: 'thin', scrollbarColor: '#D8B4FE #F3E8FF' }}
        >
          {isLoading ? (
            <div className="text-center py-8 text-purple-400 text-sm">불러오는 중...</div>
          ) : todos.length === 0 ? (
            <div className="text-center py-6">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl inline-block shadow-md">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #C4B5FD 0%, #F9A8D4 100%)' }}
                >
                  <span className="text-3xl">✨</span>
                </div>
                <p className="text-purple-600 text-sm font-medium">할 일이 없어요!</p>
                <p className="text-purple-400 text-xs mt-1">위에서 첫 할 일을 추가해보세요</p>
              </div>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/80 transition-all hover:shadow-md group"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-start gap-2">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <div
                      className="w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center"
                      style={{
                        borderColor: todo.completed ? '#C084FC' : '#D8B4FE',
                        background: todo.completed
                          ? 'linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)'
                          : 'white',
                        boxShadow: todo.completed
                          ? 'inset 0 1px 0 rgba(255,255,255,0.4)'
                          : 'inset 0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      {todo.completed && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Text */}
                  <p
                    className={`flex-1 text-sm break-words min-w-0 ${
                      todo.completed ? 'line-through text-purple-400' : 'text-purple-700'
                    }`}
                  >
                    {todo.text}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => toggleImportant(todo.id)}
                      className="p-1 rounded-lg hover:bg-pink-100 transition-all"
                      title={todo.important ? '중요 해제' : '중요 표시'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          todo.important ? 'text-pink-500 fill-pink-500' : 'text-purple-300'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 rounded-lg hover:bg-red-100 transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-4 pt-3 border-t border-purple-200 flex-shrink-0">
            <div className="flex justify-between text-xs">
              <span className="text-purple-500">
                {completedCount} / {todos.length} 완료
              </span>
              <span className="text-pink-500">{importantCount}개 중요</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-purple-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #A78BFA 0%, #C084FC 100%)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState } from "react";
import { Plus, Star, Trash2, Sparkles, Heart, Settings, X } from "lucide-react";
import { useTodoStore } from "../store/useTodoStore";

export default function TodoPanel() {
  const {
    todos,
    selectedDate,
    isLoading,
    hideCompletedFromCalendar,
    setHideCompletedFromCalendar,
    addTodo,
    toggleTodo,
    toggleImportant,
    deleteTodo,
  } = useTodoStore();
  const [newText, setNewText] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    await addTodo(newText.trim());
    setNewText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) handleAdd();
  };

  const dateLabel = selectedDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const importantTodos = todos.filter((t) => t.important);
  const regularTodos = todos.filter((t) => !t.important);
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #E8F9FF 0%, #F8E8FF 100%)",
          boxShadow:
            "inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3
                className="font-bold"
                style={{ fontSize: "16px", color: 'var(--t-text)' }}
              >
                Daily Tasks
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t-text-light)' }}>{dateLabel}</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'color-mix(in srgb, var(--t-c2) 12%, transparent)' }}
            >
              <Settings className="w-4 h-4" style={{ color: 'var(--t-text-light)' }} />
            </button>
          </div>

          {/* Input */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="새 할 일 추가..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 text-sm rounded-xl border-2 focus:outline-none transition-all"
              style={{
                borderColor: 'color-mix(in srgb, var(--t-c2) 40%, transparent)',
                color: 'var(--t-text)',
                background: "linear-gradient(to bottom, #ffffff, #fefbff)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",
              }}
            />
            <button
              onClick={handleAdd}
              className="px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md"
              style={{
                background: "linear-gradient(135deg, var(--t-c2) 0%, var(--t-c2b) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px var(--t-c2-glow)",
              }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Todo List */}
          <div
            className="overflow-y-auto overflow-x-hidden px-3"
            style={{
              maxHeight: "240px",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--t-scroll) var(--t-scroll-track)",
            }}
          >
            {isLoading ? (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--t-text-light)' }}>
                불러오는 중...
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-6">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl inline-block shadow-md">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--t-c2-soft) 0%, var(--t-scroll) 100%)",
                    }}
                  >
                    <span className="text-3xl">✨</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--t-text-soft)' }}>
                    할 일이 없어요!
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--t-text-light)' }}>
                    위에서 첫 할 일을 추가해보세요
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Important Tasks Section */}
                {importantTodos.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-200 to-purple-200 px-3 py-1.5 rounded-full shadow-sm">
                        <Star className="w-3.5 h-3.5" style={{ color: 'var(--t-c1)', fill: 'var(--t-c1)' }} />
                        <span className="text-xs font-bold" style={{ color: 'var(--t-text)' }}>
                          Important Tasks
                        </span>
                        <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-400" />
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      {importantTodos.map((todo) => (
                        <div key={todo.id} className="relative group">
                          <div
                            className="absolute inset-0 rounded-2xl blur-md opacity-60"
                            style={{
                              background:
                                "linear-gradient(135deg, #FFB6D9 0%, #E5BCFF 100%)",
                            }}
                          />
                          <div
                            className="relative rounded-2xl p-3 border-2 transition-all hover:scale-[1.02]"
                            style={{
                              background:
                                "linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 100%)",
                              borderColor: "rgba(255, 182, 217, 0.6)",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(255,107,157,0.25)",
                            }}
                          >
                            {/* Corner heart badge */}
                            <div className="absolute -top-2 -right-2">
                              <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-full p-1.5 shadow-lg">
                                <Heart className="w-3 h-3 text-white fill-white" />
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleTodo(todo.id)}
                                className="mt-0.5 flex-shrink-0"
                              >
                                <div
                                  className="w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center"
                                  style={{
                                    borderColor: todo.completed
                                      ? "var(--t-c1b)"
                                      : "var(--t-scroll)",
                                    background: todo.completed
                                      ? "linear-gradient(135deg, var(--t-c1) 0%, var(--t-c1b) 100%)"
                                      : "white",
                                    boxShadow: todo.completed
                                      ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(236,72,153,0.5)"
                                      : "inset 0 1px 2px rgba(0,0,0,0.1)",
                                  }}
                                >
                                  {todo.completed && (
                                    <svg
                                      className="w-4 h-4 text-white"
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

                              <p
                                className="flex-1 text-sm font-medium break-words min-w-0 mt-0.5"
                                style={{
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  color: todo.completed ? 'var(--t-text-light)' : 'var(--t-text)',
                                }}
                              >
                                {todo.text}
                              </p>

                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => toggleImportant(todo.id)}
                                  className="p-1.5 rounded-lg transition-all"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #FFF0F8 0%, #FFE5F0 100%)",
                                  }}
                                  title="중요 해제"
                                >
                                  <Star className="w-4 h-4" style={{ color: 'var(--t-c1)', fill: 'var(--t-c1)' }} />
                                </button>
                                <button
                                  onClick={() => deleteTodo(todo.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-100 transition-all"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    {regularTodos.length > 0 && (
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
                        <div className="text-xs" style={{ color: 'var(--t-text-light)' }}>♡</div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Tasks Section */}
                {regularTodos.length > 0 && (
                  <div>
                    {importantTodos.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="px-3 py-1.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--t-c2) 15%, transparent)' }}>
                          <span className="text-xs font-medium" style={{ color: 'var(--t-text-soft)' }}>
                            Regular Tasks
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {regularTodos.map((todo) => (
                        <div
                          key={todo.id}
                          className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/80 transition-all hover:shadow-md group"
                          style={{
                            boxShadow:
                              "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              onClick={() => toggleTodo(todo.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              <div
                                className="w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center"
                                style={{
                                  borderColor: todo.completed
                                    ? "var(--t-c2b)"
                                    : "var(--t-scroll)",
                                  background: todo.completed
                                    ? "linear-gradient(135deg, var(--t-c2) 0%, var(--t-c2b) 100%)"
                                    : "white",
                                  boxShadow: todo.completed
                                    ? "inset 0 1px 0 rgba(255,255,255,0.4)"
                                    : "inset 0 1px 2px rgba(0,0,0,0.08)",
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

                            <p
                              className="flex-1 text-sm break-words min-w-0"
                              style={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'var(--t-text-light)' : 'var(--t-text)',
                              }}
                            >
                              {todo.text}
                            </p>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => toggleImportant(todo.id)}
                                className="p-1 rounded-lg transition-all"
                                style={{ background: 'color-mix(in srgb, var(--t-c1) 10%, transparent)' }}
                                title="중요 표시"
                              >
                                <Star className="w-4 h-4" style={{ color: 'var(--t-text-light)' }} />
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
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          {todos.length > 0 && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'color-mix(in srgb, var(--t-c2) 25%, transparent)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--t-text-soft)' }}>
                  {completedCount} / {todos.length} 완료
                </span>
                <span style={{ color: 'var(--t-c1)' }}>
                  {importantTodos.length}개 중요
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--t-c2) 20%, transparent)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%`,
                    background:
                      "linear-gradient(90deg, var(--t-c2) 0%, var(--t-c2b) 100%)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}

      {showSettings && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowSettings(false)}
          />

          {/* Panel */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div
              className="w-[380px] rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 100%)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8)",
                border: "2px solid rgba(255,182,217,0.4)",
              }}
            >
              {/* Header */}
              <div
                className="relative overflow-hidden px-6 py-4"
                style={{
                  background:
                    "linear-gradient(135deg, var(--t-c1) 0%, var(--t-c2) 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-white/90 p-2 rounded-xl"
                      style={{
                        boxShadow:
                          "inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--t-c1)' }} />
                    </div>
                    <h3
                      className="text-white font-bold drop-shadow-md"
                      style={{
                        fontSize: "16px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      할 일 설정
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="bg-white/30 hover:bg-white/50 backdrop-blur-sm p-1.5 rounded-lg transition-all"
                    style={{
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    <X className="w-4 h-4 text-white drop-shadow-md" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Setting Item */}
                <div
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/80"
                  style={{
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        setHideCompletedFromCalendar(!hideCompletedFromCalendar)
                      }
                      className="flex-shrink-0 mt-0.5"
                    >
                      <div
                        className="w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center"
                        style={{
                          borderColor: hideCompletedFromCalendar
                            ? "var(--t-c1b)"
                            : "var(--t-scroll)",
                          background: hideCompletedFromCalendar
                            ? "linear-gradient(135deg, var(--t-c1) 0%, var(--t-c1b) 100%)"
                            : "white",
                          boxShadow: hideCompletedFromCalendar
                            ? "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(236,72,153,0.5)"
                            : "inset 0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      >
                        {hideCompletedFromCalendar && (
                          <svg
                            className="w-4 h-4 text-white"
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

                    {/* Label & Description */}
                    <div className="flex-1">
                      <label
                        className="text-sm font-medium cursor-pointer block mb-1"
                        style={{ color: 'var(--t-text)' }}
                        onClick={() =>
                          setHideCompletedFromCalendar(
                            !hideCompletedFromCalendar,
                          )
                        }
                      >
                        완료된 할 일을 캘린더에서 숨기기
                      </label>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--t-text-soft)' }}>
                        활성화하면, 모든 할 일이 완료된 날짜에는 캘린더 표시가
                        사라져요.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coming soon */}
                <div className="mt-4 text-center">
                  <p className="text-xs" style={{ color: 'var(--t-text-light)' }}>
                    더 많은 설정이 곧 추가될 예정이에요! ✨
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 border-t border-pink-200/50"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.5))",
                }}
              >
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-2.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--t-c1) 0%, var(--t-c1b) 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(255,107,157,0.4)",
                  }}
                >
                  <span className="text-white font-medium drop-shadow-sm">
                    완료
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

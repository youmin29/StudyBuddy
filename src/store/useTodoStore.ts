import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Todo {
  id: string
  text: string
  completed: boolean
  important: boolean
  date: string
}

const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

interface TodoStore {
  todos: Todo[]
  todoCounts: Record<string, number>
  importantCounts: Record<string, number>
  completedCounts: Record<string, number>
  completedImportantCounts: Record<string, number>
  hideCompletedFromCalendar: boolean
  selectedDate: Date
  isLoading: boolean
  setSelectedDate: (date: Date) => Promise<void>
  loadTodoCounts: () => Promise<void>
  loadSettings: () => Promise<void>
  setHideCompletedFromCalendar: (value: boolean) => Promise<void>
  addTodo: (text: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  toggleImportant: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  todoCounts: {},
  importantCounts: {},
  completedCounts: {},
  completedImportantCounts: {},
  hideCompletedFromCalendar: false,
  selectedDate: new Date(),
  isLoading: false,

  // ─── 날짜별 투두 로드 ─────────────────────────────────
  setSelectedDate: async (date: Date) => {
    const dateStr = toDateStr(date)
    set({ selectedDate: date, isLoading: true })
    try {
      const session = await getSession()

      if (session) {
        // 🌐 Supabase
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('date', dateStr)
          .order('created_at')
        if (error) throw error
        const todos: Todo[] = (data ?? []).map((row) => ({
          id: row.id,
          text: row.text,
          completed: Boolean(row.completed),
          important: Boolean(row.important),
          date: row.date,
        }))
        set({ todos, isLoading: false })
      } else {
        // 💾 로컬 IPC
        const rows = await window.electronAPI.todos.getByDate(dateStr)
        const todos: Todo[] = rows.map((row) => ({
          id: row.id,
          text: row.text,
          completed: Boolean(row.completed),
          important: Boolean(row.important),
          date: row.date,
        }))
        set({ todos, isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  // ─── 캘린더 인디케이터용 전체 카운트 ─────────────────
  loadTodoCounts: async () => {
    try {
      const session = await getSession()

      if (session) {
        // 🌐 Supabase
        const { data } = await supabase.from('todos').select('date, completed, important')
        if (!data) return

        const counts: Record<string, number> = {}
        const importantCounts: Record<string, number> = {}
        const completedCounts: Record<string, number> = {}
        const completedImportantCounts: Record<string, number> = {}

        data.forEach((row) => {
          counts[row.date] = (counts[row.date] ?? 0) + 1
          if (row.important) importantCounts[row.date] = (importantCounts[row.date] ?? 0) + 1
          if (row.completed) completedCounts[row.date] = (completedCounts[row.date] ?? 0) + 1
          if (row.completed && row.important)
            completedImportantCounts[row.date] = (completedImportantCounts[row.date] ?? 0) + 1
        })
        set({ todoCounts: counts, importantCounts, completedCounts, completedImportantCounts })
      } else {
        // 💾 로컬 IPC
        const rows = await window.electronAPI.todos.getAll()
        const counts: Record<string, number> = {}
        const importantCounts: Record<string, number> = {}
        const completedCounts: Record<string, number> = {}
        const completedImportantCounts: Record<string, number> = {}
        rows.forEach((row) => {
          counts[row.date] = row.count
          importantCounts[row.date] = row.importantCount
          completedCounts[row.date] = row.completedCount
          completedImportantCounts[row.date] = row.completedImportantCount
        })
        set({ todoCounts: counts, importantCounts, completedCounts, completedImportantCounts })
      }
    } catch {
      // silently fail
    }
  },

  // ─── 설정 로드 ────────────────────────────────────────
  loadSettings: async () => {
    try {
      const session = await getSession()

      if (session) {
        // 🌐 Supabase
        const { data } = await supabase.from('user_settings').select('*').maybeSingle()
        if (data) {
          set({ hideCompletedFromCalendar: data.hide_completed_from_calendar === true })
        }
      } else {
        // 💾 로컬 IPC
        const s = await window.electronAPI.settings.get()
        set({ hideCompletedFromCalendar: s['hideCompletedFromCalendar'] === true })
      }
    } catch {
      // silently fail
    }
  },

  // ─── 설정 저장 ────────────────────────────────────────
  setHideCompletedFromCalendar: async (value: boolean) => {
    set({ hideCompletedFromCalendar: value })
    try {
      const session = await getSession()
      if (session) {
        // 🌐 Supabase
        await supabase
          .from('user_settings')
          .upsert({ user_id: session.user.id, hide_completed_from_calendar: value })
      } else {
        // 💾 로컬 IPC
        await window.electronAPI.settings.set('hideCompletedFromCalendar', value)
      }
    } catch {
      // silently fail
    }
  },

  // ─── 투두 추가 ────────────────────────────────────────
  addTodo: async (text: string) => {
    const { selectedDate, todos, loadTodoCounts } = get()
    const dateStr = toDateStr(selectedDate)
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newTodo: Todo = { id, text, completed: false, important: false, date: dateStr }
    set({ todos: [...todos, newTodo] })

    try {
      const session = await getSession()
      if (session) {
        // 🌐 Supabase
        await supabase.from('todos').insert({
          id,
          user_id: session.user.id,
          text,
          completed: false,
          important: false,
          date: dateStr,
        })
      } else {
        // 💾 로컬 IPC
        await window.electronAPI.todos.add({ id, text, date: dateStr })
      }
    } catch {
      // silently fail
    }
    await loadTodoCounts()
  },

  // ─── 완료 토글 ────────────────────────────────────────
  toggleTodo: async (id: string) => {
    const { todos, selectedDate, completedCounts, completedImportantCounts } = get()
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    const dateStr = toDateStr(selectedDate)
    set({
      todos: updated,
      completedCounts: {
        ...completedCounts,
        [dateStr]: updated.filter((t) => t.completed).length,
      },
      completedImportantCounts: {
        ...completedImportantCounts,
        [dateStr]: updated.filter((t) => t.completed && t.important).length,
      },
    })
    const todo = updated.find((t) => t.id === id)!
    try {
      const session = await getSession()
      if (session) {
        await supabase
          .from('todos')
          .update({ completed: todo.completed, important: todo.important })
          .eq('id', id)
      } else {
        await window.electronAPI.todos.update({
          id,
          completed: todo.completed,
          important: todo.important,
        })
      }
    } catch {
      // silently fail
    }
  },

  // ─── 중요 토글 ────────────────────────────────────────
  toggleImportant: async (id: string) => {
    const { todos, selectedDate, importantCounts, completedImportantCounts } = get()
    const updated = todos.map((t) => (t.id === id ? { ...t, important: !t.important } : t))
    const dateStr = toDateStr(selectedDate)
    set({
      todos: updated,
      importantCounts: {
        ...importantCounts,
        [dateStr]: updated.filter((t) => t.important).length,
      },
      completedImportantCounts: {
        ...completedImportantCounts,
        [dateStr]: updated.filter((t) => t.important && t.completed).length,
      },
    })
    const todo = updated.find((t) => t.id === id)!
    try {
      const session = await getSession()
      if (session) {
        await supabase
          .from('todos')
          .update({ completed: todo.completed, important: todo.important })
          .eq('id', id)
      } else {
        await window.electronAPI.todos.update({
          id,
          completed: todo.completed,
          important: todo.important,
        })
      }
    } catch {
      // silently fail
    }
  },

  // ─── 투두 삭제 ────────────────────────────────────────
  deleteTodo: async (id: string) => {
    const { todos, loadTodoCounts } = get()
    set({ todos: todos.filter((t) => t.id !== id) })
    try {
      const session = await getSession()
      if (session) {
        await supabase.from('todos').delete().eq('id', id)
      } else {
        await window.electronAPI.todos.delete(id)
      }
    } catch {
      // silently fail
    }
    await loadTodoCounts()
  },
}))

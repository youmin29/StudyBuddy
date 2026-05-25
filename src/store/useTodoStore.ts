import { create } from 'zustand'

export interface Todo {
  id: string
  text: string
  completed: boolean
  important: boolean
  date: string
}

const toDateStr = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

interface TodoStore {
  todos: Todo[]
  todoCounts: Record<string, number>
  importantCounts: Record<string, number>
  completedCounts: Record<string, number>
  hideCompletedFromCalendar: boolean
  selectedDate: Date
  isLoading: boolean
  setSelectedDate: (date: Date) => Promise<void>
  loadTodoCounts: () => Promise<void>
  setHideCompletedFromCalendar: (value: boolean) => void
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
  hideCompletedFromCalendar: localStorage.getItem('hideCompletedFromCalendar') === 'true',
  selectedDate: new Date(),
  isLoading: false,

  setSelectedDate: async (date: Date) => {
    const dateStr = toDateStr(date)
    set({ selectedDate: date, isLoading: true })
    try {
      const rows = await window.electronAPI.todos.getByDate(dateStr)
      const todos: Todo[] = rows.map((row) => ({
        id: row.id,
        text: row.text,
        completed: Boolean(row.completed),
        important: Boolean(row.important),
        date: row.date,
      }))
      set({ todos, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  loadTodoCounts: async () => {
    try {
      const rows = await window.electronAPI.todos.getAll()
      const counts: Record<string, number> = {}
      const importantCounts: Record<string, number> = {}
      const completedCounts: Record<string, number> = {}
      rows.forEach((row) => {
        counts[row.date] = row.count
        importantCounts[row.date] = row.importantCount
        completedCounts[row.date] = row.completedCount
      })
      set({ todoCounts: counts, importantCounts, completedCounts })
    } catch {
      // silently fail
    }
  },

  setHideCompletedFromCalendar: (value: boolean) => {
    localStorage.setItem('hideCompletedFromCalendar', String(value))
    set({ hideCompletedFromCalendar: value })
  },

  addTodo: async (text: string) => {
    const { selectedDate, todos, loadTodoCounts } = get()
    const dateStr = toDateStr(selectedDate)
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const newTodo: Todo = { id, text, completed: false, important: false, date: dateStr }
    set({ todos: [...todos, newTodo] })
    await window.electronAPI.todos.add({ id, text, date: dateStr })
    await loadTodoCounts()
  },

  toggleTodo: async (id: string) => {
    const { todos, selectedDate, completedCounts } = get()
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    const dateStr = toDateStr(selectedDate)
    const newCompletedCount = updated.filter((t) => t.completed).length
    set({ todos: updated, completedCounts: { ...completedCounts, [dateStr]: newCompletedCount } })
    const todo = updated.find((t) => t.id === id)!
    await window.electronAPI.todos.update({ id, completed: todo.completed, important: todo.important })
  },

  toggleImportant: async (id: string) => {
    const { todos, selectedDate, importantCounts } = get()
    const updated = todos.map((t) => (t.id === id ? { ...t, important: !t.important } : t))
    const dateStr = toDateStr(selectedDate)
    const newImportantCount = updated.filter((t) => t.important).length
    set({ todos: updated, importantCounts: { ...importantCounts, [dateStr]: newImportantCount } })
    const todo = updated.find((t) => t.id === id)!
    await window.electronAPI.todos.update({ id, completed: todo.completed, important: todo.important })
  },

  deleteTodo: async (id: string) => {
    const { todos, loadTodoCounts } = get()
    set({ todos: todos.filter((t) => t.id !== id) })
    await window.electronAPI.todos.delete(id)
    await loadTodoCounts()
  },
}))

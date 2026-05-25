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
  selectedDate: Date
  isLoading: boolean
  setSelectedDate: (date: Date) => Promise<void>
  loadTodoCounts: () => Promise<void>
  addTodo: (text: string) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  toggleImportant: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  todoCounts: {},
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
      rows.forEach((row) => {
        counts[row.date] = row.count
      })
      set({ todoCounts: counts })
    } catch {
      // silently fail
    }
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
    const { todos } = get()
    const updated = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    set({ todos: updated })
    const todo = updated.find((t) => t.id === id)!
    await window.electronAPI.todos.update({ id, completed: todo.completed, important: todo.important })
  },

  toggleImportant: async (id: string) => {
    const { todos } = get()
    const updated = todos.map((t) => (t.id === id ? { ...t, important: !t.important } : t))
    set({ todos: updated })
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

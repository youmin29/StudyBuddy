/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string
    VITE_PUBLIC: string
  }
}

interface TodoRow {
  id: string
  text: string
  completed: number | boolean
  important: number | boolean
  date: string
}

interface TodoCountRow {
  date: string
  count: number
  importantCount: number
  completedCount: number
}

interface ElectronTodoAPI {
  getByDate: (date: string) => Promise<TodoRow[]>
  getAll: () => Promise<TodoCountRow[]>
  add: (todo: { id: string; text: string; date: string }) => Promise<{ success: boolean }>
  update: (todo: { id: string; completed: boolean; important: boolean }) => Promise<{ success: boolean }>
  delete: (id: string) => Promise<{ success: boolean }>
}

interface Window {
  electronAPI: {
    todos: ElectronTodoAPI
  }
  ipcRenderer: import('electron').IpcRenderer
}

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

interface TodoFullRow {
  id: string
  text: string
  completed: number | boolean
  important: number | boolean
  date: string
  created_at: string
}

interface TodoCountRow {
  date: string
  count: number
  importantCount: number
  completedCount: number
  completedImportantCount: number
}

interface ElectronTodoAPI {
  getByDate: (date: string) => Promise<TodoRow[]>
  getAll: () => Promise<TodoCountRow[]>
  getAllFull: () => Promise<TodoFullRow[]>
  add: (todo: { id: string; text: string; date: string }) => Promise<{ success: boolean }>
  update: (todo: { id: string; completed: boolean; important: boolean }) => Promise<{ success: boolean }>
  delete: (id: string) => Promise<{ success: boolean }>
}

interface StoredPlaylist {
  id: string
  name: string
  url: string
  emoji: string
  isFavorite: boolean
  lastPlayed?: string
}

interface Window {
  electronAPI: {
    todos: ElectronTodoAPI
    playlists: {
      get: () => Promise<StoredPlaylist[]>
      save: (playlists: StoredPlaylist[]) => Promise<{ success: boolean }>
    }
    settings: {
      get: () => Promise<Record<string, unknown>>
      set: (key: string, value: unknown) => Promise<{ success: boolean }>
    }
  }
  ipcRenderer: import('electron').IpcRenderer
}

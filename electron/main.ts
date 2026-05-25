import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any
let win: BrowserWindow | null

function initDatabase() {
  const Database = require('better-sqlite3')
  const dbPath = path.join(app.getPath('userData'), 'study-buddy.db')
  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      important INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

function setupIpcHandlers() {
  ipcMain.handle('todos:getByDate', (_event, date: string) => {
    return db.prepare('SELECT * FROM todos WHERE date = ? ORDER BY created_at').all(date)
  })

  ipcMain.handle('todos:getAll', () => {
    return db
      .prepare(
        `SELECT date,
          COUNT(*) as count,
          SUM(CASE WHEN important=1 THEN 1 ELSE 0 END) as importantCount,
          SUM(CASE WHEN completed=1 THEN 1 ELSE 0 END) as completedCount
        FROM todos GROUP BY date`
      )
      .all()
  })

  ipcMain.handle('todos:add', (_event, todo: { id: string; text: string; date: string }) => {
    db.prepare(
      'INSERT INTO todos (id, text, completed, important, date) VALUES (?, ?, 0, 0, ?)'
    ).run(todo.id, todo.text, todo.date)
    return { success: true }
  })

  ipcMain.handle(
    'todos:update',
    (_event, todo: { id: string; completed: boolean; important: boolean }) => {
      db.prepare('UPDATE todos SET completed = ?, important = ? WHERE id = ?').run(
        todo.completed ? 1 : 0,
        todo.important ? 1 : 0,
        todo.id
      )
      return { success: true }
    }
  )

  ipcMain.handle('todos:delete', (_event, id: string) => {
    db.prepare('DELETE FROM todos WHERE id = ?').run(id)
    return { success: true }
  })
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 20 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  initDatabase()
  setupIpcHandlers()
  createWindow()
})

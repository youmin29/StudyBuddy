import { app, BrowserWindow, ipcMain, session } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import http from 'node:http'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any
let win: BrowserWindow | null
let localServer: http.Server | null = null
let localPort = 0

function startLocalServer(): Promise<void> {
  return new Promise((resolve) => {
    localServer = http.createServer((req, res) => {
      const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
      let filePath = path.join(RENDERER_DIST, pathname)

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(RENDERER_DIST, 'index.html')
      }

      const ext = path.extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' })
      fs.createReadStream(filePath).pipe(res)
    })

    localServer.listen(0, () => {
      const addr = localServer!.address() as { port: number }
      localPort = addr.port
      resolve()
    })
  })
}

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
          SUM(CASE WHEN completed=1 THEN 1 ELSE 0 END) as completedCount,
          SUM(CASE WHEN completed=1 AND important=1 THEN 1 ELSE 0 END) as completedImportantCount
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

  ipcMain.handle('todos:getAllFull', () => {
    return db.prepare('SELECT * FROM todos ORDER BY date, created_at').all()
  })

  ipcMain.handle('playlists:get', () => {
    const filePath = path.join(app.getPath('userData'), 'playlists.json')
    try {
      if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {}
    return []
  })

  ipcMain.handle('playlists:save', (_event, playlists: unknown) => {
    const filePath = path.join(app.getPath('userData'), 'playlists.json')
    try {
      fs.writeFileSync(filePath, JSON.stringify(playlists), 'utf-8')
      return { success: true }
    } catch {
      return { success: false }
    }
  })

  ipcMain.handle('settings:get', () => {
    const filePath = path.join(app.getPath('userData'), 'settings.json')
    try {
      if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {}
    return {}
  })

  ipcMain.handle('settings:set', (_event, key: string, value: unknown) => {
    const filePath = path.join(app.getPath('userData'), 'settings.json')
    try {
      let settings: Record<string, unknown> = {}
      if (fs.existsSync(filePath)) settings = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      settings[key] = value
      fs.writeFileSync(filePath, JSON.stringify(settings), 'utf-8')
      return { success: true }
    } catch {
      return { success: false }
    }
  })
}

function createWindow() {
  const isMac = process.platform === 'darwin'

  win = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 700,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    ...(isMac ? { trafficLightPosition: { x: 16, y: 20 } } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadURL(`http://localhost:${localPort}`)
  }
}

app.on('window-all-closed', () => {
  localServer?.close()
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

app.whenReady().then(async () => {
  initDatabase()
  setupIpcHandlers()

  const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  session.defaultSession.setUserAgent(CHROME_UA)

  if (!VITE_DEV_SERVER_URL) {
    await startLocalServer()
  }

  createWindow()
})

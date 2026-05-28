import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  todos: {
    getByDate: (date: string) => ipcRenderer.invoke('todos:getByDate', date),
    getAll: () => ipcRenderer.invoke('todos:getAll'),
    getAllFull: () => ipcRenderer.invoke('todos:getAllFull'),
    add: (todo: { id: string; text: string; date: string }) =>
      ipcRenderer.invoke('todos:add', todo),
    update: (todo: { id: string; completed: boolean; important: boolean }) =>
      ipcRenderer.invoke('todos:update', todo),
    delete: (id: string) => ipcRenderer.invoke('todos:delete', id),
  },
  playlists: {
    get: () => ipcRenderer.invoke('playlists:get'),
    save: (playlists: unknown) => ipcRenderer.invoke('playlists:save', playlists),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  },
  authStorage: {
    get: (key: string) => ipcRenderer.invoke('auth:storage-get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('auth:storage-set', key, value),
    remove: (key: string) => ipcRenderer.invoke('auth:storage-remove', key),
  },
  openUrl: (url: string) => ipcRenderer.invoke('app:open-url', url),
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

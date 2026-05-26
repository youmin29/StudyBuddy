import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Electron에서는 랜덤 포트 때문에 localStorage origin이 매번 달라짐
// → 세션을 userData 파일에 저장하는 커스텀 storage adapter 사용
const electronStorage = {
  getItem: (key: string): Promise<string | null> =>
    window.electronAPI.authStorage.get(key),
  setItem: (key: string, value: string): Promise<void> =>
    window.electronAPI.authStorage.set(key, value).then(() => {}),
  removeItem: (key: string): Promise<void> =>
    window.electronAPI.authStorage.remove(key).then(() => {}),
}

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isElectron ? electronStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

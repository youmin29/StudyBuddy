import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthStore {
  user: User | null
  loading: boolean
  syncVersion: number   // 업로드 완료 시 증가 → 각 컴포넌트가 데이터 재로드
  bumpSync: () => void
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  loadUser: () => Promise<void>
  updateNickname: (nickname: string) => Promise<string | null>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  syncVersion: 0,
  bumpSync: () => set((s) => ({ syncVersion: s.syncVersion + 1 })),

  loadUser: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    return null
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message, needsConfirmation: false }
    // 이메일 확인이 필요한 경우 session이 null
    const needsConfirmation = !data.session
    return { error: null, needsConfirmation }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  updateNickname: async (nickname: string) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { nickname: nickname.trim() },
    })
    if (error) return error.message
    set({ user: data.user })
    return null
  },
}))

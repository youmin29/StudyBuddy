import { supabase } from './supabase'

export interface SyncResult {
  success: boolean
  error?: string
  uploaded?: {
    todos: number
    playlists: number
  }
}

/**
 * 로컬 IPC 데이터를 Supabase 클라우드에 업로드
 * - 투두: id 기준 upsert (중복 방지)
 * - 플레이리스트: 전체 교체
 * - 설정: upsert
 */
export async function syncLocalToCloud(): Promise<SyncResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { success: false, error: '로그인 상태가 아니에요.' }
  }

  const userId = session.user.id

  try {
    // ── 1. 투두리스트 ──────────────────────────────
    const localTodos = await window.electronAPI.todos.getAllFull()

    if (localTodos.length > 0) {
      const { error } = await supabase.from('todos').upsert(
        localTodos.map((t) => ({
          id: t.id,
          user_id: userId,
          text: t.text,
          completed: Boolean(t.completed),
          important: Boolean(t.important),
          date: t.date,
          created_at: t.created_at,
        })),
        { onConflict: 'id' }
      )
      if (error) throw new Error(`투두 업로드 실패: ${error.message}`)
    }

    // ── 2. 플레이리스트 ────────────────────────────
    const localPlaylists = await window.electronAPI.playlists.get()

    // 기존 클라우드 데이터 삭제 후 로컬 데이터로 덮어쓰기
    const { error: delErr } = await supabase
      .from('playlists')
      .delete()
      .eq('user_id', userId)
    if (delErr) throw new Error(`플레이리스트 초기화 실패: ${delErr.message}`)

    if (localPlaylists.length > 0) {
      const { error } = await supabase.from('playlists').insert(
        localPlaylists.map((p) => ({
          id: p.id,
          user_id: userId,
          name: p.name,
          url: p.url,
          emoji: p.emoji,
          is_favorite: p.isFavorite,
          last_played: p.lastPlayed ?? null,
        }))
      )
      if (error) throw new Error(`플레이리스트 업로드 실패: ${error.message}`)
    }

    // ── 3. 설정 ────────────────────────────────────
    const localSettings = await window.electronAPI.settings.get()

    const { error: settingsErr } = await supabase.from('user_settings').upsert({
      user_id: userId,
      hide_completed_from_calendar:
        localSettings['hideCompletedFromCalendar'] === true,
    })
    if (settingsErr) throw new Error(`설정 업로드 실패: ${settingsErr.message}`)

    return {
      success: true,
      uploaded: {
        todos: localTodos.length,
        playlists: localPlaylists.length,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.'
    return { success: false, error: message }
  }
}

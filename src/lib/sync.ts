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
 * 로컬 IPC 데이터를 Supabase 클라우드에 업로드 (병합 방식)
 *
 * [투두]
 *   - id 기준 upsert → 새 항목만 추가, 기존 항목은 최신값으로 업데이트
 *   - 다른 기기에서 올린 투두는 그대로 유지 (덮어쓰지 않음)
 *
 * [플레이리스트]
 *   - 클라우드에 이미 같은 URL이 있으면 스킵, 없는 것만 추가
 *   - 다른 기기의 플레이리스트가 사라지지 않음
 *
 * [설정]
 *   - upsert (마지막 업로드 기준으로 덮어쓰기)
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

    let uploadedTodos = 0
    if (localTodos.length > 0) {
      // id 기준 upsert: 같은 id면 업데이트, 새 id면 삽입
      // 클라우드에만 있는 항목(다른 기기에서 올린 것)은 건드리지 않음
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
      uploadedTodos = localTodos.length
    }

    // ── 2. 플레이리스트 ────────────────────────────
    const localPlaylists = await window.electronAPI.playlists.get()

    let uploadedPlaylists = 0
    if (localPlaylists.length > 0) {
      // 클라우드에 이미 있는 URL 목록 조회
      const { data: cloudPlaylists, error: fetchErr } = await supabase
        .from('playlists')
        .select('url')
        .eq('user_id', userId)
      if (fetchErr) throw new Error(`플레이리스트 조회 실패: ${fetchErr.message}`)

      const cloudUrls = new Set((cloudPlaylists ?? []).map((p) => p.url))

      // 클라우드에 없는 URL만 추가 (중복 방지 + 다른 기기 데이터 보존)
      const newPlaylists = localPlaylists.filter((p) => !cloudUrls.has(p.url))

      if (newPlaylists.length > 0) {
        const { error } = await supabase.from('playlists').insert(
          newPlaylists.map((p) => ({
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
        uploadedPlaylists = newPlaylists.length
      }
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
        todos: uploadedTodos,
        playlists: uploadedPlaylists,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.'
    return { success: false, error: message }
  }
}

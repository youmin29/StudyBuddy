import { useRef, useState, useEffect } from 'react'
import YouTube from 'react-youtube'
import {
  Play,
  Pause,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Heart,
  Clock,
  Bookmark,
  Trash2,
  Music2,
} from 'lucide-react'
import { usePlayerStore } from '../store/usePlayerStore'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../lib/supabase'

interface SavedPlaylist {
  id: string
  name: string
  url: string
  emoji: string
  isFavorite: boolean
  lastPlayed?: Date
}

export default function YouTubePlayer() {
  const { videoId, listId, isPlaying, setUrl, setIsPlaying } = usePlayerStore()
  const { user, syncVersion } = useAuthStore()
  const [inputValue, setInputValue] = useState('')
  const [volume, setVolume] = useState(70)
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([])
  const [currentPlaylist, setCurrentPlaylist] = useState<SavedPlaylist | null>(null)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const isRepeatRef = useRef(false)

  // user 변경 시(로그인·로그아웃)마다 플레이리스트 다시 로드
  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // 🌐 Supabase
        const { data } = await supabase
          .from('playlists')
          .select('*')
          .order('last_played', { ascending: false, nullsFirst: false })
        if (!data) return
        setSavedPlaylists(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            url: p.url,
            emoji: p.emoji,
            isFavorite: p.is_favorite,
            lastPlayed: p.last_played ? new Date(p.last_played) : undefined,
          }))
        )
      } else {
        // 💾 로컬 IPC
        const stored = await window.electronAPI.playlists.get()
        setSavedPlaylists(
          stored.map((p) => ({
            ...p,
            lastPlayed: p.lastPlayed ? new Date(p.lastPlayed) : undefined,
          }))
        )
      }
    }
    load()
  }, [user, syncVersion])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [playlistEmoji, setPlaylistEmoji] = useState('🎵')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const PRESET_EMOJIS = [
    '🎵', '🎶', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '🎼',
    '☁️', '🌙', '📖', '💖', '🎃', '❄️', '🌊', '🌸', '⭐', '✨',
    '🔥', '💫', '🍀', '🎭', '🎨',
  ]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)

  const favoritePlaylists = savedPlaylists.filter((p) => p.isFavorite)
  const recentPlaylists = savedPlaylists
    .filter((p) => p.lastPlayed)
    .sort((a, b) => (b.lastPlayed?.getTime() ?? 0) - (a.lastPlayed?.getTime() ?? 0))
    .slice(0, 5)

  const handleLoad = () => {
    if (inputValue.trim()) setUrl(inputValue.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLoad()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onReady = (event: any) => {
    playerRef.current = event.target
    event.target.setVolume(volume)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onStateChange = (event: any) => {
    const state = event.data
    setIsPlaying(state === 1)
    // 단일 영상 반복: 영상 종료(0) 시 처음부터 재생
    if (state === 0 && isRepeatRef.current && !listId) {
      playerRef.current?.seekTo(0, true)
      playerRef.current?.playVideo()
    }
  }

  const togglePlay = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    playerRef.current?.setVolume?.(v)
  }

  const persistPlaylists = async (updated: SavedPlaylist[]) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // 🌐 Supabase — 전체 삭제 후 재삽입
      await supabase.from('playlists').delete().eq('user_id', session.user.id)
      if (updated.length > 0) {
        await supabase.from('playlists').insert(
          updated.map((p) => ({
            id: p.id,
            user_id: session.user.id,
            name: p.name,
            url: p.url,
            emoji: p.emoji,
            is_favorite: p.isFavorite,
            last_played: p.lastPlayed?.toISOString() ?? null,
          }))
        )
      }
    } else {
      // 💾 로컬 IPC
      window.electronAPI.playlists.save(
        updated.map((p) => ({ ...p, lastPlayed: p.lastPlayed?.toISOString() }))
      )
    }
  }

  const loadPlaylist = (playlist: SavedPlaylist) => {
    setCurrentPlaylist(playlist)
    setInputValue(playlist.url)
    setUrl(playlist.url)
    setSavedPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === playlist.id ? { ...p, lastPlayed: new Date() } : p))
      persistPlaylists(updated)
      return updated
    })
  }

  const toggleFavorite = (playlistId: string) => {
    setSavedPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === playlistId ? { ...p, isFavorite: !p.isFavorite } : p))
      persistPlaylists(updated)
      return updated
    })
  }

  const deletePlaylist = (playlistId: string) => {
    setSavedPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== playlistId)
      persistPlaylists(updated)
      return updated
    })
    if (currentPlaylist?.id === playlistId) setCurrentPlaylist(null)
  }

  const saveCurrentPlaylist = () => {
    if (inputValue.trim() && playlistName.trim()) {
      const newPlaylist: SavedPlaylist = {
        id: Date.now().toString(),
        name: playlistName,
        url: inputValue.trim(),
        emoji: playlistEmoji,
        isFavorite: false,
        lastPlayed: new Date(),
      }
      setSavedPlaylists((prev) => {
        const updated = [...prev, newPlaylist]
        persistPlaylists(updated)
        return updated
      })
      setCurrentPlaylist(newPlaylist)
      setPlaylistName('')
      setPlaylistEmoji('🎵')
      setShowEmojiPicker(false)
      setShowSaveDialog(false)
    }
  }

  const closeSaveDialog = () => {
    setShowSaveDialog(false)
    setPlaylistName('')
    setPlaylistEmoji('🎵')
    setShowEmojiPicker(false)
  }

  // 셔플: YouTube 플레이리스트일 때만 작동
  const canShuffle = !!listId
  const handleShuffle = () => {
    if (!canShuffle) return
    const next = !isShuffle
    setIsShuffle(next)
    playerRef.current?.setShuffle?.(next)
  }

  // 다음 곡: 플레이리스트 → nextVideo() / 단일 영상 → 라이브러리 다음 항목
  const canSkipNext = !!listId || savedPlaylists.length > 0
  const skipNext = () => {
    if (listId) {
      playerRef.current?.nextVideo?.()
    } else {
      if (savedPlaylists.length === 0) return
      const currentIndex = currentPlaylist
        ? savedPlaylists.findIndex((p) => p.id === currentPlaylist.id)
        : -1
      const nextIndex = (currentIndex + 1) % savedPlaylists.length
      loadPlaylist(savedPlaylists[nextIndex])
    }
  }

  // 반복: 플레이리스트 → setLoop / 단일 영상 → onStateChange에서 처리
  const handleRepeat = () => {
    const next = !isRepeat
    setIsRepeat(next)
    isRepeatRef.current = next
    if (listId) playerRef.current?.setLoop?.(next)
  }

  const hasMedia = videoId !== null || listId !== null

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1 as const,
...(listId ? { list: listId, listType: 'playlist' as const } : {}),
    },
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Main Player – left 2 columns */}
      <div
        className="col-span-2 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #E8F5FF 0%, #FFF0F8 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div className="p-5">
          {/* Video Area */}
          <div
            className="rounded-2xl overflow-hidden mb-3"
            style={{
              height: '220px',
              background: 'linear-gradient(135deg, #e9d5ff 0%, #fce7f3 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {hasMedia ? (
              <YouTube
                videoId={videoId ?? undefined}
                opts={opts}
                onReady={onReady}
                onStateChange={onStateChange}
                className="w-full h-full"
                iframeClassName="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl text-center shadow-lg">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)' }}
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                  <p className="text-purple-700 font-medium mb-1">Ready to study!</p>
                  <p className="text-purple-500 text-xs">아래에 YouTube URL을 붙여넣으세요</p>
                </div>
              </div>
            )}
          </div>

          {/* Current Playlist Info */}
          {currentPlaylist && (
            <div className="mb-3 text-center">
              <div className="inline-flex items-center gap-2 bg-white/70 px-4 py-2 rounded-2xl shadow-sm">
                <span className="text-lg">{currentPlaylist.emoji}</span>
                <span className="text-sm font-medium text-purple-700">{currentPlaylist.name}</span>
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              placeholder="YouTube URL 또는 재생목록 URL 붙여넣기..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-all text-sm text-purple-800 placeholder-purple-300"
              style={{
                background: 'linear-gradient(to bottom, #ffffff, #fefbff)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
              }}
            />
            <button
              onClick={handleLoad}
              className="px-4 py-2.5 rounded-2xl text-white font-medium text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)' }}
            >
              Load
            </button>
          </div>

          {/* Save Playlist Button */}
          {inputValue && !showSaveDialog && (
            <div className="mb-3">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="w-full px-4 py-2 text-sm rounded-xl transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #E5D5FF 0%, #FFE5F0 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">Save this playlist</span>
                </div>
              </button>
            </div>
          )}

          {/* Save Dialog */}
          {showSaveDialog && (
            <div
              className="mb-3 p-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 100%)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              {/* Emoji + Name input row */}
              <div className="flex gap-2 mb-2">
                {/* Emoji button */}
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: showEmojiPicker ? 'rgba(255,182,217,0.2)' : 'white',
                    border: `2px solid ${showEmojiPicker ? 'rgba(249,168,212,0.8)' : 'rgba(249,168,212,0.6)'}`,
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
                  }}
                >
                  {playlistEmoji}
                </button>

                {/* Name input */}
                <input
                  type="text"
                  placeholder="플레이리스트 이름..."
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveCurrentPlaylist()}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-all"
                  style={{ background: 'white', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)' }}
                />
              </div>

              {/* Inline emoji grid */}
              {showEmojiPicker && (
                <div
                  className="mb-2 p-2 rounded-xl"
                  style={{
                    background: 'white',
                    border: '1.5px solid rgba(249,168,212,0.4)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="grid grid-cols-5 gap-1">
                    {PRESET_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => { setPlaylistEmoji(e); setShowEmojiPicker(false) }}
                        className={`h-8 rounded-lg text-base flex items-center justify-center transition-all hover:scale-110 ${
                          playlistEmoji === e ? 'bg-pink-100' : 'hover:bg-pink-50'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveCurrentPlaylist}
                  className="flex-1 px-3 py-2 text-sm rounded-xl transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(255,107,157,0.4)',
                  }}
                >
                  <span className="text-white font-medium">Save</span>
                </button>
                <button
                  onClick={closeSaveDialog}
                  className="px-4 py-2 text-sm rounded-xl transition-all bg-white/60 hover:bg-white/80"
                >
                  <span className="text-purple-600">Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/80"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* 셔플: 플레이리스트일 때만 활성 */}
              <button
                onClick={handleShuffle}
                title={canShuffle ? (isShuffle ? '셔플 끄기' : '셔플 켜기') : '플레이리스트에서만 사용 가능'}
                disabled={!canShuffle}
                className="p-2 rounded-xl transition-all"
                style={{
                  background: isShuffle ? 'rgba(167,139,250,0.2)' : 'transparent',
                  cursor: canShuffle ? 'pointer' : 'not-allowed',
                  opacity: canShuffle ? 1 : 0.35,
                }}
              >
                <Shuffle
                  className="w-5 h-5"
                  style={{ color: isShuffle ? '#7C3AED' : '#A78BFA' }}
                />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(255,107,157,0.4)',
                }}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                )}
              </button>

              {/* 다음 곡: 플레이리스트 or 라이브러리에 항목 있을 때 활성 */}
              <button
                onClick={skipNext}
                title={canSkipNext ? '다음 곡' : '재생할 항목 없음'}
                disabled={!canSkipNext}
                className="p-2 rounded-xl transition-all"
                style={{
                  cursor: canSkipNext ? 'pointer' : 'not-allowed',
                  opacity: canSkipNext ? 1 : 0.35,
                }}
              >
                <SkipForward
                  className="w-5 h-5"
                  style={{ color: canSkipNext ? '#A78BFA' : '#C4B5FD' }}
                />
              </button>

              {/* 반복: 항상 사용 가능 */}
              <button
                onClick={handleRepeat}
                title={isRepeat ? '반복 끄기' : '반복 켜기'}
                className="p-2 rounded-xl transition-all"
                style={{
                  background: isRepeat ? 'rgba(167,139,250,0.2)' : 'transparent',
                }}
              >
                <Repeat
                  className="w-5 h-5"
                  style={{ color: isRepeat ? '#7C3AED' : '#A78BFA' }}
                />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1.5 rounded-full accent-purple-400 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #A78BFA ${volume}%, #E9D5FF ${volume}%)`,
                }}
              />
              <span className="text-xs text-purple-400 w-6 text-right tabular-nums">{volume}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Library – right 1 column */}
      <div
        className="col-span-1 rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE8F5 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <div className="p-4 h-full flex flex-col">
          {/* Library Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Music2 className="w-4 h-4 text-pink-500" />
              <h3 className="font-bold text-pink-700" style={{ fontSize: '15px' }}>
                Playlist Library
              </h3>
            </div>
            <p className="text-xs text-pink-400">저장된 재생목록</p>
          </div>

          {/* Scrollable Playlist Area */}
          <div
            className="flex-1 overflow-y-auto pr-1 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#F9A8D4 #FCE7F3' }}
          >
            {/* Favorites Section */}
            {favoritePlaylists.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-200 to-rose-200 px-2.5 py-1 rounded-full shadow-sm">
                    <Heart className="w-3 h-3 text-pink-600 fill-pink-600" />
                    <span className="text-xs font-bold text-pink-700">Favorites</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {favoritePlaylists.map((playlist) => (
                    <div key={playlist.id} className="relative group">
                      <div
                        className="absolute inset-0 rounded-xl blur-sm opacity-40"
                        style={{
                          background: 'linear-gradient(135deg, #FFB6D9 0%, #FFC9E5 100%)',
                        }}
                      />
                      <button
                        onClick={() => loadPlaylist(playlist)}
                        className="relative w-full text-left rounded-xl p-3 border transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background:
                            currentPlaylist?.id === playlist.id
                              ? 'linear-gradient(135deg, #FFF0F8 0%, #FFEBF4 100%)'
                              : 'linear-gradient(to bottom, #ffffff, #fffbfe)',
                          borderColor:
                            currentPlaylist?.id === playlist.id
                              ? '#FFB6D9'
                              : 'rgba(255, 182, 217, 0.3)',
                          boxShadow:
                            currentPlaylist?.id === playlist.id
                              ? 'inset 0 1px 0 rgba(255,255,255,0.9), 0 3px 10px rgba(255,107,157,0.3)'
                              : 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.08)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl flex-shrink-0">{playlist.emoji}</span>
                          <p className="flex-1 text-sm font-medium text-pink-700 truncate min-w-0">
                            {playlist.name}
                          </p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(playlist.id)
                              }}
                              className="p-1 rounded-lg hover:bg-pink-100 transition-all"
                            >
                              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePlaylist(playlist.id)
                              }}
                              className="p-1 rounded-lg hover:bg-red-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider between sections */}
            {favoritePlaylists.length > 0 && recentPlaylists.length > 0 && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                <div className="text-xs text-pink-300">✦</div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
              </div>
            )}

            {/* Recent Section */}
            {recentPlaylists.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="bg-purple-100/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">Recent</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {recentPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => loadPlaylist(playlist)}
                      className="w-full text-left rounded-lg px-3 py-2.5 border border-purple-100/50 transition-all hover:bg-white/80 hover:shadow-md active:scale-[0.98] group"
                      style={{
                        background:
                          currentPlaylist?.id === playlist.id
                            ? 'linear-gradient(135deg, #F8F0FF 0%, #FFF0F8 100%)'
                            : 'rgba(255,255,255,0.5)',
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg flex-shrink-0">{playlist.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-purple-700 truncate">
                            {playlist.name}
                          </p>
                          {playlist.lastPlayed && (
                            <p className="text-xs text-purple-400 mt-0.5">
                              {new Date(playlist.lastPlayed).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(playlist.id)
                            }}
                            className="p-1 rounded-md hover:bg-pink-100 transition-all"
                          >
                            <Heart
                              className={`w-3 h-3 ${
                                playlist.isFavorite
                                  ? 'text-pink-500 fill-pink-500'
                                  : 'text-purple-300'
                              }`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePlaylist(playlist.id)
                            }}
                            className="p-1 rounded-md hover:bg-red-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {savedPlaylists.length === 0 && (
              <div className="text-center py-6">
                <div className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl inline-block shadow-sm">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #F9A8D4 0%, #C4B5FD 100%)' }}
                  >
                    <Music2 className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-pink-600 text-xs font-medium mb-1">저장된 재생목록 없음</p>
                  <p className="text-pink-400 text-xs">URL 입력 후 저장해보세요!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

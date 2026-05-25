import { useRef, useState } from 'react'
import YouTube from 'react-youtube'
import { Play, Pause, SkipForward, Shuffle, Repeat, Volume2 } from 'lucide-react'
import { usePlayerStore } from '../store/usePlayerStore'

export default function YouTubePlayer() {
  const { videoId, listId, isPlaying, setUrl, setIsPlaying } = usePlayerStore()
  const [inputValue, setInputValue] = useState('')
  const [volume, setVolume] = useState(70)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)

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
    // 1 = playing, 2 = paused, 0 = ended
    setIsPlaying(event.data === 1)
  }

  const togglePlay = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const skipNext = () => {
    playerRef.current?.nextVideo?.()
  }

  const handleShuffle = () => {
    playerRef.current?.setShuffle?.(true)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    playerRef.current?.setVolume?.(v)
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
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #E8F5FF 0%, #FFF0F8 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div className="p-5">
        {/* Video Area */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            height: '300px',
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
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl text-center shadow-lg">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)' }}
                >
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
                <p className="text-purple-700 font-medium text-lg mb-2">Ready to study!</p>
                <p className="text-purple-500 text-sm">아래에 YouTube URL을 붙여넣으세요</p>
              </div>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="YouTube URL 또는 재생목록 URL 붙여넣기..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none transition-all text-sm text-purple-800 placeholder-purple-300"
            style={{
              background: 'linear-gradient(to bottom, #ffffff, #fefbff)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
            }}
          />
          <button
            onClick={handleLoad}
            className="px-5 py-3 rounded-2xl text-white font-medium text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)' }}
          >
            Load
          </button>
        </div>

        {/* Controls */}
        <div
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/80"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.08)' }}
        >
          {/* Play Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handleShuffle}
              title="셔플"
              className="p-2 rounded-xl hover:bg-purple-100 transition-all"
            >
              <Shuffle className="w-5 h-5 text-purple-500" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(255,107,157,0.4)',
              }}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white fill-white" />
              ) : (
                <Play className="w-7 h-7 text-white fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={skipNext}
              title="다음 곡"
              className="p-2 rounded-xl hover:bg-purple-100 transition-all"
            >
              <SkipForward className="w-5 h-5 text-purple-500" />
            </button>

            <button
              title="반복"
              className="p-2 rounded-xl hover:bg-purple-100 transition-all"
            >
              <Repeat className="w-5 h-5 text-purple-500" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1.5 rounded-full accent-purple-400 cursor-pointer"
              style={{ background: `linear-gradient(to right, #A78BFA ${volume}%, #E9D5FF ${volume}%)` }}
            />
            <span className="text-xs text-purple-400 w-6 text-right tabular-nums">{volume}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

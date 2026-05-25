import { create } from 'zustand'

interface ParsedUrl {
  videoId: string | null
  listId: string | null
}

function parseYouTubeUrl(url: string): ParsedUrl {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      return {
        videoId: parsed.pathname.slice(1) || null,
        listId: parsed.searchParams.get('list'),
      }
    }
    if (parsed.hostname.includes('youtube.com')) {
      return {
        videoId: parsed.searchParams.get('v'),
        listId: parsed.searchParams.get('list'),
      }
    }
  } catch {
    // invalid URL
  }
  return { videoId: null, listId: null }
}

interface PlayerStore {
  url: string
  videoId: string | null
  listId: string | null
  isPlaying: boolean
  setUrl: (url: string) => void
  setIsPlaying: (playing: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  url: '',
  videoId: null,
  listId: null,
  isPlaying: false,

  setUrl: (url: string) => {
    const { videoId, listId } = parseYouTubeUrl(url)
    set({ url, videoId, listId })
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
}))

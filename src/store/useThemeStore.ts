import { create } from 'zustand'

export interface ThemeVars {
  '--t-c1': string        // primary accent (button start)
  '--t-c1b': string       // primary accent (button end)
  '--t-c1-glow': string   // primary glow for box-shadow
  '--t-c2': string        // secondary accent
  '--t-c2b': string       // secondary accent dark
  '--t-c2-soft': string   // secondary very soft (empty states, tracks)
  '--t-c2-glow': string   // secondary glow
  '--t-scroll': string    // scrollbar thumb
  '--t-scroll-track': string
  '--t-text': string      // main text color (deep)
  '--t-text-soft': string // secondary text color
  '--t-text-light': string// light/dim text color
  '--t-avatar-a': string  // avatar gradient start
  '--t-avatar-b': string  // avatar gradient end
}

export interface Theme {
  id: string
  name: string
  emoji: string
  pageBg: string
  headerBg: string
  swatch: string[]
  vars: ThemeVars
}

export const THEMES: Theme[] = [
  {
    id: 'pink',
    name: '핑크',
    emoji: '🌸',
    pageBg: 'linear-gradient(135deg, #FFF5F7 0%, #E8F4FF 50%, #F5E8FF 100%)',
    headerBg: 'linear-gradient(135deg, #FFB6D9 0%, #D4A5F5 50%, #A8D8F0 100%)',
    swatch: ['#FFB6D9', '#D4A5F5', '#A8D8F0'],
    vars: {
      '--t-c1': '#FF6B9D',
      '--t-c1b': '#C239B3',
      '--t-c1-glow': 'rgba(255,107,157,0.4)',
      '--t-c2': '#A78BFA',
      '--t-c2b': '#7C3AED',
      '--t-c2-soft': '#EDE9FE',
      '--t-c2-glow': 'rgba(167,139,250,0.4)',
      '--t-scroll': '#F9A8D4',
      '--t-scroll-track': '#FCE7F3',
      '--t-text': '#6D28D9',
      '--t-text-soft': '#9333EA',
      '--t-text-light': '#C084FC',
      '--t-avatar-a': '#A8D8F0',
      '--t-avatar-b': '#A78BFA',
    },
  },
  {
    id: 'mint',
    name: '민트',
    emoji: '🌿',
    pageBg: 'linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 50%, #EBF8FF 100%)',
    headerBg: 'linear-gradient(135deg, #86EFAC 0%, #34D399 50%, #67E8F9 100%)',
    swatch: ['#86EFAC', '#34D399', '#67E8F9'],
    vars: {
      '--t-c1': '#34D399',
      '--t-c1b': '#059669',
      '--t-c1-glow': 'rgba(52,211,153,0.4)',
      '--t-c2': '#2DD4BF',
      '--t-c2b': '#0D9488',
      '--t-c2-soft': '#CCFBF1',
      '--t-c2-glow': 'rgba(45,212,191,0.4)',
      '--t-scroll': '#6EE7B7',
      '--t-scroll-track': '#ECFDF5',
      '--t-text': '#065F46',
      '--t-text-soft': '#059669',
      '--t-text-light': '#34D399',
      '--t-avatar-a': '#86EFAC',
      '--t-avatar-b': '#2DD4BF',
    },
  },
  {
    id: 'sunset',
    name: '선셋',
    emoji: '🌅',
    pageBg: 'linear-gradient(135deg, #FFF7ED 0%, #FFF1F2 50%, #FDF4FF 100%)',
    headerBg: 'linear-gradient(135deg, #FCA5A5 0%, #FB923C 50%, #F472B6 100%)',
    swatch: ['#FCA5A5', '#FB923C', '#F472B6'],
    vars: {
      '--t-c1': '#FB923C',
      '--t-c1b': '#EA580C',
      '--t-c1-glow': 'rgba(251,146,60,0.4)',
      '--t-c2': '#F472B6',
      '--t-c2b': '#DB2777',
      '--t-c2-soft': '#FDF2F8',
      '--t-c2-glow': 'rgba(244,114,182,0.4)',
      '--t-scroll': '#FDBA74',
      '--t-scroll-track': '#FFF7ED',
      '--t-text': '#9A3412',
      '--t-text-soft': '#C2410C',
      '--t-text-light': '#FB923C',
      '--t-avatar-a': '#FCA5A5',
      '--t-avatar-b': '#F472B6',
    },
  },
  {
    id: 'ocean',
    name: '오션',
    emoji: '🌊',
    pageBg: 'linear-gradient(135deg, #EFF6FF 0%, #E0F2FE 50%, #F0FDFA 100%)',
    headerBg: 'linear-gradient(135deg, #93C5FD 0%, #38BDF8 50%, #2DD4BF 100%)',
    swatch: ['#93C5FD', '#38BDF8', '#2DD4BF'],
    vars: {
      '--t-c1': '#38BDF8',
      '--t-c1b': '#0284C7',
      '--t-c1-glow': 'rgba(56,189,248,0.4)',
      '--t-c2': '#2DD4BF',
      '--t-c2b': '#0F766E',
      '--t-c2-soft': '#CCFBF1',
      '--t-c2-glow': 'rgba(45,212,191,0.4)',
      '--t-scroll': '#7DD3FC',
      '--t-scroll-track': '#EFF6FF',
      '--t-text': '#0C4A6E',
      '--t-text-soft': '#0369A1',
      '--t-text-light': '#38BDF8',
      '--t-avatar-a': '#93C5FD',
      '--t-avatar-b': '#2DD4BF',
    },
  },
  {
    id: 'lavender',
    name: '라벤더',
    emoji: '💜',
    pageBg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #FAF5FF 100%)',
    headerBg: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #E879F9 100%)',
    swatch: ['#C4B5FD', '#A78BFA', '#E879F9'],
    vars: {
      '--t-c1': '#C084FC',
      '--t-c1b': '#9333EA',
      '--t-c1-glow': 'rgba(192,132,252,0.4)',
      '--t-c2': '#E879F9',
      '--t-c2b': '#C026D3',
      '--t-c2-soft': '#FAF5FF',
      '--t-c2-glow': 'rgba(232,121,249,0.4)',
      '--t-scroll': '#DDD6FE',
      '--t-scroll-track': '#EDE9FE',
      '--t-text': '#5B21B6',
      '--t-text-soft': '#7C3AED',
      '--t-text-light': '#C084FC',
      '--t-avatar-a': '#DDD6FE',
      '--t-avatar-b': '#E879F9',
    },
  },
]

interface ThemeStore {
  theme: Theme
  setTheme: (id: string) => void
  loadTheme: () => Promise<void>
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: THEMES[0],

  setTheme: (id: string) => {
    const found = THEMES.find((t) => t.id === id) ?? THEMES[0]
    set({ theme: found })
    // CSS 변수 즉시 적용
    Object.entries(found.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
    window.electronAPI.settings.set('themeId', id)
  },

  loadTheme: async () => {
    const saved = await window.electronAPI.settings.get()
    const id = saved.themeId as string | undefined
    const found = THEMES.find((t) => t.id === id) ?? THEMES[0]
    set({ theme: found })
    // CSS 변수 초기 적용
    Object.entries(found.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  },
}))

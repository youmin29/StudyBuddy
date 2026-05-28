# 📚 Study Buddy

> 공부할 때 곁에 두는 나만의 올인원 스터디 데스크 앱

YouTube 음악 플레이어 + 할 일 관리 + 미니 캘린더를 하나의 화면에 담은 macOS 데스크탑 앱입니다.  
Glassmorphism 디자인과 파스텔 그라데이션으로 공부하는 내내 기분 좋은 환경을 만들어줍니다.

---

## ✨ 주요 기능

### 🔔 업데이트 알림
- 앱 실행 시 GitHub Releases를 자동으로 조회하여 새 버전 감지
- 새 버전이 있으면 프로필 메뉴 하단에 **업데이트 다운로드** 버튼 등장
- 버튼 클릭 시 기본 브라우저에서 GitHub 릴리즈 페이지 바로 열림

### 🎨 배경 테마 5종
- **핑크 🌸 · 민트 🌿 · 선셋 🌅 · 오션 🌊 · 라벤더 💜** 총 5가지 테마 지원
- 테마를 바꾸면 버튼·아이콘·슬라이더·스크롤바·텍스트 색상이 전체 연동
- 프로필 메뉴 → **테마 변경** 항목에서 현재 스와치 미리보기와 함께 전환 가능
- 선택한 테마는 앱 재시작 후에도 유지

### 👤 닉네임 편집
- 프로필 메뉴에서 이름에 마우스를 올리면 연필 아이콘 등장
- 클릭하면 인라인 편집 모드 — Enter로 저장, Escape로 취소
- 닉네임은 Supabase `user_metadata`에 저장되어 다기기에서 동기화

### ⚡ 실시간 동기화 (Supabase Realtime)
- **할 일 목록**: 다른 기기에서 추가·완료·삭제 시 새로고침 없이 즉시 반영
- **재생목록**: 다른 기기에서 저장·삭제 시 자동 갱신
- 자기 기기의 변경은 에코(중복 반영) 없이 처리
- 로그아웃 시 구독 자동 해제

### 🎵 YouTube 플레이어
- YouTube 영상 및 재생목록 URL을 붙여넣어 바로 재생
- 재생 / 일시정지 / 다음 곡 / 셔플 / 볼륨 조절
- 재생목록을 이름 + 이모지와 함께 저장
- 즐겨찾기(♥)와 최근 재생 목록으로 빠르게 접근
- 앱을 껐다 켜도 저장된 재생목록이 유지됨

### ✅ 투두리스트
- 날짜별 할 일 관리
- ⭐ 중요 표시: 하트 배지 + 분홍 글로우 카드로 강조
- 완료 체크 / 삭제 기능
- **설정 모달**: 완료된 항목을 캘린더 인디케이터에서 숨기기

### 🍅 Pomodoro 타이머
- 집중 / 짧은 휴식 / 긴 휴식 세 가지 모드 지원
- 타이머 시간 직접 설정 가능 (기본값: 집중 25분 / 짧은 휴식 5분 / 긴 휴식 15분)
- 집중 세션 완료 횟수 및 총 집중 시간 기록
- 타이머 종료 시 macOS 알림 발송
- YouTube 플레이어 우측 패널에 탭 형식으로 통합

### 📅 미니 캘린더
- 월 탐색 및 날짜 선택
- 할 일이 있는 날짜에 인디케이터 표시
  - ⭐ 별 = 중요 할 일이 있는 날
  - 🔴 점 = 일반 할 일이 있는 날
  - 둘 다 있으면 별 + 점 함께 표시
- 완료된 항목 숨기기 설정 시 별 / 점 독립적으로 사라짐
- 선택된 날짜의 인디케이터는 흰색으로 표시

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| UI 프레임워크 | React 18 + TypeScript |
| 스타일링 | Tailwind CSS + 인라인 Glassmorphism |
| 상태 관리 | Zustand |
| 데스크탑 런타임 | Electron 30 |
| 로컬 DB | better-sqlite3 (비로그인 시 투두리스트) |
| 클라우드 DB | Supabase (투두·플레이리스트·설정 — 로그인 시) |
| 실시간 동기화 | Supabase Realtime (Postgres Changes) |
| YouTube | react-youtube (IFrame API) |
| 아이콘 | lucide-react |
| 빌드 도구 | Vite + electron-builder |

---

## 🚀 시작하기

### 요구 사항

- Node.js 18+
- macOS (Apple Silicon) 또는 Windows (x64)

### 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 + Electron 실행
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

빌드가 완료되면 아래 경로에 결과물이 생성됩니다.

```
release/1.4.0/
├── mac-arm64/Study Buddy.app              ← macOS: 바로 실행 가능
├── Study Buddy-Mac-1.4.0-Installer.dmg    ← macOS: 설치 패키지
└── Study Buddy-Windows-1.4.0-Setup.exe   ← Windows: 설치 파일
```

> **팁**: DMG 설치 없이 `mac-arm64` 폴더 안의 `.app`을 더블클릭해서 바로 실행할 수 있습니다.

### 자동 빌드 (GitHub Actions)

`v*.*.*` 형식의 태그를 push하면 macOS + Windows 빌드가 자동으로 실행되고  
GitHub Releases에 DMG, EXE 파일이 자동 업로드됩니다.

```bash
git tag v1.4.0
git push origin v1.4.0
```

---

## 📁 프로젝트 구조

```
studybuddy/
├── electron/
│   ├── main.ts           # 메인 프로세스 (DB, 로컬 HTTP 서버, IPC 핸들러)
│   ├── preload.ts        # IPC 브릿지 (todos / playlists / settings / auth)
│   └── electron-env.d.ts # 타입 정의
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── MiniCalendar.tsx
│   │   ├── TodoPanel.tsx
│   │   ├── PomodoroTimer.tsx
│   │   ├── AuthModal.tsx
│   │   ├── ProfileMenu.tsx    # 닉네임 편집 + 테마 변경 아코디언 포함
│   │   ├── ThemePicker.tsx    # 테마 스와치 선택 UI
│   │   ├── SyncModal.tsx      # 로컬 → 클라우드 데이터 마이그레이션
│   │   └── YouTubePlayer.tsx
│   ├── lib/
│   │   ├── supabase.ts        # Supabase 클라이언트 (커스텀 스토리지 어댑터)
│   │   └── sync.ts            # 로컬 ↔ 클라우드 동기화
│   └── store/
│       ├── useTodoStore.ts    # 투두 + 설정 상태 + Realtime 구독
│       ├── usePlayerStore.ts  # YouTube URL 파싱 상태
│       ├── useAuthStore.ts    # 로그인 상태 + 플레이리스트 Realtime 구독
│       └── useThemeStore.ts   # 테마 선택 + CSS 변수 주입
└── release/                   # 빌드 결과물
```

---

## 💾 데이터 저장 위치

| 데이터 | 비로그인 | 로그인 (Supabase) |
|--------|----------|-------------------|
| 투두리스트 | SQLite (`study-buddy.db`) | `todos` 테이블 |
| 플레이리스트 | JSON 파일 (`playlists.json`) | `playlists` 테이블 |
| 설정 | JSON 파일 (`settings.json`) | `user_settings` 테이블 |
| 닉네임 | — | `user_metadata` |
| 테마 | `localStorage` | `localStorage` |

> 로컬 파일 경로 (macOS): `~/Library/Application Support/Study Buddy/`

---

## 📝 업데이트 기록

버전별 상세 릴리즈 노트는 **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** 또는 **BuddyDrop**에서 확인할 수 있어요.

> 🔗 **[buddy-drop.vercel.app](https://buddy-drop.vercel.app/)**

---

## 💡 알려진 제한 사항

- **코드 서명 없음** — macOS에서 "개발자를 확인할 수 없음" 경고가 표시될 수 있습니다.  
  `시스템 설정 > 개인 정보 보호 및 보안`에서 허용하거나, `Ctrl+클릭 → 열기`로 실행하세요.
- **임베드 비허용 영상** — 영상 업로더가 임베드를 비허용한 경우 재생되지 않습니다 (YouTube 정책).
- **Windows 빌드는 Windows 환경 필요** — macOS에서 Windows EXE 로컬 빌드는 불가합니다. GitHub Actions를 이용하세요.

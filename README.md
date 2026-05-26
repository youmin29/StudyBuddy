# 📚 Study Buddy

> 공부할 때 곁에 두는 나만의 올인원 스터디 데스크 앱

YouTube 음악 플레이어 + 할 일 관리 + 미니 캘린더를 하나의 화면에 담은 macOS 데스크탑 앱입니다.  
Glassmorphism 디자인과 파스텔 그라데이션으로 공부하는 내내 기분 좋은 환경을 만들어줍니다.

---

## ✨ 주요 기능

### 🎵 YouTube 플레이어
- YouTube 영상 및 재생목록 URL을 붙여넣어 바로 재생
- 재생 / 일시정지 / 다음 곡 / 셔플 / 볼륨 조절
- 재생목록을 이름 + 이모지와 함께 저장
- 즐겨찾기(♥)와 최근 재생 목록으로 빠르게 접근
- 앱을 껐다 켜도 저장된 재생목록이 유지됨

### ✅ 투두리스트
- 날짜별 할 일 관리 (SQLite DB에 영구 저장)
- ⭐ 중요 표시: 하트 배지 + 분홍 글로우 카드로 강조
- 완료 체크 / 삭제 기능
- **설정 모달**: 완료된 항목을 캘린더 인디케이터에서 숨기기

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
| 데이터베이스 | better-sqlite3 (투두리스트) |
| 영구 저장 | IPC → userData JSON 파일 (플레이리스트, 설정) |
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
release/1.0.0/
├── mac-arm64/Study Buddy.app          ← macOS: 바로 실행 가능
├── Study Buddy-Mac-1.0.0-Installer.dmg   ← macOS: 설치 패키지
└── Study Buddy-Windows-1.0.0-Setup.exe  ← Windows: 설치 파일
```

> **팁**: DMG 설치 없이 `mac-arm64` 폴더 안의 `.app`을 더블클릭해서 바로 실행할 수 있습니다.

### 자동 빌드 (GitHub Actions)

`v*.*.*` 형식의 태그를 push하면 macOS + Windows 빌드가 자동으로 실행되고  
GitHub Releases에 DMG, EXE 파일이 자동 업로드됩니다.

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 📁 프로젝트 구조

```
study-buddy-fe/
├── electron/
│   ├── main.ts           # 메인 프로세스 (DB, 로컬 HTTP 서버, IPC 핸들러)
│   ├── preload.ts        # IPC 브릿지 (todos / playlists / settings)
│   └── electron-env.d.ts # 타입 정의
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── MiniCalendar.tsx
│   │   ├── TodoPanel.tsx
│   │   └── YouTubePlayer.tsx
│   ├── pages/
│   │   └── Home.tsx
│   └── store/
│       ├── useTodoStore.ts    # 투두 + 설정 상태
│       └── usePlayerStore.ts  # YouTube URL 파싱 상태
└── release/                   # 빌드 결과물
```

---

## 💾 데이터 저장 위치

| 데이터 | 저장 방식 | 경로 |
|--------|-----------|------|
| 투두리스트 | SQLite | `~/Library/Application Support/Study Buddy/study-buddy.db` |
| 플레이리스트 | JSON 파일 | `~/Library/Application Support/Study Buddy/playlists.json` |
| 설정 | JSON 파일 | `~/Library/Application Support/Study Buddy/settings.json` |

---

## 📝 업데이트 기록

---

### 2026-05-26 — v1.1.0 클라우드 동기화

**☁️ 계정 & 클라우드 동기화 (Supabase)**
- 이메일/비밀번호 회원가입 · 로그인 기능 추가
- 헤더에 Guest Mode 버튼 → 클릭 시 로그인 모달 팝업
- 로그인 후 프로필 드롭다운 메뉴 (이메일 표시 + 로그아웃)
- 로그인 시 로컬 데이터 → 클라우드 업로드 선택 모달
  - 업로드 / 클라우드 데이터 사용 / 나중에 결정 선택 가능
  - 업로드 완료 시 투두·플레이리스트 개수 확인 카드 표시
- Dual-mode 저장: 로그인 상태에선 Supabase, 비로그인 상태에선 로컬 IPC 자동 전환
- 투두·플레이리스트·설정 모두 Supabase와 동기화

---

### 2026-05-25 — v1.0.0 첫 릴리즈

**🎨 UI / 디자인**
- Glassmorphism 테마 적용 — `backdrop-blur`, rgba 배경, 그라데이션 테두리로 전체 UI 구성
- Retro Productivity UI v2 디자인 반영 — 설정 모달, 설정 아이콘 스타일 교체
- 하단 푸터 그라데이션 제거

**📅 캘린더**
- 인디케이터 리디자인 — 개수 기반 점(최대 3개) → 별(중요) + 점(일반) 각 1개
- 선택된 날짜의 별/점 인디케이터 흰색으로 변경 (분홍 배경 위 가시성 확보)
- 별/점 독립 숨김 처리 — 완료 숨기기 설정 시 중요/일반 각각 독립적으로 제어

**✅ 투두리스트**
- 중요 항목 UX 강화 — 분홍 글로우 카드 + 코너 하트 배지
- 설정 모달 추가 — 완료 항목 캘린더 인디케이터 숨기기 옵션
- 중요 카드 가로 잘림 버그 수정 (`overflow-x-hidden` + `px-3`)
- 한글 IME 이중 입력 버그 수정 — Enter 시 투두 2개 생성되던 문제 (`isComposing` 체크)

**🎵 YouTube 플레이어**
- 이모지 플레이리스트 저장 — 이름 + 이모지(기본 🎵), 25개 프리셋 제공
- 이모지 피커 absolute 팝업 → 인라인 그리드로 변경 (잘림 문제 해결)
- 즐겨찾기(♥) / 최근 재생(🕐) 라이브러리 사이드바 구현
- 플레이리스트 영구 저장 — `localStorage` → Electron IPC 파일 저장으로 전환

**⚡ Electron**
- YouTube 재생 오류 수정 (Error 153 → 152 → 해결) — `file://` 대신 내장 로컬 HTTP 서버(`http://localhost:PORT`)로 서빙, `webSecurity: false` + Chrome User-Agent 적용
- 설정/플레이리스트 데이터 소실 수정 — 랜덤 포트로 `localStorage` origin이 매번 달라지던 문제 → `userData` JSON 파일로 전환
- IPC 채널 추가 — `playlists:get/save`, `settings:get/set`
- **Windows 지원 추가** — 타이틀바 플랫폼 분기, `icon.ico` 생성, electron-builder Windows 설정
- **GitHub Actions 워크플로우 추가** — 태그 push 시 macOS DMG + Windows EXE 자동 빌드 및 Releases 배포

---

## 💡 알려진 제한 사항

- **코드 서명 없음** — macOS에서 "개발자를 확인할 수 없음" 경고가 표시될 수 있습니다.  
  `시스템 설정 > 개인 정보 보호 및 보안`에서 허용하거나, `Ctrl+클릭 → 열기`로 실행하세요.
- **임베드 비허용 영상** — 영상 업로더가 임베드를 비허용한 경우 재생되지 않습니다 (YouTube 정책).
- **Windows 빌드는 Windows 환경 필요** — macOS에서 Windows EXE 로컬 빌드는 불가합니다. GitHub Actions를 이용하세요.

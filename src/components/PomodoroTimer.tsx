import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  BedDouble,
  Settings,
  X,
  Clock,
  Timer,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface CustomMinutes {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_MINUTES: CustomMinutes = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const getModeInfo = (mode: TimerMode) => {
  switch (mode) {
    case "focus":
      return {
        icon: Brain,
        label: "집중 세션",
        emoji: "💻",
        color: "#FF6B9D",
      };
    case "shortBreak":
      return {
        icon: Coffee,
        label: "짧은 휴식",
        emoji: "☕",
        color: "#A78BFA",
      };
    case "longBreak":
      return {
        icon: BedDouble,
        label: "긴 휴식",
        emoji: "🛏️",
        color: "#60A5FA",
      };
  }
};

const formatTime = (secs: number) =>
  `${Math.floor(secs / 60)
    .toString()
    .padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

const formatTotalTime = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 커스텀 시간 (분 단위)
  const [customMinutes, setCustomMinutes] =
    useState<CustomMinutes>(DEFAULT_MINUTES);
  const [draft, setDraft] = useState<CustomMinutes>(DEFAULT_MINUTES);

  // 남은 초 (현재 모드 기준)
  const [seconds, setSeconds] = useState(DEFAULT_MINUTES.focus * 60);

  // 총 집중 시간 (초)
  const [totalFocusSecs, setTotalFocusSecs] = useState(0);

  // refs (interval 내부에서 최신 값 참조)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef<TimerMode>("focus");
  const sessionCountRef = useRef(0);
  const totalFocusRef = useRef(0);
  const customMinutesRef = useRef<CustomMinutes>(DEFAULT_MINUTES);

  // ── 알림 권한 요청 (앱 첫 실행 시) ───────────────────────
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, silent: false });
    }
  };

  // ── 초기 로드: 저장된 설정·통계 불러오기 ──────────────────
  useEffect(() => {
    const load = async () => {
      const saved = await window.electronAPI.settings.get();

      const mins: CustomMinutes = {
        focus: Number(saved.pomodoroFocusMin) || DEFAULT_MINUTES.focus,
        shortBreak:
          Number(saved.pomodoroShortBreakMin) || DEFAULT_MINUTES.shortBreak,
        longBreak:
          Number(saved.pomodoroLongBreakMin) || DEFAULT_MINUTES.longBreak,
      };
      setCustomMinutes(mins);
      setDraft(mins);
      customMinutesRef.current = mins;
      setSeconds(mins.focus * 60);

      const total = Number(saved.pomodoroTotalFocus) || 0;
      totalFocusRef.current = total;
      setTotalFocusSecs(total);
    };
    load();
  }, []);

  // ── 타이머 tick ────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s - 1);
        // 집중 모드일 때만 총 집중 시간 누적
        if (modeRef.current === "focus") {
          totalFocusRef.current += 1;
          setTotalFocusSecs(totalFocusRef.current);
        }
      }, 1000);
    } else if (isActive && seconds === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, seconds]);

  // ── 타이머 완료 ────────────────────────────────────────────
  const handleTimerComplete = () => {
    setIsActive(false);
    setShowCompletion(true);
    saveTotalFocus();

    // 맥북 알림
    if (modeRef.current === "focus") {
      sessionCountRef.current += 1;
      setSessionCount(sessionCountRef.current);
      sendNotification("집중 시간 완료! 🎉", "이제 잠깐 쉬어봐요 ☕");
    } else if (modeRef.current === "shortBreak") {
      sendNotification("휴식 완료! 💪", "다시 집중할 시간이에요!");
    } else {
      sendNotification("긴 휴식 완료! 🌟", "재충전됐나요? 다시 시작해봐요!");
    }

    setTimeout(() => {
      setShowCompletion(false);
      const nextMode: TimerMode =
        modeRef.current === "focus"
          ? sessionCountRef.current % 4 === 0
            ? "longBreak"
            : "shortBreak"
          : "focus";
      modeRef.current = nextMode;
      setMode(nextMode);
      setSeconds(customMinutesRef.current[nextMode] * 60);
    }, 3000);
  };

  const saveTotalFocus = () =>
    window.electronAPI.settings.set(
      "pomodoroTotalFocus",
      totalFocusRef.current,
    );

  // ── 컨트롤 ─────────────────────────────────────────────────
  const toggleTimer = () => {
    if (isActive) saveTotalFocus(); // 일시정지 시 저장
    setIsActive((v) => !v);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(customMinutesRef.current[mode] * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    modeRef.current = newMode;
    setMode(newMode);
    setSeconds(customMinutesRef.current[newMode] * 60);
  };

  // ── 설정 저장 ───────────────────────────────────────────────
  const applySettings = () => {
    const validated: CustomMinutes = {
      focus: Math.max(1, Math.min(99, draft.focus)),
      shortBreak: Math.max(1, Math.min(99, draft.shortBreak)),
      longBreak: Math.max(1, Math.min(99, draft.longBreak)),
    };
    setCustomMinutes(validated);
    setDraft(validated);
    customMinutesRef.current = validated;
    setIsActive(false);
    setSeconds(validated[mode] * 60);
    setShowSettings(false);

    window.electronAPI.settings.set("pomodoroFocusMin", validated.focus);
    window.electronAPI.settings.set(
      "pomodoroShortBreakMin",
      validated.shortBreak,
    );
    window.electronAPI.settings.set(
      "pomodoroLongBreakMin",
      validated.longBreak,
    );
  };

  const cancelSettings = () => {
    setDraft(customMinutes);
    setShowSettings(false);
  };

  // ── 총 집중 시간 초기화 ─────────────────────────────────────
  const resetStats = () => {
    totalFocusRef.current = 0;
    setTotalFocusSecs(0);
    setSessionCount(0);
    sessionCountRef.current = 0;
    window.electronAPI.settings.set("pomodoroTotalFocus", 0);
  };

  const getProgress = () => {
    const total = customMinutesRef.current[mode] * 60;
    return ((total - seconds) / total) * 100;
  };

  const getCompletionMessage = () => {
    if (mode === "focus")
      return {
        title: "집중 완료!",
        emoji: "✨",
        message: "잠깐 쉬어봐요!",
      };
    if (mode === "shortBreak")
      return {
        title: "휴식 완료!",
        emoji: "💪",
        message: "다시 집중할 시간이에요!",
      };
    return {
      title: "긴 휴식 완료!",
      emoji: "🌟",
      message: "다시 집중할 준비됐나요?",
    };
  };

  const modeInfo = getModeInfo(mode);
  const ModeIcon = modeInfo.icon;
  const completionMsg = getCompletionMessage();

  return (
    <>
      {/* ── 설정 모달 ── */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={cancelSettings}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div
              className="w-[340px] rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 100%)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8)",
                border: "2px solid rgba(255,182,217,0.4)",
              }}
            >
              {/* 모달 헤더 */}
              <div
                className="relative px-6 py-4"
                style={{
                  background:
                    "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="bg-white/90 p-2 rounded-xl"
                      style={{
                        boxShadow:
                          "inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Timer className="w-4 h-4 text-purple-500" />
                    </div>
                    <h3
                      className="text-white font-bold drop-shadow-md"
                      style={{
                        fontSize: "16px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      타이머 시간 설정
                    </h3>
                  </div>
                  <button
                    onClick={cancelSettings}
                    className="bg-white/30 hover:bg-white/50 backdrop-blur-sm p-1.5 rounded-lg transition-all"
                    style={{
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    <X className="w-4 h-4 text-white drop-shadow-md" />
                  </button>
                </div>
              </div>

              {/* 모달 내용 */}
              <div className="p-6 space-y-3">
                {(
                  [
                    {
                      key: "focus",
                      label: "💻 집중",
                      color: "#FF6B9D",
                      desc: "집중 세션 시간",
                    },
                    {
                      key: "shortBreak",
                      label: "☕ 짧은 휴식",
                      color: "#A78BFA",
                      desc: "짧은 휴식 시간",
                    },
                    {
                      key: "longBreak",
                      label: "💖 긴 휴식",
                      color: "#60A5FA",
                      desc: "긴 휴식 시간 (4세션마다)",
                    },
                  ] as {
                    key: keyof CustomMinutes;
                    label: string;
                    color: string;
                    desc: string;
                  }[]
                ).map(({ key, label, color, desc }) => (
                  <div
                    key={key}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/80"
                    style={{
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          {label}
                        </p>
                        <p className="text-xs text-purple-400 mt-0.5">{desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={draft[key]}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              [key]: Number(e.target.value),
                            }))
                          }
                          className="w-14 px-2 py-1.5 text-sm text-center rounded-xl border-2 focus:outline-none transition-all tabular-nums font-bold"
                          style={{
                            borderColor: `${color}60`,
                            color,
                            background: `${color}12`,
                          }}
                        />
                        <span className="text-xs text-purple-400 w-5">분</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 모달 푸터 */}
              <div
                className="px-6 py-4 border-t border-pink-200/50 flex gap-3"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.5))",
                }}
              >
                <button
                  onClick={cancelSettings}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-purple-600 font-medium text-sm transition-all hover:bg-white/60"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  취소
                </button>
                <button
                  onClick={applySettings}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(167,139,250,0.4)",
                  }}
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 완료 팝업 ── */}
      {showCompletion && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[220]" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[230]">
            <div
              className="rounded-3xl overflow-hidden animate-bounce"
              style={{
                background: "linear-gradient(135deg, #FFF0F8 0%, #F8F0FF 100%)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.8)",
                border: "2px solid rgba(255,182,217,0.4)",
                width: "300px",
              }}
            >
              <div
                className="px-6 py-5 text-center"
                style={{
                  background: `linear-gradient(135deg, ${modeInfo.color}40 0%, ${modeInfo.color}20 100%)`,
                }}
              >
                <div className="text-5xl mb-3 animate-pulse">
                  {completionMsg.emoji}
                </div>
                <h3 className="text-lg font-bold text-purple-700 mb-1">
                  {completionMsg.title}
                </h3>
                <p className="text-sm text-purple-600">
                  {completionMsg.message}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 타이머 본체 ── */}
      <div
        className="flex flex-col h-full overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="p-1.5 rounded-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${modeInfo.color} 0%, ${modeInfo.color}CC 100%)`,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)",
            }}
          >
            <ModeIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-purple-700">Pomodoro Timer</p>
            <p className="text-xs text-purple-400">
              {sessionCount}번 집중 완료
            </p>
          </div>
          <button
            onClick={() => {
              setDraft(customMinutes);
              setShowSettings(true);
            }}
            className="p-1.5 rounded-lg transition-all hover:bg-white/60"
            title="타이머 시간 설정"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* 모드 선택 버튼 */}
        <div className="flex gap-1.5 mb-3">
          {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((m) => {
            const info = getModeInfo(m);
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${info.color} 0%, ${info.color}CC 100%)`,
                        color: "white",
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px ${info.color}66`,
                      }
                    : {
                        background: "rgba(255,255,255,0.5)",
                        color: "#7C3AED",
                      }
                }
              >
                {info.emoji}{" "}
                {m === "focus" ? "집중" : m === "shortBreak" ? "휴식" : "쉬기"}
              </button>
            );
          })}
        </div>

        {/* 타이머 디스플레이 */}
        <div
          className="relative mb-3 py-5 px-4 rounded-2xl flex-shrink-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.6))",
            boxShadow:
              "inset 0 2px 4px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-20">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${getProgress()}%`,
                background: `linear-gradient(90deg, ${modeInfo.color} 0%, ${modeInfo.color}CC 100%)`,
              }}
            />
          </div>
          <div className="relative text-center">
            <div
              className="text-4xl font-bold tabular-nums mb-1"
              style={{ color: modeInfo.color }}
            >
              {formatTime(seconds)}
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base">{modeInfo.emoji}</span>
              <span className="text-xs font-medium text-purple-600">
                {modeInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Start / Reset */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={toggleTimer}
            className="flex-1 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${modeInfo.color} 0%, ${modeInfo.color}CC 100%)`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 10px ${modeInfo.color}55`,
            }}
          >
            <div className="flex items-center justify-center gap-1.5">
              {isActive ? (
                <Pause className="w-3.5 h-3.5 text-white fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 text-white fill-white" />
              )}
              <span className="text-white font-medium text-xs">
                {isActive ? "일시정지" : "시작"}
              </span>
            </div>
          </button>
          <button
            onClick={resetTimer}
            className="px-3 py-2.5 rounded-xl transition-all hover:bg-white/80"
            style={{
              background: "rgba(255,255,255,0.6)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.08)",
            }}
            title="현재 타이머 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
          </button>
        </div>

        {/* ── 총 집중 시간 ── */}
        <div
          className="mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,107,157,0.2)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          <Clock className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-purple-500">총 집중 시간</p>
            <p className="text-sm font-bold text-pink-600 tabular-nums">
              {totalFocusSecs > 0
                ? formatTotalTime(totalFocusSecs)
                : "아직 없어요"}
            </p>
          </div>
          {totalFocusSecs > 0 && (
            <button
              onClick={resetStats}
              className="p-1 rounded-lg transition-all hover:bg-red-50"
              title="통계 초기화"
            >
              <X className="w-3 h-3 text-red-300 hover:text-red-400" />
            </button>
          )}
        </div>

      </div>
    </>
  );
}

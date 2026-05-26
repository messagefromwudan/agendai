import { useState, useEffect, useRef, useCallback } from "react";
import {
  resolveEmotion,
  type MascotEmotion,
  type MascotState,
} from "../mascotStateMachine";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseMascotStateOptions {
  creditsRemaining: number;
  streakCount: number;
  sessionStartTime: number;
  isProcessing: boolean;
  language?: string;
}

interface UseMascotStateResult {
  emotion: MascotEmotion;
  intensity: 0 | 1 | 2;
  speechText: string | null;
  /** Call with `true` when the user starts typing and `false` on blur/empty. */
  setTyping: (val: boolean) => void;
}

// ─── Speech text map ──────────────────────────────────────────────────────────

/**
 * Returns the appropriate speech bubble text for the resolved mascot state, or
 * `null` when no bubble should appear.
 *
 * The `usedQuickAnswer` flag is forwarded so cautionary states can distinguish
 * between the two sub-causes.
 * `showIdleNudge` is a timer-driven boolean that becomes true 8 s after all
 * activity stops — it cannot be derived from `idleMs` alone because that
 * calculation is only accurate at render time.
 */
const SPEECH_TEXTS: Record<string, Record<string, string | ((intensity: number) => string)>> = {
  ro: {
    idle: "Ce explorăm în continuare?",
    cautionary_quick: "Hai să gândim mai întâi răspunsul.",
    cautionary_credits: "Hai să câștigăm tokeni la loc.",
    celebrating: (intensity: number) => intensity === 2 ? "DA! Exact așa se gândește!" : "Perfect!",
    encouraging: "Te apropii — continuă!",
    dejected: "Hai să rezolvăm unul împreună.",
  },
  ru: {
    idle: "Что изучаем дальше?",
    cautionary_quick: "Давай сначала подумаем.",
    cautionary_credits: "Давай заработаем токены обратно.",
    celebrating: (intensity: number) => intensity === 2 ? "ДА! Вот так надо думать!" : "Отлично!",
    encouraging: "Ты на верном пути — продолжай!",
    dejected: "Давай решим одно вместе.",
  },
};

function resolveSpeechText(
  state: MascotState,
  usedQuickAnswer: boolean,
  showIdleNudge: boolean,
  language: string
): string | null {
  const { emotion, intensity } = state;
  const lang = language === "ru" ? "ru" : "ro";
  const texts = SPEECH_TEXTS[lang];

  switch (emotion) {
    case "idle":
      return showIdleNudge ? (texts.idle as string) : null;

    case "cautionary":
      return usedQuickAnswer
        ? (texts.cautionary_quick as string)
        : (texts.cautionary_credits as string);

    case "celebrating": {
      const fn = texts.celebrating as (i: number) => string;
      return fn(intensity);
    }

    case "encouraging":
      return texts.encouraging as string;

    case "dejected":
      return texts.dejected as string;

    default:
      return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMascotState(
  options: UseMascotStateOptions
): UseMascotStateResult {
  const { creditsRemaining, streakCount, sessionStartTime, isProcessing, language = "ro" } =
    options;

  // ── Typing state + 500 ms debounce ────────────────────────────────────────
  const [isTyping, setIsTypingRaw] = useState(false);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setTyping = useCallback((val: boolean) => {
    if (typingDebounceRef.current !== null) {
      clearTimeout(typingDebounceRef.current);
    }
    typingDebounceRef.current = setTimeout(() => {
      setIsTypingRaw(val);
      typingDebounceRef.current = null;
    }, 500);
  }, []);

  // Flush debounce on unmount so we never call setState on a dead component.
  useEffect(() => {
    return () => {
      if (typingDebounceRef.current !== null) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, []);

  // ── lastActionMs ref ───────────────────────────────────────────────────────
  // Stamps the current time on every change to isProcessing or isTyping —
  // regardless of direction.  Resetting on the trailing edge (false) means the
  // idle clock starts from when the AI finished responding or the user stopped
  // typing, which gives the correct 2 s idle threshold in the state machine.
  const lastActionMsRef = useRef<number>(Date.now());

  useEffect(() => {
    lastActionMsRef.current = Date.now();
  }, [isProcessing, isTyping]);

  // ── sessionMinutes — refreshed every 60 s ─────────────────────────────────
  const [sessionMinutes, setSessionMinutes] = useState<number>(() =>
    Math.floor((Date.now() - sessionStartTime) / 60_000)
  );

  useEffect(() => {
    // Recompute immediately when sessionStartTime changes.
    setSessionMinutes(Math.floor((Date.now() - sessionStartTime) / 60_000));

    const intervalId = setInterval(() => {
      setSessionMinutes(Math.floor((Date.now() - sessionStartTime) / 60_000));
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [sessionStartTime]);

  // ── Idle nudge timer ──────────────────────────────────────────────────────
  // `idleMs` computed at render time is only accurate on the current frame;
  // nothing would trigger a re-render exactly at the 8 s mark.  Instead, set a
  // one-shot timer that flips `showIdleNudge` to true 8 s after activity stops.
  // Any new activity (isProcessing or isTyping change) cancels and resets it.
  const [showIdleNudge, setShowIdleNudge] = useState(false);
  const idleNudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Activity has resumed — hide the nudge immediately.
    setShowIdleNudge(false);

    if (idleNudgeTimerRef.current !== null) {
      clearTimeout(idleNudgeTimerRef.current);
      idleNudgeTimerRef.current = null;
    }

    // Only arm the 8 s timer while fully idle.
    if (!isProcessing && !isTyping) {
      idleNudgeTimerRef.current = setTimeout(() => {
        setShowIdleNudge(true);
        idleNudgeTimerRef.current = null;
      }, 8_000);
    }

    return () => {
      if (idleNudgeTimerRef.current !== null) {
        clearTimeout(idleNudgeTimerRef.current);
      }
    };
  }, [isProcessing, isTyping]);

  // ── answeredCorrectly ──────────────────────────────────────────────────────
  // Derived from the streak: a rising streak implies the last answer was
  // correct; a falling streak implies incorrect.  A persistent non-zero streak
  // means the question hasn't been answered yet this turn (null).
  // The parent should ideally pass this directly; here we default to null so
  // the hook can still drive the state machine from minimal props.
  // This is intentionally left as null — callers that have explicit
  // correct/incorrect signals should extend the options interface.
  const answeredCorrectly: boolean | null = null;

  // ── usedQuickAnswer ────────────────────────────────────────────────────────
  // Not exposed in the public options (the parent would need to set it from a
  // "quick answer" button handler).  Defaults to false; see note above.
  const usedQuickAnswer = false;

  // ── Resolve mascot state ───────────────────────────────────────────────────
  const mascotState = resolveEmotion({
    answeredCorrectly,
    usedQuickAnswer,
    isProcessing,
    isTyping,
    lastActionMs: lastActionMsRef.current,
    creditsRemaining,
    streakCount,
    sessionMinutes,
  });

  const speechText = resolveSpeechText(mascotState, usedQuickAnswer, showIdleNudge, language);

  return {
    emotion: mascotState.emotion,
    intensity: mascotState.intensity,
    speechText,
    setTyping,
  };
}

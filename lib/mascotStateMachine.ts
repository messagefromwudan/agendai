export type MascotEmotion =
  | "idle"
  | "curious"
  | "thinking"
  | "celebrating"
  | "encouraging"
  | "cautionary"
  | "reading"
  | "dejected";

export interface MascotState {
  emotion: MascotEmotion;
  intensity: 0 | 1 | 2;
  sessionMinutes: number;
  streakCount: number;
  creditsRemaining: number;
}

export interface SessionContext {
  answeredCorrectly: boolean | null;
  usedQuickAnswer: boolean;
  isProcessing: boolean;
  isTyping: boolean;
  lastActionMs: number;
  creditsRemaining: number;
  streakCount: number;
  sessionMinutes: number;
}

/**
 * Pure function that resolves the current mascot emotion and intensity
 * based on session context. Rules are evaluated in priority order — the
 * first matching rule wins.
 *
 * Priority order:
 * 1. No credits remaining → dejected (intensity 2)
 * 2. AI is processing → thinking (intensity 1)
 * 3. Correct answer + streak ≥ 3 → celebrating (intensity 2)
 * 4. Correct answer → celebrating (intensity 1)
 * 5. Wrong answer → encouraging (intensity 1)
 * 6. Used quick answer → cautionary (intensity 1)
 * 7. Credits low (< 20) and not processing → cautionary (intensity 0)
 * 8. User is typing → curious (intensity 0)
 * 9. Idle for > 2 s → idle (intensity 0)
 *
 * Intensity escalation: for `celebrating` and `encouraging` states,
 * intensity is incremented by 1 (capped at 2) when sessionMinutes > 10.
 *
 * @param ctx - The current session context snapshot.
 * @returns A resolved MascotState reflecting the appropriate emotion and intensity.
 */
export function resolveEmotion(ctx: SessionContext): MascotState {
  const {
    answeredCorrectly,
    usedQuickAnswer,
    isProcessing,
    isTyping,
    lastActionMs,
    creditsRemaining,
    streakCount,
    sessionMinutes,
  } = ctx;

  let emotion: MascotEmotion;
  let intensity: 0 | 1 | 2;

  // 1. Out of credits
  if (creditsRemaining === 0) {
    emotion = "dejected";
    intensity = 2;
  }
  // 2. AI is processing a response
  else if (isProcessing) {
    emotion = "thinking";
    intensity = 1;
  }
  // 3. Correct answer with a streak of 3 or more
  else if (answeredCorrectly === true && streakCount >= 3) {
    emotion = "celebrating";
    intensity = 2;
  }
  // 4. Correct answer (no significant streak)
  else if (answeredCorrectly === true) {
    emotion = "celebrating";
    intensity = 1;
  }
  // 5. Wrong answer
  else if (answeredCorrectly === false) {
    emotion = "encouraging";
    intensity = 1;
  }
  // 6. User took the quick-answer shortcut
  else if (usedQuickAnswer) {
    emotion = "cautionary";
    intensity = 1;
  }
  // 7. Credits are running low
  else if (creditsRemaining < 20 && !isProcessing) {
    emotion = "cautionary";
    intensity = 0;
  }
  // 8. User is actively typing
  else if (isTyping) {
    emotion = "curious";
    intensity = 0;
  }
  // 9. No recent activity → idle
  else {
    emotion = "idle";
    intensity = 0;
  }

  // Intensity escalation for celebrating / encouraging after a long session
  if (
    sessionMinutes > 10 &&
    (emotion === "celebrating" || emotion === "encouraging")
  ) {
    intensity = Math.min(intensity + 1, 2) as 0 | 1 | 2;
  }

  return {
    emotion,
    intensity,
    sessionMinutes,
    streakCount,
    creditsRemaining,
  };
}

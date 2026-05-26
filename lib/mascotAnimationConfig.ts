import type { MascotEmotion } from "./mascotStateMachine";

/**
 * CSS class names to apply to the mascot element for each emotion.
 *
 * Classes must match the utility selectors defined in
 * styles/mascotAnimations.css.  Multiple classes are composed on the
 * same element (e.g. `mascot-float mascot-sway`) so they run in parallel.
 *
 * Special case — `mascot-sparkle`: apply this class to a *wrapper* element
 * that contains exactly 4 child particle nodes; the CSS nth-child rules
 * handle individual particle directions and stagger delays automatically.
 */
export const EMOTION_TO_ANIMATION: Record<MascotEmotion, string[]> = {
  idle:        ["mascot-float", "mascot-sway"],
  curious:     ["mascot-lean"],
  thinking:    ["mascot-lean", "mascot-scan"],
  celebrating: ["mascot-jump", "mascot-pop", "mascot-sparkle"],
  encouraging: ["mascot-pop"],
  cautionary:  ["mascot-shake"],
  reading:     ["mascot-float", "mascot-scan"],
  dejected:    ["mascot-sway"],
};

/**
 * How long (in milliseconds) to wait before resetting the mascot back to
 * `idle` after entering a given emotion.
 *
 * `null` means the animation loops indefinitely and the component should
 * stay in that state until the resolved emotion changes externally.
 *
 * Non-null values cover the worst-case duration of all non-looping
 * animations for that emotion:
 *   - curious:     200 ms  (mascot-lean one-shot)
 *   - celebrating: 700 ms  (last sparkle particle: 180 ms delay + 400 ms = 580 ms; padded to 700 ms)
 *   - encouraging: 300 ms  (mascot-pop one-shot)
 *   - cautionary:  400 ms  (mascot-shake one-shot)
 */
export const EMOTION_TO_DURATION: Record<MascotEmotion, number | null> = {
  idle:        null,  // mascot-float + mascot-sway loop indefinitely
  curious:     200,   // mascot-lean is a 200 ms one-shot; re-triggers on next keystroke
  thinking:    null,  // mascot-scan loops; persists while isProcessing is true
  celebrating: 700,   // all one-shot; worst case ~580 ms (sparkle particle 4), padded to 700 ms
  encouraging: 300,   // mascot-pop is 300 ms
  cautionary:  400,   // mascot-shake is 400 ms
  reading:     null,  // mascot-scan loops; persists while in reading state
  dejected:    null,  // mascot-sway loops; persists until credits are restored
};

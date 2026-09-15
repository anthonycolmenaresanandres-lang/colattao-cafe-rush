/** Presentation events stay separate from the existing win/replay contract. */
export const FALL_UI = "fall-ui";
export const FALL_ACTION = "fall-action";

export type FallPhase = "start" | "playing" | "level-complete" | "lost" | "won";
export type FallUiState = { phase: FallPhase; score: number; time: number; target: number };

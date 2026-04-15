export const APP_TITLE = "Roulette Royale Lab";

export const EUROPEAN_WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const AMERICAN_WHEEL_ORDER = [
  0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00",
  27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2,
];

export const WHEEL_ORDERS = {
  european: EUROPEAN_WHEEL_ORDER,
  american: AMERICAN_WHEEL_ORDER,
};

export const WHEEL_MODE_LABELS = {
  european: "European single-zero",
  american: "American double-zero",
};

export const HOUSE_EDGES = {
  european: 2.7,
  american: 5.26,
};

export const WHEEL_ORDER = EUROPEAN_WHEEL_ORDER;

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export const BLACK_NUMBERS = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

export const CHIP_VALUES = [1, 5, 10, 25, 100, 500];

export const DEFAULT_SETTINGS = {
  bankrollDefault: 1000,
  preferredChipValue: 25,
  preferredBetMode: "tap",
  wheelMode: "european",
  animationSpeed: "normal",
  showBetOverlay: false,
  helpCollapsed: false,
  persistSession: true,
};

export const ANIMATION_PRESETS = {
  relaxed: { duration: 6000, wheelTurns: 7, ballTurns: 10 },
  normal: { duration: 4700, wheelTurns: 6, ballTurns: 9 },
  brisk: { duration: 3500, wheelTurns: 5, ballTurns: 7 },
};

export const RECENT_RESULTS_LIMIT = 18;
export const HISTORY_LIMIT = 400;

export const STORAGE_KEYS = {
  settings: "roulette-royale-settings",
  session: "roulette-royale-session",
  fairness: "roulette-royale-fairness-log",
};

import { DEFAULT_SETTINGS, STORAGE_KEYS } from "./config.js";
import { createInitialSession } from "./engine/session.js";

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...loadJson(STORAGE_KEYS.settings, {}) };
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function loadSession(settings) {
  const saved = loadJson(STORAGE_KEYS.session, null);
  if (!saved || !settings.persistSession) return createInitialSession(settings);

  return {
    ...createInitialSession(settings),
    ...saved,
    wheelMode: saved.wheelMode ?? settings.wheelMode,
    locked: false,
    actionStack: [],
    activeBets: saved.activeBets ?? [],
    previousBetLayout: saved.previousBetLayout ?? [],
    history: saved.history ?? [],
    recentResults: saved.recentResults ?? [],
    fairnessLog: saved.fairnessLog ?? [],
  };
}

export function saveSession(session, settings) {
  if (!settings.persistSession) {
    localStorage.removeItem(STORAGE_KEYS.session);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

export function saveFairnessLog(log) {
  localStorage.setItem(STORAGE_KEYS.fairness, JSON.stringify(log));
}

export function loadFairnessLog() {
  return loadJson(STORAGE_KEYS.fairness, []);
}

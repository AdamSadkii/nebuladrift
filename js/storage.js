import { CONFIG } from "./config.js";

export function loadHighScore() {
  return Number(localStorage.getItem(CONFIG.HS_KEY) || 0);
}

export function saveHighScore(score) {
  localStorage.setItem(CONFIG.HS_KEY, String(score));
}

export function loadMuted() {
  const v = localStorage.getItem(CONFIG.MUTE_KEY);
  return v === null ? true : v === "1";
}

export function saveMuted(muted) {
  localStorage.setItem(CONFIG.MUTE_KEY, muted ? "1" : "0");
}

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STATS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveStats(stats) {
  localStorage.setItem(CONFIG.STATS_KEY, JSON.stringify(stats));
}

export function bumpStats(partial) {
  const s = Object.assign(
    {
      games: 0,
      coins: 0,
      nearMisses: 0,
      bestSurvival: 0,
      shieldsUsed: 0,
      feverCount: 0,
    },
    loadStats()
  );
  for (const k of Object.keys(partial)) {
    if (k === "bestSurvival") s[k] = Math.max(s[k] || 0, partial[k]);
    else s[k] = (s[k] || 0) + partial[k];
  }
  saveStats(s);
  return s;
}

export function loadAchievements() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.ACH_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAchievements(ids) {
  localStorage.setItem(CONFIG.ACH_KEY, JSON.stringify(ids));
}

export function loadSkin() {
  return localStorage.getItem(CONFIG.SKIN_KEY) || "classic";
}

export function saveSkin(id) {
  localStorage.setItem(CONFIG.SKIN_KEY, id);
}

export async function copyScoreSummary({ score, highScore, survival, multiplier, fever }) {
  const secs = Math.floor(survival);
  const text = [
    `Nebula Drift - Score ${score}`,
    `HI ${highScore} | ${secs}s | peak x${multiplier}` + (fever ? " | FEVER" : ""),
    "no wifi? still drift.",
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

import { CONFIG } from "../config.js";

export function createScoreState() {
  return {
    distanceScore: 0,
    orbBonus: 0,
    nearMissBonus: 0,
    powerBonus: 0,
    multiplier: 1,
    orbStreak: 0,
    peakMultiplier: 1,
    coins: 0,
    nearMisses: 0,
  };
}

export function createPowerState() {
  return {
    shield: false,
    slow: 0,
    magnet: 0,
    fever: 0,
  };
}

export function totalScore(s) {
  return Math.floor(s.distanceScore) + s.orbBonus + s.nearMissBonus + s.powerBonus;
}

export function addDistance(s, scrollSpeed, dt) {
  s.distanceScore += scrollSpeed * dt * 0.08;
}

export function collectOrb(s, type = "coin") {
  if (type === "coin" || type === "rainbow") {
    s.orbStreak += 1;
    s.coins += 1;
    if (s.orbStreak % CONFIG.STREAK_STEP === 0) {
      s.multiplier = Math.min(CONFIG.MAX_MULTIPLIER, s.multiplier + 1);
      s.peakMultiplier = Math.max(s.peakMultiplier, s.multiplier);
    }
    const base = type === "rainbow" ? CONFIG.RAINBOW_POINTS : CONFIG.ORB_POINTS;
    s.orbBonus += base * s.multiplier;
  } else {
    s.powerBonus += 40 * s.multiplier;
  }
  return s.multiplier;
}

export function missOrb(s) {
  s.orbStreak = 0;
  s.multiplier = 1;
}

export function addNearMiss(s) {
  s.nearMisses += 1;
  s.nearMissBonus += CONFIG.NEAR_MISS_POINTS * s.multiplier;
}

export function formatMultLabel(s) {
  if (s.multiplier > 1) {
    const toward =
      s.orbStreak % CONFIG.STREAK_STEP === 0 ? CONFIG.STREAK_STEP : s.orbStreak % CONFIG.STREAK_STEP;
    return "x" + s.multiplier + "  " + toward + "/" + CONFIG.STREAK_STEP;
  }
  if (s.orbStreak > 0) {
    return s.orbStreak + "/" + CONFIG.STREAK_STEP + " to x2";
  }
  return "";
}

export function tickPowers(powers, dt) {
  if (powers.slow > 0) powers.slow = Math.max(0, powers.slow - dt);
  if (powers.magnet > 0) powers.magnet = Math.max(0, powers.magnet - dt);
  if (powers.fever > 0) powers.fever = Math.max(0, powers.fever - dt);
}

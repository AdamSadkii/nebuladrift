import { rand } from "../utils.js";

/** type: coin | shield | slow | magnet | rainbow */
export function createOrb(x, y, type = "coin", r = 9) {
  return {
    x,
    y,
    r: type === "coin" ? r : type === "rainbow" ? 12 : 11,
    type,
    pulse: rand(0, Math.PI * 2),
  };
}

export function pickOrbType() {
  const roll = Math.random();
  if (roll < 0.7) return "coin";
  if (roll < 0.8) return "shield";
  if (roll < 0.9) return "slow";
  return "magnet";
}

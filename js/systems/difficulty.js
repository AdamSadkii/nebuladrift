import { CONFIG } from "../config.js";
import { clamp } from "../utils.js";

export function scrollSpeedAt(survival) {
  const t = Math.min(1, survival / 90);
  return CONFIG.BASE_SCROLL + (CONFIG.MAX_SCROLL - CONFIG.BASE_SCROLL) * (t * t);
}

export function spawnIntervalAt(survival) {
  const t = Math.min(1, survival / 90);
  return CONFIG.BASE_SPAWN - (CONFIG.BASE_SPAWN - CONFIG.MIN_SPAWN) * t;
}

export function gapSizeAt(survival, H) {
  return Math.max(110, H * 0.28 - survival * 1.2);
}

/** Background hue shift intensity 0–1 from score milestones */
export function scoreMood(score) {
  return clamp(score / 5000, 0, 1);
}

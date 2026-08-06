import { CONFIG } from "../config.js";
import { circleHit, dist } from "../utils.js";

export function findAsteroidHit(ship, asteroids) {
  for (let i = 0; i < asteroids.length; i++) {
    const a = asteroids[i];
    const hitR = a.kind === "bird" ? a.r * 0.9 : a.r * 0.82;
    if (circleHit(ship.x, ship.y, CONFIG.SHIP_HIT_RADIUS, a.x, a.y, hitR)) {
      return a;
    }
  }
  return null;
}

export function collectOrbs(ship, orbs, onCollect, magnetRange = 0, dt = 1 / 60) {
  for (let i = orbs.length - 1; i >= 0; i--) {
    const o = orbs[i];
    const range = 14 + (magnetRange > 0 ? 8 : 0);
    if (magnetRange > 0) {
      const d = dist(ship.x, ship.y, o.x, o.y);
      if (d < magnetRange && d > 1) {
        o.x += ((ship.x - o.x) / d) * 280 * dt;
        o.y += ((ship.y - o.y) / d) * 280 * dt;
      }
    }
    if (circleHit(ship.x, ship.y, range, o.x, o.y, o.r + 4)) {
      orbs.splice(i, 1);
      onCollect(o);
    }
  }
}

export function checkNearMisses(ship, asteroids, onNearMiss) {
  for (const a of asteroids) {
    if (a.nearMissed) continue;
    const d = dist(ship.x, ship.y, a.x, a.y) - a.r;
    if (d > 0 && d < CONFIG.NEAR_MISS_DIST && a.x < ship.x + 20) {
      a.nearMissed = true;
      onNearMiss(a);
    }
  }
}

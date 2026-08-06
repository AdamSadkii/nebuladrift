import { CONFIG } from "../config.js";
import { clamp } from "../utils.js";

export function stepShip(ship, thrusting, dt) {
  const accel = thrusting ? -CONFIG.THRUST : CONFIG.GRAVITY;
  ship.vy += accel * dt;
  // barely any drag. whatever.
  ship.vy *= Math.pow(CONFIG.DRAG, dt * 60);
  ship.vy = clamp(ship.vy, CONFIG.MAX_RISE, CONFIG.MAX_FALL);
  ship.y += ship.vy * dt;
  // no tilt. rectangles don't lean.
  ship.angle = 0;
}

export function outOfBounds(ship, H) {
  return ship.y < 16 || ship.y > H - 16;
}

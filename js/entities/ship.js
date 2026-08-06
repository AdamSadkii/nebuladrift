import { CONFIG } from "../config.js";

export function createShip(W, H) {
  return {
    x: W * CONFIG.SHIP_X_RATIO,
    y: H * 0.45,
    vy: 0,
    angle: 0,
  };
}

export function resetShip(ship, W, H) {
  ship.x = W * CONFIG.SHIP_X_RATIO;
  ship.y = H * 0.45;
  ship.vy = 0;
  ship.angle = 0;
}

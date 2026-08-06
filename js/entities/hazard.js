import { rand } from "../utils.js";
import { COLORS } from "../config.js";

/** kind: wind | boost */
export function createHazard(x, y, w, h, kind) {
  return {
    x,
    y,
    w,
    h,
    kind,
    pulse: rand(0, Math.PI * 2),
  };
}

export function updateHazards(hazards, scrollSpeed, dt) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.x -= scrollSpeed * dt;
    h.pulse += dt * 4;
    if (h.x + h.w < -20) hazards.splice(i, 1);
  }
}

export function applyHazards(ship, hazards, dt) {
  for (const h of hazards) {
    if (
      ship.x > h.x &&
      ship.x < h.x + h.w &&
      ship.y > h.y &&
      ship.y < h.y + h.h
    ) {
      if (h.kind === "wind") ship.vy -= 520 * dt;
      if (h.kind === "boost") ship.vy += 380 * dt;
    }
  }
}

export function drawHazards(ctx, hazards) {
  for (const h of hazards) {
    const a = 0.18 + Math.sin(h.pulse) * 0.06;
    if (h.kind === "wind") {
      ctx.fillStyle = `rgba(74, 158, 255, ${a})`;
      ctx.fillRect(h.x | 0, h.y | 0, h.w | 0, h.h | 0);
      ctx.fillStyle = COLORS.shield;
      for (let i = 0; i < 4; i++) {
        const ox = (h.x + ((performance.now() / 30 + i * 18) % h.w)) | 0;
        ctx.fillRect(ox, (h.y + 8 + i * 12) | 0, 8, 2);
      }
    } else {
      ctx.fillStyle = `rgba(231, 76, 111, ${a})`;
      ctx.fillRect(h.x | 0, h.y | 0, h.w | 0, h.h | 0);
      ctx.fillStyle = COLORS.magnet;
      for (let i = 0; i < 4; i++) {
        const ox = (h.x + ((performance.now() / 25 + i * 16) % h.w)) | 0;
        ctx.fillRect(ox, (h.y + h.h - 14 - i * 10) | 0, 8, 2);
      }
    }
  }
}

import { CONFIG } from "../config.js";
import { rand } from "../utils.js";
import { createAsteroid, pickObstacleKind } from "../entities/asteroid.js";
import { createOrb, pickOrbType } from "../entities/orb.js";
import { createHazard } from "../entities/hazard.js";
import { gapSizeAt } from "./difficulty.js";

export function spawnWave(asteroids, orbs, hazards, W, H, survival) {
  const gapCenter = rand(H * 0.18, H * 0.82);
  const gapSize = gapSizeAt(survival, H);
  const topH = Math.max(40, gapCenter - gapSize / 2);
  const botY = Math.min(H - 40, gapCenter + gapSize / 2);

  // rare boss cactus
  if (survival > 30 && Math.random() < CONFIG.BOSS_CHANCE) {
    const r = rand(48, 64);
    asteroids.push(createAsteroid(W + 100, rand(H * 0.3, H * 0.7), r, "boss"));
  } else {
    const topCount = 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < topCount; i++) {
      const kind = pickObstacleKind(survival);
      const r = kind === "bird" ? rand(14, 22) : rand(18, 42);
      const maxY = Math.max(r + 20, topH - r);
      asteroids.push(createAsteroid(W + 60 + i * 50, rand(r + 10, maxY), r, kind));
    }

    const botCount = 1 + ((Math.random() * 2) | 0);
    for (let i = 0; i < botCount; i++) {
      const kind = pickObstacleKind(survival);
      const r = kind === "bird" ? rand(14, 22) : rand(18, 40);
      const minY = Math.min(H - r - 10, botY + r);
      asteroids.push(createAsteroid(W + 80 + i * 55, rand(minY, H - r - 8), r, kind));
    }

    if (Math.random() < 0.3 + Math.min(0.3, survival / 80)) {
      const kind = survival > 20 && Math.random() < 0.5 ? "bird" : pickObstacleKind(survival);
      const r = kind === "bird" ? rand(12, 20) : rand(14, 28);
      asteroids.push(createAsteroid(W + rand(140, 240), rand(H * 0.25, H * 0.75), r, kind));
    }
  }

  if (Math.random() < CONFIG.ORB_CHANCE + Math.min(0.2, survival / 120)) {
    let type = Math.random() < CONFIG.POWERUP_CHANCE ? pickOrbType() : "coin";
    if (Math.random() < CONFIG.RAINBOW_CHANCE) type = "rainbow";
    orbs.push(
      createOrb(
        W + rand(40, 120),
        gapCenter + rand(-gapSize * 0.25, gapSize * 0.25),
        type
      )
    );
    if (Math.random() < 0.45) {
      orbs.push(createOrb(W + rand(160, 280), rand(H * 0.2, H * 0.8), "coin", 8));
    }
    if (Math.random() < 0.25) {
      orbs.push(createOrb(W + rand(200, 320), gapCenter, "coin", 8));
    }
  }

  if (survival > 12 && Math.random() < CONFIG.HAZARD_CHANCE) {
    const kind = Math.random() < 0.5 ? "wind" : "boost";
    const h = rand(70, 120);
    const y = kind === "wind" ? rand(H * 0.15, H * 0.45) : rand(H * 0.45, H * 0.75);
    hazards.push(createHazard(W + rand(40, 160), y, rand(70, 110), h, kind));
  }
}

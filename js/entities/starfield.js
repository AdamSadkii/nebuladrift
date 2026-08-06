import { CONFIG } from "../config.js";
import { rand } from "../utils.js";

export function createStarfield(W, H) {
  const clouds = [];
  for (let i = 0; i < CONFIG.CLOUD_COUNT; i++) {
    clouds.push({
      x: rand(0, W),
      y: rand(H * 0.08, H * 0.38),
      s: rand(0.8, 1.5),
      vx: rand(10, 26),
    });
  }

  const stars = [];
  for (let i = 0; i < 40; i++) {
    stars.push({
      x: rand(0, W),
      y: rand(0, H * 0.7),
      s: Math.random() < 0.3 ? 2 : 1,
      tw: rand(0, Math.PI * 2),
    });
  }

  const hills = [];
  for (let i = 0; i < CONFIG.HILL_COUNT; i++) {
    hills.push({
      x: i * (W * 0.45),
      w: rand(W * 0.35, W * 0.55),
      h: rand(H * 0.08, H * 0.18),
      layer: i % 2,
    });
  }

  const groundY = H * 0.88;
  const ground = [];
  const segW = 40;
  for (let i = 0; i < 30; i++) {
    ground.push({
      x: i * segW,
      w: segW,
      bump: Math.random() < 0.35 ? (2 + ((Math.random() * 3) | 0)) : 0,
      flower: Math.random() < 0.15,
    });
  }

  return {
    clouds,
    stars,
    hills,
    ground,
    groundY,
    segW,
    sunX: W * 0.82,
    sunY: H * 0.14,
  };
}

export function updateStarfield(field, W, H, bgSpeed, dt) {
  field.groundY = H * 0.88;
  field.sunX = W * 0.82;
  field.sunY = H * 0.14;

  for (const c of field.clouds) {
    c.x -= c.vx * dt;
    if (c.x < -70) {
      c.x = W + 20;
      c.y = rand(H * 0.08, H * 0.38);
    }
  }

  for (const s of field.stars) {
    s.tw += dt * 3;
  }

  for (const hill of field.hills) {
    const layerSpeed = hill.layer === 0 ? 0.25 : 0.4;
    hill.x -= bgSpeed * layerSpeed * dt;
    if (hill.x + hill.w < 0) {
      hill.x = W + rand(0, 80);
      hill.w = rand(W * 0.35, W * 0.55);
      hill.h = rand(H * 0.08, H * 0.18);
    }
  }

  let maxX = 0;
  for (const g of field.ground) {
    g.x -= bgSpeed * dt;
    if (g.x + g.w > maxX) maxX = g.x + g.w;
  }
  for (const g of field.ground) {
    if (g.x + g.w < 0) {
      g.x = maxX;
      g.bump = Math.random() < 0.35 ? (2 + ((Math.random() * 3) | 0)) : 0;
      g.flower = Math.random() < 0.15;
      maxX += g.w;
    }
  }
}

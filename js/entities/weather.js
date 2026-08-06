import { rand } from "../utils.js";
import { COLORS } from "../config.js";

export function createWeather(W, H) {
  const rain = [];
  for (let i = 0; i < 40; i++) {
    rain.push({
      x: rand(0, W),
      y: rand(0, H),
      len: rand(6, 14),
      spd: rand(280, 420),
    });
  }
  const fireflies = [];
  for (let i = 0; i < 18; i++) {
    fireflies.push({
      x: rand(0, W),
      y: rand(H * 0.2, H * 0.75),
      tw: rand(0, Math.PI * 2),
      vx: rand(-20, 20),
      vy: rand(-12, 12),
    });
  }
  return {
    rain,
    fireflies,
    shoot: null,
    shootTimer: rand(3, 8),
  };
}

export function updateWeather(weather, W, H, themeName, dt) {
  if (themeName === "dusk") {
    for (const r of weather.rain) {
      r.y += r.spd * dt;
      r.x -= 40 * dt;
      if (r.y > H) {
        r.y = -10;
        r.x = rand(0, W);
      }
    }
  }

  if (themeName === "nebula") {
    for (const f of weather.fireflies) {
      f.tw += dt * 5;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < 0) f.x = W;
      if (f.x > W) f.x = 0;
      if (f.y < 0) f.y = H * 0.7;
      if (f.y > H * 0.8) f.y = H * 0.2;
    }
  }

  if (themeName === "night" || themeName === "nebula") {
    weather.shootTimer -= dt;
    if (weather.shootTimer <= 0 && !weather.shoot) {
      weather.shoot = {
        x: rand(W * 0.2, W * 0.9),
        y: rand(20, H * 0.3),
        vx: -220,
        vy: 140,
        life: 0.7,
      };
      weather.shootTimer = rand(4, 10);
    }
    if (weather.shoot) {
      weather.shoot.x += weather.shoot.vx * dt;
      weather.shoot.y += weather.shoot.vy * dt;
      weather.shoot.life -= dt;
      if (weather.shoot.life <= 0) weather.shoot = null;
    }
  } else {
    weather.shoot = null;
  }
}

export function drawWeather(ctx, weather, themeName) {
  if (themeName === "dusk") {
    ctx.strokeStyle = "rgba(120, 140, 180, 0.45)";
    ctx.lineWidth = 1;
    for (const r of weather.rain) {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 2, r.y + r.len);
      ctx.stroke();
    }
  }

  if (themeName === "nebula") {
    for (const f of weather.fireflies) {
      const a = 0.3 + Math.sin(f.tw) * 0.5;
      ctx.globalAlpha = Math.max(0.15, a);
      ctx.fillStyle = COLORS.coin;
      ctx.fillRect(f.x | 0, f.y | 0, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  if (weather.shoot) {
    const s = weather.shoot;
    ctx.strokeStyle = COLORS.star;
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, s.life / 0.7);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 0.08, s.y - s.vy * 0.08);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

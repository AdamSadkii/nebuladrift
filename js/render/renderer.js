import { COLORS, themeForScore } from "../config.js";
import { drawPopups } from "../entities/popup.js";
import { drawSparks } from "../entities/spark.js";
import { drawHazards } from "../entities/hazard.js";
import { drawWeather } from "../entities/weather.js";
import { SKINS } from "../systems/achievements.js";

function drawCloud(ctx, c, theme) {
  const s = c.s;
  ctx.fillStyle = theme.cloud;
  ctx.fillRect(c.x, c.y, 18 * s, 10 * s);
  ctx.fillRect(c.x + 10 * s, c.y - 6 * s, 16 * s, 10 * s);
  ctx.fillRect(c.x + 22 * s, c.y, 14 * s, 10 * s);
}

function drawHills(ctx, field, H, theme) {
  const base = field.groundY;
  for (const hill of field.hills || []) {
    ctx.fillStyle = hill.layer === 0 ? (theme.hill || COLORS.hill) : (theme.hillDark || COLORS.hillDark);
    const y = (base - hill.h) | 0;
    ctx.fillRect(hill.x | 0, y, hill.w | 0, hill.h | 0);
    // crude peak
    ctx.fillRect((hill.x + hill.w * 0.3) | 0, (y - 12) | 0, (hill.w * 0.25) | 0, 14);
  }
}

function drawGround(ctx, field, W, H, theme) {
  const y = field.groundY | 0;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, y, W, Math.max(0, H - y));
  ctx.fillStyle = theme.groundDirt;
  ctx.fillRect(0, y, W, 3);

  for (const g of field.ground) {
    const x = g.x | 0;
    ctx.fillStyle = theme.ink;
    if (g.bump > 0) {
      ctx.fillRect(x + 8, y + 5, 2, g.bump);
      ctx.fillRect(x + 18, y + 4, 2, g.bump + 1);
    }
    if (g.flower) {
      ctx.fillStyle = COLORS.coin;
      ctx.fillRect(x + 22, y - 6, 3, 3);
      ctx.fillStyle = theme.ground;
      ctx.fillRect(x + 23, y - 3, 1, 4);
    }
  }
}

function drawSky(ctx, W, H, theme, field, fever) {
  ctx.fillStyle = fever ? "#ffb090" : theme.skyTop;
  ctx.fillRect(0, 0, W, H * 0.55);
  ctx.fillStyle = fever ? "#ffe0c8" : theme.bg;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);

  if (theme.stars) {
    for (const s of field.stars) {
      const tw = 0.5 + Math.sin(s.tw) * 0.5;
      ctx.globalAlpha = 0.4 + tw * 0.6;
      ctx.fillStyle = COLORS.star;
      ctx.fillRect(s.x | 0, s.y | 0, s.s, s.s);
    }
    ctx.globalAlpha = 1;
  }

  if (theme.showSun) {
    ctx.fillStyle = fever ? COLORS.fever : COLORS.sun;
    ctx.fillRect((field.sunX - 14) | 0, (field.sunY - 14) | 0, 28, 28);
    // sun rays as boxes
    ctx.fillRect((field.sunX - 22) | 0, (field.sunY - 2) | 0, 8, 4);
    ctx.fillRect((field.sunX + 14) | 0, (field.sunY - 2) | 0, 8, 4);
  }
  if (theme.showMoon) {
    ctx.fillStyle = COLORS.moon;
    ctx.fillRect((field.sunX - 10) | 0, (field.sunY - 10) | 0, 20, 20);
    ctx.fillStyle = theme.skyTop;
    ctx.fillRect((field.sunX - 2) | 0, (field.sunY - 12) | 0, 14, 14);
  }
}

export function drawAsteroid(ctx, a) {
  const x = a.x | 0;
  const y = a.y | 0;
  const r = a.r | 0;

  if (a.kind === "boss") {
    ctx.fillStyle = "#1f5c28";
    ctx.fillRect(x - 14, y - r, 28, r * 2);
    ctx.fillRect(x - 36, y - 10, 24, 14);
    ctx.fillRect(x - 36, y - 36, 14, 28);
    ctx.fillRect(x + 12, y - 16, 24, 14);
    ctx.fillRect(x + 22, y - 40, 14, 28);
    ctx.fillStyle = COLORS.magnet;
    ctx.fillRect(x - 4, y - 8, 8, 8);
    ctx.fillStyle = "#ff6b4a";
    ctx.font = "bold 10px Courier New, monospace";
    ctx.fillText("BOSS", x - 14, y - r - 6);
    return;
  }

  if (a.kind === "bird") {
    ctx.fillStyle = COLORS.bird;
    ctx.fillRect(x - r, y - 6, r * 2, 12);
    ctx.fillRect(x + r - 4, y - 3, 8, 6);
    const flap = ((performance.now() / 120) | 0) % 2;
    ctx.fillRect(x - 4, y - (flap ? 14 : 10), 10, 6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + r, y - 1, 2, 2);
    return;
  }

  if (a.kind === "rock") {
    ctx.fillStyle = COLORS.rock;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = COLORS.rockDark;
    ctx.fillRect(x - r + 3, y - r + 3, Math.max(4, r), Math.max(4, r));
    return;
  }

  ctx.fillStyle = COLORS.cactus;
  ctx.fillRect(x - 6, y - r, 12, r * 2);
  ctx.fillRect(x - 16, y - 4, 12, 8);
  ctx.fillRect(x - 16, y - 16, 8, 14);
  ctx.fillRect(x + 4, y - 8, 12, 8);
  ctx.fillRect(x + 8, y - 20, 8, 14);
  ctx.fillStyle = COLORS.cactusDark;
  ctx.fillRect(x - 2, y - r + 4, 2, r);
}

export function drawOrb(ctx, o) {
  const x = o.x | 0;
  const y = o.y | 0;
  const r = o.r | 0;
  const blink = ((performance.now() / 200) | 0) % 2 === 0;

  if (o.type === "rainbow") {
    const cols = COLORS.rainbow;
    const i = ((performance.now() / 100) | 0) % cols.length;
    ctx.fillStyle = cols[i];
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = cols[(i + 2) % cols.length];
    ctx.fillRect(x - 3, y - 3, 6, 6);
    return;
  }
  if (o.type === "shield") {
    ctx.fillStyle = COLORS.shield;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 3, y - 3, 6, 6);
    return;
  }
  if (o.type === "slow") {
    ctx.fillStyle = COLORS.slow;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 4, y - 1, 8, 2);
    return;
  }
  if (o.type === "magnet") {
    ctx.fillStyle = COLORS.magnet;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 4, y - 4, 3, 8);
    ctx.fillRect(x + 1, y - 4, 3, 8);
    return;
  }

  ctx.fillStyle = blink ? COLORS.coin : "#f0c84a";
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(x - 1, y - 3, 2, 6);
}

export function drawShip(ctx, ship, thrusting, playing, powers, theme, skinId) {
  const x = ship.x | 0;
  const y = ship.y | 0;
  const skin = SKINS.find((s) => s.id === skinId) || SKINS[0];
  const body = skin.body || theme.ink;
  const beak = skin.beak || COLORS.beak;

  if (powers.fever > 0) {
    ctx.strokeStyle = COLORS.fever;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 18, y - 16, 44, 32);
  }
  if (powers.shield) {
    ctx.strokeStyle = COLORS.shield;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 16, y - 14, 40, 28);
  }

  ctx.fillStyle = body;
  ctx.fillRect(x - 10, y - 6, 20, 12);
  ctx.fillStyle = beak;
  ctx.fillRect(x + 10, y - 3, 8, 6);
  ctx.fillRect(x + 18, y - 1, 4, 2);
  ctx.fillStyle = body;
  const step = thrusting || !playing ? 0 : ((performance.now() / 90) | 0) % 2;
  ctx.fillRect(x - 4, y + 6, 3, step ? 6 : 4);
  ctx.fillRect(x + 3, y + 6, 3, step ? 4 : 6);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(x + 12, y - 1, 2, 2);

  if (thrusting && playing) {
    ctx.fillStyle = powers.fever > 0 ? COLORS.fever : beak;
    ctx.fillRect(x - 16, y - 2, 4, 4);
    ctx.fillRect(x - 20, y - 1, 3, 2);
  }
}

function drawPowerHud(ctx, powers, theme) {
  let x = 14;
  const y = 52;
  ctx.font = "11px Courier New, monospace";
  if (powers.fever > 0) {
    ctx.fillStyle = COLORS.fever;
    ctx.fillRect(x, y, 10, 10);
    ctx.fillStyle = theme.ink;
    ctx.fillText("FEVER " + powers.fever.toFixed(1), x + 14, y + 9);
    x += 100;
  }
  if (powers.shield) {
    ctx.fillStyle = COLORS.shield;
    ctx.fillRect(x, y, 10, 10);
    ctx.fillStyle = theme.ink;
    ctx.fillText("SHIELD", x + 14, y + 9);
    x += 70;
  }
  if (powers.slow > 0) {
    ctx.fillStyle = COLORS.slow;
    ctx.fillRect(x, y, 10, 10);
    ctx.fillStyle = theme.ink;
    ctx.fillText("SLOW " + powers.slow.toFixed(1), x + 14, y + 9);
    x += 90;
  }
  if (powers.magnet > 0) {
    ctx.fillStyle = COLORS.magnet;
    ctx.fillRect(x, y, 10, 10);
    ctx.fillStyle = theme.ink;
    ctx.fillText("MAG " + powers.magnet.toFixed(1), x + 14, y + 9);
  }
}

function drawComboBar(ctx, streak, theme, W) {
  const need = 5;
  const toward = streak % need === 0 && streak > 0 ? need : streak % need;
  const bw = 80;
  const x = W - 24 - bw;
  const y = 70;
  ctx.fillStyle = theme.inkSoft;
  ctx.fillRect(x, y, bw, 6);
  ctx.fillStyle = COLORS.coin;
  ctx.fillRect(x, y, ((toward / need) * bw) | 0, 6);
  ctx.fillStyle = theme.ink;
  ctx.font = "10px Courier New, monospace";
  ctx.textAlign = "right";
  ctx.fillText("combo", x - 6, y + 6);
  ctx.textAlign = "left";
}

export function drawFrame(ctx, world) {
  const {
    W,
    H,
    field,
    asteroids,
    orbs,
    hazards,
    weather,
    ship,
    thrusting,
    state,
    score,
    powers,
    popups,
    sparks,
    paused,
    banner,
    skinId,
    streak,
  } = world;

  ctx.imageSmoothingEnabled = false;
  const fever = powers.fever > 0;
  const theme = themeForScore(score);
  // fever overrides hill colors slightly via theme copy
  const t = Object.assign({}, theme, {
    hill: fever ? "#c9a070" : "#9ec9a0",
    hillDark: fever ? "#a88050" : "#7aaa7c",
  });

  drawSky(ctx, W, H, t, field, fever);
  drawHills(ctx, field, H, t);
  for (const c of field.clouds) drawCloud(ctx, c, t);
  if (weather) drawWeather(ctx, weather, t.name);
  drawGround(ctx, field, W, H, t);

  if (hazards) drawHazards(ctx, hazards);
  for (const a of asteroids) drawAsteroid(ctx, a);
  for (const o of orbs) drawOrb(ctx, o);
  drawSparks(ctx, sparks);
  drawShip(ctx, ship, thrusting, state === "playing", powers, t, skinId);
  drawPopups(ctx, popups);
  drawPowerHud(ctx, powers, t);
  if (state === "playing") drawComboBar(ctx, streak || 0, t, W);

  if (banner) {
    ctx.fillStyle = fever ? COLORS.fever : t.ink;
    ctx.font = "bold 22px Courier New, monospace";
    ctx.textAlign = "center";
    ctx.fillText(banner, (W / 2) | 0, (H * 0.28) | 0);
    ctx.textAlign = "left";
  }

  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = t.ink;
    ctx.font = "bold 28px Courier New, monospace";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", (W / 2) | 0, (H / 2) | 0);
    ctx.font = "14px Courier New, monospace";
    ctx.fillText("press P", (W / 2) | 0, (H / 2 + 28) | 0);
    ctx.textAlign = "left";
  }

  return t;
}

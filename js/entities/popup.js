export function createPopup(x, y, text, color) {
  return {
    x,
    y,
    text,
    color,
    life: 0.9,
    max: 0.9,
    vy: -40,
  };
}

export function updatePopups(popups, dt) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.life -= dt;
    p.y += p.vy * dt;
    if (p.life <= 0) popups.splice(i, 1);
  }
}

export function drawPopups(ctx, popups) {
  ctx.font = "bold 14px Courier New, monospace";
  ctx.textAlign = "center";
  for (const p of popups) {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x | 0, p.y | 0);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
}

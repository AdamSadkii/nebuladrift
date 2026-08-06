import { rand, pick } from "../utils.js";

export function emitSparks(sparks, x,y,n, colors) {
    for (let i = 0; i< n; i++) {
        sparks.push({
            x: x+rand(-4,4),
            y: y+rand(-4, 4),
            vx:rand(-60, 60),
            vy: rand(-90, -20),
            life: rand(0.25, 0.55),
            max: 0.55,
            size: rand(2,4) | 0,
            color: pick(colors),
        });
    }
}

export function updateSparks(sparks, dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
        const s= sparks[i];
        s.life -= dt;
        s.x += s.vx * dt,
        s.y += s.vy *dt;
        s.vy += 280 *dt;
        if (s.life <= 0) sparks.splice(i, 1);
    }
}

export function drawSparks(ctx, sparks) {
    for (const s of sparks) {
        ctx.globalAlpha = Math.max(0, s.life / s.max);
        ctx.fillStyle =s.color;
        ctx.fillRect(s.x | 0, s.y | 0, s.size, s.size);
    }
    ctx.globalAlpha =1;
}
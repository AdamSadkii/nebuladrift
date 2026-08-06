import { rand } from "../utils.js";

export function createAsteroid(x,y,r, kind="cactus") {
    return {
        x,
        y,
        r,
        kind,
        nearMissed: false,
        baseY: y,
        bob: rand(0, Math.PI * 2),
        bobSpeed: rand(1.5, 3.2),
        bobAmp: kind === "bird" ? rand(18, 36) : 0,
        hp: kind === "boss" ? 1 : 0,
    };
}

export function pickObstacleKind(survival) { 
    const roll = Math.random();
    if (survival > 25 && roll < 0.22) 
        return "bird";
    if (roll < 0.45) return "rock";
    return "cactus";
}
/** Achievement definitions + unlock checks */
export const ACHIEVEMENTS = [
  { id: "first_flight", name: "First Flight", desc: "Finish a run", check: (c) => c.games >= 1 },
  { id: "coin_10", name: "Pocket Change", desc: "Collect 10 coins in one run", check: (c) => c.runCoins >= 10 },
  { id: "coin_50", name: "Loaded", desc: "Collect 50 coins in one run", check: (c) => c.runCoins >= 50 },
  { id: "near_5", name: "Close Call", desc: "5 near misses in one run", check: (c) => c.runNear >= 5 },
  { id: "x5", name: "On Fire", desc: "Reach x5 multiplier", check: (c) => c.peakMult >= 5 },
  { id: "fever", name: "Fever Dream", desc: "Enter fever mode", check: (c) => c.fever },
  { id: "survive_60", name: "Minute Drift", desc: "Survive 60 seconds", check: (c) => c.survival >= 60 },
  { id: "score_2k", name: "Sky High", desc: "Score 2000+", check: (c) => c.score >= 2000 },
  { id: "score_5k", name: "Nebula Touched", desc: "Score 5000+", check: (c) => c.score >= 5000 },
  { id: "boss", name: "Big Problem", desc: "Survive a boss cactus", check: (c) => c.bossCleared },
  { id: "rainbow", name: "Lucky", desc: "Grab a rainbow coin", check: (c) => c.rainbow },
  { id: "games_10", name: "Regular", desc: "Play 10 games", check: (c) => c.games >= 10 },
];

export const SKINS = [
  { id: "classic", name: "Classic", unlock: null, body: null, beak: "#f0a020" },
  { id: "sky", name: "Sky", unlock: "coin_50", body: "#4a9eff", beak: "#ffe08a" },
  { id: "ember", name: "Ember", unlock: "fever", body: "#e74c6f", beak: "#ffd76a" },
  { id: "mint", name: "Mint", unlock: "survive_60", body: "#3d8b4a", beak: "#b8ff90" },
  { id: "ghost", name: "Ghost", unlock: "score_5k", body: "#d8dde8", beak: "#ffffff" },
];

export function unlockedSkins(achIds) {
  return SKINS.filter((s) => !s.unlock || achIds.includes(s.unlock));
}

export function evaluateAchievements(ctx, owned) {
  const newly = [];
  for (const a of ACHIEVEMENTS) {
    if (owned.includes(a.id)) continue;
    if (a.check(ctx)) newly.push(a);
  }
  return newly;
}

import { CONFIG, COLORS, themeForScore } from "./config.js";
import { rand, showToast } from "./utils.js";
import {
  loadHighScore,
  saveHighScore,
  copyScoreSummary,
  loadAchievements,
  saveAchievements,
  loadSkin,
  saveSkin,
  bumpStats,
  loadStats,
} from "./storage.js";
import { AudioBus } from "./audio.js";
import { Input } from "./input.js";
import { createShip, resetShip } from "./entities/ship.js";
import { createStarfield, updateStarfield } from "./entities/starfield.js";
import { createPopup, updatePopups } from "./entities/popup.js";
import { emitSparks, updateSparks } from "./entities/spark.js";
import { updateHazards, applyHazards } from "./entities/hazard.js";
import { createWeather, updateWeather } from "./entities/weather.js";
import { stepShip, outOfBounds } from "./systems/physics.js";
import { scrollSpeedAt, spawnIntervalAt } from "./systems/difficulty.js";
import { spawnWave } from "./systems/spawner.js";
import { findAsteroidHit, collectOrbs, checkNearMisses } from "./systems/collision.js";
import {
  createScoreState,
  createPowerState,
  totalScore,
  addDistance,
  collectOrb,
  missOrb,
  addNearMiss,
  formatMultLabel,
  tickPowers,
} from "./systems/score.js";
import {
  evaluateAchievements,
  unlockedSkins,
  SKINS,
  ACHIEVEMENTS,
} from "./systems/achievements.js";
import { drawFrame } from "./render/renderer.js";

const MILESTONES = [500, 1000, 2000, 4000, 8000];

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ui = ui;
    this.audio = new AudioBus();

    this.W = 0;
    this.H = 0;
    this.dpr = 1;
    this.lastT = 0;

    this.state = "title";
    this.paused = false;
    this.thrusting = false;
    this.hintShown = true;
    this.survival = 0;
    this.scrollSpeed = CONFIG.BASE_SCROLL;
    this.spawnTimer = 0;
    this.highScore = loadHighScore();
    this.banner = "";
    this.bannerTimer = 0;
    this.hitMilestones = new Set();
    this.lastTheme = "day";
    this.achievements = loadAchievements();
    this.skinId = loadSkin();
    this.stats = loadStats();
    this.flags = { fever: false, bossCleared: false, rainbow: false };
    this.canRevive = false;
    this.usedRevive = false;

    this.ship = createShip(100, 100);
    this.asteroids = [];
    this.orbs = [];
    this.hazards = [];
    this.popups = [];
    this.sparks = [];
    this.field = { stars: [], clouds: [] };
    this.weather = null;
    this.scoreState = createScoreState();
    this.powers = createPowerState();

    this._bindUI();
    this.resize();
    this.field = createStarfield(this.W, this.H);
    this.weather = createWeather(this.W, this.H);
    resetShip(this.ship, this.W, this.H);
    this._syncMuteBtn();
    this._setHighScoreUI();
    this._refreshMetaUI();
    this._applyThemeCss(themeForScore(0));

    new Input({
      onThrust: (on) => this.setThrust(on),
      onStart: () => {
        if (this.state === "title" || this.state === "dead") this.reset();
      },
      onPause: () => this.togglePause(),
      onSkin: () => this.cycleSkin(),
      isButton: (t) => t && t.closest && t.closest("button"),
    });

    window.addEventListener("resize", () => this.resize());
  }

  _bindUI() {
    this.ui.playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.reset();
    });
    this.ui.retryBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.reset();
    });
    this.ui.muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.audio.resume();
      this.audio.toggleMute();
      this._syncMuteBtn();
      showToast(this.ui.toast, this.audio.muted ? "sfx off" : "sfx on");
    });
    if (this.ui.skinBtn) {
      this.ui.skinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.cycleSkin();
      });
    }
    if (this.ui.reviveBtn) {
      this.ui.reviveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.revive();
      });
    }
    this.ui.shareBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = await copyScoreSummary({
        score: totalScore(this.scoreState),
        highScore: this.highScore,
        survival: this.survival,
        multiplier: this.scoreState.peakMultiplier,
        fever: this.flags.fever,
      });
      showToast(this.ui.toast, ok ? "copied" : "copy failed");
    });
  }

  _syncMuteBtn() {
    this.ui.muteBtn.textContent = this.audio.muted ? "SFX" : "MUTE";
  }

  _setHighScoreUI() {
    this.ui.bestScore.textContent = "HI " + this.highScore;
    if (this.ui.hiInline) this.ui.hiInline.textContent = String(this.highScore);
  }

  _refreshMetaUI() {
    const skin = SKINS.find((s) => s.id === this.skinId) || SKINS[0];
    if (this.ui.skinBtn) this.ui.skinBtn.textContent = skin.name.toUpperCase();
    if (this.ui.statsLine) {
      const s = this.stats || {};
      this.ui.statsLine.textContent =
        (s.games || 0) + " runs · " + (s.coins || 0) + " coins lifetime";
    }
    if (this.ui.achCount) {
      this.ui.achCount.textContent = this.achievements.length + "/" + ACHIEVEMENTS.length + " ach";
    }
  }

  cycleSkin() {
    const unlocked = unlockedSkins(this.achievements);
    const idx = unlocked.findIndex((s) => s.id === this.skinId);
    const next = unlocked[(idx + 1) % unlocked.length];
    this.skinId = next.id;
    saveSkin(this.skinId);
    this._refreshMetaUI();
    showToast(this.ui.toast, "skin: " + next.name.toLowerCase());
  }

  _applyThemeCss(theme) {
    document.documentElement.style.setProperty("--bg", theme.bg);
    document.documentElement.style.setProperty("--ink", theme.ink);
    document.documentElement.style.setProperty("--ink-soft", theme.inkSoft);
    document.body.style.background = theme.bg;
  }

  _popup(x, y, text, color) {
    this.popups.push(createPopup(x, y, text, color || COLORS.popup));
  }

  _showBanner(text) {
    this.banner = text;
    this.bannerTimer = 1.6;
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = Math.floor(this.W * this.dpr);
    this.canvas.height = Math.floor(this.H * this.dpr);
    this.canvas.style.width = this.W + "px";
    this.canvas.style.height = this.H + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ship.x = this.W * CONFIG.SHIP_X_RATIO;
    if (this.state !== "playing") this.ship.y = this.H * 0.45;
    if (!this.field.clouds || !this.field.clouds.length) {
      this.field = createStarfield(this.W, this.H);
    }
    if (!this.weather) this.weather = createWeather(this.W, this.H);
  }

  togglePause() {
    if (this.state !== "playing") return;
    this.paused = !this.paused;
    if (this.paused) this.audio.setThrusting(false);
    else if (this.thrusting) this.audio.setThrusting(true);
  }

  reset() {
    if (this.state === "dead" && this.canRevive && !this.usedRevive) {
      this._finalizeRun();
    }
    this.audio.resume();
    this.survival = 0;
    this.scoreState = createScoreState();
    this.powers = createPowerState();
    this.thrusting = false;
    this.paused = false;
    this.audio.setThrusting(false);
    this.asteroids = [];
    this.orbs = [];
    this.hazards = [];
    this.popups = [];
    this.sparks = [];
    this.spawnTimer = 0.6;
    this.scrollSpeed = CONFIG.BASE_SCROLL;
    this.banner = "";
    this.bannerTimer = 0;
    this.hitMilestones = new Set();
    this.lastTheme = "day";
    this.flags = { fever: false, bossCleared: false, rainbow: false };
    this.usedRevive = false;
    this.canRevive = false;
    resetShip(this.ship, this.W, this.H);
    this._updateScoreUI();
    this._applyThemeCss(themeForScore(0));
    this.ui.hint.classList.remove("hidden");
    this.hintShown = true;
    this.state = "playing";
    this.ui.overlay.classList.remove("visible");
    this.ui.titleScreen.hidden = true;
    this.ui.gameoverScreen.hidden = true;
    if (this.ui.newBest) this.ui.newBest.hidden = true;
    if (this.ui.reviveBtn) this.ui.reviveBtn.hidden = true;
  }

  _finalizeRun() {
    const score = totalScore(this.scoreState);
    const isNew = score > this.highScore;
    if (isNew) {
      this.highScore = score;
      saveHighScore(score);
    }
    this.stats = bumpStats({
      games: 1,
      coins: this.scoreState.coins,
      nearMisses: this.scoreState.nearMisses,
      bestSurvival: Math.floor(this.survival),
      feverCount: this.flags.fever ? 1 : 0,
    });
    this._grantAchievements();
    this._refreshMetaUI();
    this._setHighScoreUI();
    this.canRevive = false;
    return isNew;
  }

  revive() {
    if (!this.canRevive || this.usedRevive) return;
    this.usedRevive = true;
    this.canRevive = false;
    this.state = "playing";
    this.powers.shield = true;
    this.ship.y = this.H * 0.45;
    this.ship.vy = 0;
    this.asteroids = [];
    this.orbs = [];
    this.hazards = [];
    this.ui.overlay.classList.remove("visible");
    this.ui.gameoverScreen.hidden = true;
    if (this.ui.reviveBtn) this.ui.reviveBtn.hidden = true;
    this._showBanner("SECOND CHANCE");
    this.audio.playPower();
  }

  _grantAchievements() {
    const ctx = {
      games: this.stats.games || 0,
      runCoins: this.scoreState.coins,
      runNear: this.scoreState.nearMisses,
      peakMult: this.scoreState.peakMultiplier,
      fever: this.flags.fever,
      survival: this.survival,
      score: totalScore(this.scoreState),
      bossCleared: this.flags.bossCleared,
      rainbow: this.flags.rainbow,
    };
    const newly = evaluateAchievements(ctx, this.achievements);
    if (newly.length) {
      for (const a of newly) this.achievements.push(a.id);
      saveAchievements(this.achievements);
      this._showBanner("ACH: " + newly[0].name.toUpperCase());
      showToast(this.ui.toast, "unlocked: " + newly.map((a) => a.name).join(", "));
      this.audio.playMilestone();
    }
  }

  die() {
    if (this.state !== "playing") return;

    // offer revive once if score is decent
    if (!this.usedRevive && totalScore(this.scoreState) >= 400) {
      this.canRevive = true;
      this.state = "dead";
      this.paused = false;
      this.thrusting = false;
      this.audio.setThrusting(false);
      this.audio.playDeath();
      emitSparks(this.sparks, this.ship.x, this.ship.y, 12, [COLORS.bird, COLORS.beak, COLORS.ink]);

      const score = totalScore(this.scoreState);
      this.ui.finalScore.textContent = String(score);
      this._setHighScoreUI();
      this.ui.runStats.textContent =
        Math.floor(this.survival) +
        "s  
        this.scoreState.peakMultiplier +
        " · coins " +
        this.scoreState.coins;
      this.ui.titleScreen.hidden = true;
      this.ui.gameoverScreen.hidden = false;
      if (this.ui.reviveBtn) this.ui.reviveBtn.hidden = false;
      if (this.ui.newBest) this.ui.newBest.hidden = true;
      this.ui.overlay.classList.add("visible");
      return;
    }

    this.state = "dead";
    this.paused = false;
    this.thrusting = false;
    this.audio.setThrusting(false);
    this.audio.playDeath();
    emitSparks(this.sparks, this.ship.x, this.ship.y, 12, [COLORS.bird, COLORS.beak, COLORS.ink]);

    const isNew = this._finalizeRun();

    const score = totalScore(this.scoreState);

    this.ui.finalScore.textContent = String(score);
    this._setHighScoreUI();
    this.ui.runStats.textContent =
      Math.floor(this.survival) +
      "s · peak x" +
      this.scoreState.peakMultiplier +
      " · coins " +
      this.scoreState.coins;
    if (this.ui.newBest) this.ui.newBest.hidden = !isNew;
    if (this.ui.reviveBtn) this.ui.reviveBtn.hidden = true;
    this.ui.titleScreen.hidden = true;
    this.ui.gameoverScreen.hidden = false;
    this.ui.overlay.classList.add("visible");
  }

  setThrust(on) {
    if (this.state !== "playing" || this.paused) return;
    this.thrusting = on;
    this.audio.setThrusting(on);
    if (on && this.hintShown) {
      this.hintShown = false;
      this.ui.hint.classList.add("hidden");
    }
  }

  _updateScoreUI() {
    const score = totalScore(this.scoreState);
    this.ui.score.textContent = String(score);
    let label = formatMultLabel(this.scoreState);
    if (this.powers.fever > 0) label = "FEVER " + label;
    this.ui.mult.textContent = label;
    if (this.ui.themeLabel) {
      this.ui.themeLabel.textContent = themeForScore(score).name;
    }
  }

  _tryFever() {
    if (
      this.scoreState.multiplier >= CONFIG.FEVER_MULT &&
      this.powers.fever <= 0 &&
      !this.flags.fever
    ) {
      this.powers.fever = CONFIG.FEVER_DURATION;
      this.flags.fever = true;
      this._showBanner("FEVER!");
      this.audio.playMilestone();
    }
    // refresh fever while at high mult
    if (this.scoreState.multiplier >= CONFIG.FEVER_MULT && this.powers.fever > 0) {
      // keep ticking normally
    }
  }

  _applyPickup(orb) {
    const feverBonus = this.powers.fever > 0 ? 2 : 1;na
    const mult = collectOrb(this.scoreState, orb.type);

    if (orb.type === "coin") {
      if (feverBonus > 1) this.scoreState.orbBonus += CONFIG.ORB_POINTS * mult;
      this.audio.playPickup(mult);
      this._popup(orb.x, orb.y, "+" + CONFIG.ORB_POINTS * mult * feverBonus, COLORS.coin);
      emitSparks(this.sparks, orb.x, orb.y, 6, [COLORS.coin, "#fff3a0"]);
      if (this.scoreState.orbStreak % CONFIG.STREAK_STEP === 0 && this.scoreState.multiplier > 1) {
        this._popup(orb.x, orb.y - 18, "x" + this.scoreState.multiplier + "!", COLORS.magnet);
        this.audio.playPower();
        this._tryFever();
      }
    } else if (orb.type === "rainbow") {
      this.flags.rainbow = true;
      this.audio.playMilestone();
      this._popup(orb.x, orb.y, "RAINBOW +" + CONFIG.RAINBOW_POINTS * mult, COLORS.fever);
      emitSparks(this.sparks, orb.x, orb.y, 14, COLORS.rainbow);
      this._tryFever();
    } else if (orb.type === "shield") {
      this.powers.shield = true;
      this.audio.playPower();
      this._popup(orb.x, orb.y, "SHIELD", COLORS.shield);
      emitSparks(this.sparks, orb.x, orb.y, 8, [COLORS.shield, "#a0d0ff"]);
    } else if (orb.type === "slow") {
      this.powers.slow = CONFIG.SLOW_DURATION;
      this.audio.playPower();
      this._popup(orb.x, orb.y, "SLOW-MO", COLORS.slow);
      emitSparks(this.sparks, orb.x, orb.y, 8, [COLORS.slow, "#d0a0ff"]);
    } else if (orb.type === "magnet") {
      this.powers.magnet = CONFIG.MAGNET_DURATION;
      this.audio.playPower();
      this._popup(orb.x, orb.y, "MAGNET", COLORS.magnet);
      emitSparks(this.sparks, orb.x, orb.y, 8, [COLORS.magnet, "#ffb0c0"]);
    }
    this._updateScoreUI();
  }

  _checkMilestones(score) {
    for (const m of MILESTONES) {
      if (score >= m && !this.hitMilestones.has(m)) {
        this.hitMilestones.add(m);
        this._showBanner(m + "!");
        this.audio.playMilestone();
      }
    }
    const theme = themeForScore(score);
    if (theme.name !== this.lastTheme) {
      this.lastTheme = theme.name;
      this._applyThemeCss(theme);
      this._showBanner(theme.name.toUpperCase());
    }
  }

  update(dt) {
    const scoreLive = totalScore(this.scoreState);
    const theme = themeForScore(scoreLive);
    const bgSpeed = this.state === "playing" && !this.paused ? this.scrollSpeed : 60;
    updateStarfield(this.field, this.W, this.H, bgSpeed, dt);
    updateWeather(this.weather, this.W, this.H, theme.name, dt);
    updatePopups(this.popups, dt);
    updateSparks(this.sparks, dt);

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.banner = "";
    }

    if (this.state !== "playing" || this.paused) return;

    this.survival += dt;
    tickPowers(this.powers, dt);

    const slowMul = this.powers.slow > 0 ? CONFIG.SLOW_FACTOR : 1;
    const feverSpeed = this.powers.fever > 0 ? 1.12 : 1;
    this.scrollSpeed = scrollSpeedAt(this.survival) * slowMul * feverSpeed;
    const spawnInterval = spawnIntervalAt(this.survival) / (slowMul < 1 ? 0.85 : 1);

    stepShip(this.ship, this.thrusting, dt);
    applyHazards(this.ship, this.hazards, dt);

    if (outOfBounds(this.ship, this.H)) {
      if (this.powers.shield) {
        this.powers.shield = false;
        this.ship.y = Math.max(20, Math.min(this.H - 20, this.ship.y));
        this.ship.vy *= -0.4;
        this._popup(this.ship.x, this.ship.y, "SAVED", COLORS.shield);
        this.audio.playPower();
      } else {
        this.die();
        return;
      }
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      spawnWave(this.asteroids, this.orbs, this.hazards, this.W, this.H, this.survival);
      this.spawnTimer = spawnInterval * rand(0.85, 1.15);
    }

    updateHazards(this.hazards, this.scrollSpeed, dt);

    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const a = this.asteroids[i];
      a.x -= this.scrollSpeed * dt;
      if (a.kind === "bird") {
        a.bob += a.bobSpeed * dt;
        a.y = a.baseY + Math.sin(a.bob) * a.bobAmp;
      }
      if (a.x < -100) {
        if (a.kind === "boss") this.flags.bossCleared = true;
        this.asteroids.splice(i, 1);
      }
    }

    const hit = findAsteroidHit(this.ship, this.asteroids);
    if (hit) {
      if (this.powers.shield) {
        this.powers.shield = false;
        const idx = this.asteroids.indexOf(hit);
        if (idx >= 0) {
          if (hit.kind === "boss") this.flags.bossCleared = true;
          this.asteroids.splice(idx, 1);
        }
        this._popup(this.ship.x, this.ship.y, "BLOCKED", COLORS.shield);
        emitSparks(this.sparks, hit.x, hit.y, 10, [COLORS.shield, COLORS.cactus]);
        this.audio.playPower();
      } else {
        this.die();
        return;
      }
    }

    checkNearMisses(this.ship, this.asteroids, () => {
      addNearMiss(this.scoreState);
      this.audio.playNearMiss();
      this._popup(this.ship.x, this.ship.y - 20, "CLOSE!", COLORS.bird);
      this._updateScoreUI();
    });

    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      o.x -= this.scrollSpeed * dt;
      o.pulse += dt * 5;
      if (o.x < -40) {
        if (o.type === "coin" || o.type === "rainbow") missOrb(this.scoreState);
        this.orbs.splice(i, 1);
        this._updateScoreUI();
      }
    }

    const mag = this.powers.magnet > 0 ? CONFIG.MAGNET_RANGE : 0;
    collectOrbs(this.ship, this.orbs, (o) => this._applyPickup(o), mag, dt);

    addDistance(this.scoreState, this.scrollSpeed / slowMul, dt);
    this._updateScoreUI();
    this._checkMilestones(totalScore(this.scoreState));
  }

  draw() {
    const theme = drawFrame(this.ctx, {
      W: this.W,
      H: this.H,
      field: this.field,
      asteroids: this.asteroids,
      orbs: this.orbs,
      hazards: this.hazards,
      weather: this.weather,
      ship: this.ship,
      thrusting: this.thrusting,
      state: this.state,
      score: totalScore(this.scoreState),
      powers: this.powers,
      popups: this.popups,
      sparks: this.sparks,
      paused: this.paused,
      banner: this.banner,
      skinId: this.skinId,
      streak: this.scoreState.orbStreak,
    });
    if (theme && this.state === "title") this._applyThemeCss(theme);
  }

  start() {
    const loop = (t) => {
      const dt = Math.min(0.033, (t - this.lastT) / 1000 || 0.016);
      this.lastT = t;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame((t) => {
      this.lastT = t;
      requestAnimationFrame(loop);
    });
  }
}

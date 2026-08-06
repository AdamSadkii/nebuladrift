import { Game } from "./game.js";

const canvas = document.getElementById("game");

const ui = {
  score: document.getElementById("score-value"),
  mult: document.getElementById("mult-value"),
  hint: document.getElementById("hint"),
  toast: document.getElementById("toast"),
  overlay: document.getElementById("overlay"),
  titleScreen: document.getElementById("title-screen"),
  gameoverScreen: document.getElementById("gameover-screen"),
  finalScore: document.getElementById("final-score"),
  bestScore: document.getElementById("best-score"),
  hiInline: document.getElementById("hi-inline"),
  runStats: document.getElementById("run-stats"),
  playBtn: document.getElementById("play-btn"),
  retryBtn: document.getElementById("retry-btn"),
  shareBtn: document.getElementById("share-btn"),
  muteBtn: document.getElementById("mute-btn"),
  skinBtn: document.getElementById("skin-btn"),
  reviveBtn: document.getElementById("revive-btn"),
  themeLabel: document.getElementById("theme-label"),
  newBest: document.getElementById("new-best"),
  statsLine: document.getElementById("stats-line"),
  achCount: document.getElementById("ach-count"),
};

const game = new Game(canvas, ui);
game.start();

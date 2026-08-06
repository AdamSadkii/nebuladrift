export function rand(a, b) {
  return a + Math.random() * (b - a);
}

export function pick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const rr = ar + br;
  return dx * dx + dy * dy < rr * rr;
}

export function dist(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
}

export function showToast(el, message, ms = 1600) {
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), ms);
}

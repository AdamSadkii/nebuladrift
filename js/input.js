export class Input {
  constructor({ onThrust, onStart, onPause, onSkin, isButton }) {
    this.onThrust = onThrust;
    this.onStart = onStart;
    this.onPause = onPause || (() => {});
    this.onSkin = onSkin || (() => {});
    this.isButton = isButton;
    this._bind();
  }

  _bind() {
    const down = (e) => {
      if (this.isButton(e.target)) return;
      if (e.cancelable) e.preventDefault();
      this.onThrust(true);
    };
    const up = (e) => {
      if (e && e.cancelable) e.preventDefault();
      this.onThrust(false);
    };

    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", up);

    window.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("touchend", up, { passive: false });
    window.addEventListener("touchcancel", up, { passive: false });

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        this.onStart();
        if (!e.repeat) this.onThrust(true);
      }
      if (e.key === "Enter" || e.key === "r" || e.key === "R") {
        this.onStart();
      }
      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        e.preventDefault();
        this.onPause();
      }
      if (e.key === "[" || e.key === "]") {
        this.onSkin && this.onSkin();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        this.onThrust(false);
      }
    });
  }
}

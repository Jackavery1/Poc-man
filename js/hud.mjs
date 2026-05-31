export function createHUD() {
  const scoreEl = document.getElementById('hud-score');
  const hiEl = document.getElementById('hud-hi');
  const lvlDpad = document.getElementById('hud-level-dpad');
  const announcer = document.getElementById('announcer');
  const livesRow = document.getElementById('lives-row');

  return {
    update({ score, hiScore, level }) {
      if (scoreEl) scoreEl.textContent = String(score);
      if (hiEl) hiEl.textContent = String(hiScore);
      if (lvlDpad) lvlDpad.textContent = String(level);
      if (announcer) announcer.textContent = `Points ${score}, niveau ${level}`;
    },
    announce(message) {
      if (announcer) announcer.textContent = message;
    },
    drawLives(pacman) {
      if (!livesRow) return;
      livesRow.replaceChildren();
      for (let i = 0; i < pacman.lives; i++) {
        const c = document.createElement('canvas');
        c.width = 18;
        c.height = 18;
        const cx = c.getContext('2d');
        cx.save();
        cx.translate(9, 9);
        cx.shadowColor = '#FFE000';
        cx.shadowBlur = 8;
        cx.fillStyle = '#FFE000';
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.arc(0, 0, 7, 0.4, Math.PI * 2 - 0.4);
        cx.closePath();
        cx.fill();
        cx.restore();
        livesRow.appendChild(c);
      }
    },
  };
}

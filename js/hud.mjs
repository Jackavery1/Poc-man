export function createHUD() {
  const scoreEl = document.getElementById('hud-score');
  const hiEl = document.getElementById('hud-hi');
  const lvlDpad = document.getElementById('hud-level-dpad');
  const announcer = document.getElementById('announcer');

  return {
    update({ score, hiScore, level }) {
      if (scoreEl) scoreEl.textContent = String(score);
      if (hiEl) hiEl.textContent = String(hiScore);
      if (lvlDpad) lvlDpad.textContent = String(level);
      if (announcer) announcer.textContent = `Score ${score}, niveau ${level}`;
    },
    announce(message) {
      if (announcer) announcer.textContent = message;
    },
  };
}

export const audio = {
  ctx: null,
  chomping: false,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  tone(freq, dur, type = 'square', vol = 0.2, t = 0) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(this.ctx.destination);
    o.type = type;
    o.frequency.value = freq;
    const now = this.ctx.currentTime + t;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.start(now);
    o.stop(now + dur + 0.01);
  },
  waka() {
    this.init();
    this.chomping = !this.chomping;
    this.tone(this.chomping ? 700 : 500, 0.07, 'square', 0.12);
  },
  pellet() {
    this.init();
    this.tone(200, 0.25, 'sawtooth', 0.18);
    this.tone(150, 0.25, 'sine', 0.12, 0.1);
  },
  eatGhost(n) {
    this.init();
    const f = [440, 880, 1320, 1760][n % 4];
    this.tone(f, 0.06, 'square', 0.25);
    this.tone(f * 1.5, 0.06, 'square', 0.2, 0.07);
  },
  death() {
    this.init();
    [800, 700, 600, 500, 400, 300, 200, 150].forEach((f, i) => {
      this.tone(f, 0.1, 'sawtooth', 0.22, i * 0.08);
    });
  },
  levelUp() {
    this.init();
    [330, 392, 494, 659, 784].forEach((f, i) => {
      this.tone(f, 0.12, 'triangle', 0.2, i * 0.1);
    });
  },
  start() {
    this.init();
    [220, 294, 370, 440, 370, 294, 440].forEach((f, i) => {
      this.tone(f, 0.15, 'square', 0.15, i * 0.1);
    });
  },
};

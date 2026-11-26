// Sleek Web Audio synthesizer for chess sound effects (Move, Capture, Check, Game Over)

class ChessSoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft wooden move tap
  public playMove() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // AudioContext muted or blocked
    }
  }

  // Deeper capture thud
  public playCapture() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // AudioContext muted or blocked
    }
  }

  // Check alert chime
  public playCheck() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext muted or blocked
    }
  }

  // Neutral two-tone chime for Draw / Repetition
  public playDraw() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [440, 392];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.11;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.14);
      });
    } catch {
      // AudioContext muted or blocked
    }
  }
}

export const chessSound = new ChessSoundManager();

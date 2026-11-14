/* A 4-bar loop synthesized in the browser: no samples, no network.
   Ported from the prototype. Framework-agnostic; the UI passes a callback
   that receives the loop position (0 to 1) each frame, or null when stopped. */

const STEP = 60 / 140 / 4; // seconds per sixteenth note at 140 BPM
const STEPS_IN_LOOP = 64; // 4 bars of 16
const KICK = [0, 7, 10];
const CLAP = [8];
const HATS = [0, 2, 4, 6, 8, 10, 12, 13, 14, 15];
const BASS: Record<number, number> = { 0: 55, 7: 55, 10: 43.65, 14: 49 };

export type Beat = {
  /** Starts or stops the loop. Returns whether it is now playing. */
  toggle(): boolean;
  stop(): void;
  readonly playing: boolean;
};

export function createBeat(onProgress: (progress: number | null) => void): Beat {
  let ac: AudioContext | undefined;
  let master: GainNode | undefined;
  let noiseBuffer: AudioBuffer | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let frame = 0;
  let playing = false;
  let step = 0;
  let nextTime = 0;
  let startTime = 0;

  function kick(ctx: AudioContext, out: GainNode, t: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.11);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + 0.34);
  }

  function bass(ctx: AudioContext, out: GainNode, t: number, freq: number, length: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq * 1.9, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.8, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + length + 0.02);
  }

  function noise(
    ctx: AudioContext,
    out: GainNode,
    t: number,
    freq: number,
    length: number,
    volume: number,
    type: BiquadFilterType = "highpass",
  ) {
    if (!noiseBuffer) return;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = noiseBuffer;
    filter.type = type;
    filter.frequency.value = freq;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);
    src.connect(filter).connect(gain).connect(out);
    src.start(t);
    src.stop(t + length + 0.02);
  }

  // Queues every note that falls in the next 120ms. Runs on a short interval so
  // timing comes from the audio clock, not from setInterval.
  function schedule() {
    if (!ac || !master) return;
    while (nextTime < ac.currentTime + 0.12) {
      const s = step % 16;
      const bar = Math.floor(step / 16) % 4;
      if (KICK.includes(s)) kick(ac, master, nextTime);
      if (CLAP.includes(s)) {
        noise(ac, master, nextTime, 1400, 0.2, 0.7, "bandpass");
        noise(ac, master, nextTime + 0.012, 1400, 0.03, 0.5, "bandpass");
      }
      if (HATS.includes(s)) {
        noise(ac, master, nextTime, 7600, 0.045, 0.3);
        if (bar === 3 && s >= 12) noise(ac, master, nextTime + STEP / 2, 7600, 0.04, 0.25);
      }
      if (BASS[s]) {
        const lift = bar === 2 && s === 10 ? 1.122 : 1;
        bass(ac, master, nextTime, BASS[s] * lift, s === 0 ? STEP * 6.5 : STEP * 3);
      }
      nextTime += STEP;
      step++;
    }
  }

  function draw() {
    if (!playing || !ac) return;
    onProgress(((ac.currentTime - startTime) / (STEP * STEPS_IN_LOOP)) % 1);
    frame = requestAnimationFrame(draw);
  }

  function start(): boolean {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      ac ??= new Ctor();
      if (!master) {
        master = ac.createGain();
        master.connect(ac.createDynamicsCompressor()).connect(ac.destination);
        const buffer = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noiseBuffer = buffer;
      }
      void ac.resume();
    } catch {
      return false;
    }
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(0.5, ac.currentTime);
    playing = true;
    step = 0;
    nextTime = startTime = ac.currentTime + 0.05;
    schedule();
    timer = setInterval(schedule, 25);
    draw();
    return true;
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    cancelAnimationFrame(frame);
    if (ac && master) master.gain.setTargetAtTime(0, ac.currentTime, 0.04);
    onProgress(null);
  }

  return {
    toggle() {
      if (playing) {
        stop();
        return false;
      }
      return start();
    },
    stop,
    get playing() {
      return playing;
    },
  };
}

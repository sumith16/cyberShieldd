const audioCtx = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export const sounds = {
  pop: () => playTone(800, "sine", 0.1, 0.2),
  success: () => {
    playTone(523.25, "sine", 0.1, 0.1); // C5
    setTimeout(() => playTone(659.25, "sine", 0.1, 0.1), 100); // E5
    setTimeout(() => playTone(783.99, "sine", 0.2, 0.1), 200); // G5
  },
  error: () => {
    playTone(300, "sawtooth", 0.2, 0.1);
    setTimeout(() => playTone(250, "sawtooth", 0.3, 0.1), 150);
  },
  swipe: () => playTone(400, "triangle", 0.1, 0.05),
  click: () => playTone(1000, "square", 0.05, 0.02),
  chime: () => playTone(1200, "sine", 0.4, 0.05),
};

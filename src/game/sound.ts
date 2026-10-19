// Звуки из набора Hanna-Barbera, нарезаны и сохранены в public/sounds
const SOUNDS = {
  hit: { url: "/sounds/hit.mp3", volume: 0.7 }, // попадание, муха ещё жива
  kill: { url: "/sounds/kill.mp3", volume: 0.8 }, // муха убита
  miss: { url: "/sounds/miss.mp3", volume: 0.6 }, // клик мимо
  tick: { url: "/sounds/tick.mp3", volume: 0.5 }, // отсчёт перед раундом
  start: { url: "/sounds/start.mp3", volume: 0.7 }, // старт раунда
  end: { url: "/sounds/end.mp3", volume: 0.7 }, // время вышло
} as const;

export type SoundName = keyof typeof SOUNDS;

let audioCtx: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
let loading: Promise<void> | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Браузер может приостановить звук до первого действия пользователя
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

// Загружает и декодирует все звуки заранее, чтобы первый клик сразу звучал.
// Если файлы не загрузились, игра работает без звука.
export function preloadSounds(): Promise<void> {
  if (!loading) {
    const ctx = getAudioContext();
    loading = Promise.all(
      (Object.keys(SOUNDS) as SoundName[]).map(async (name) => {
        const response = await fetch(SOUNDS[name].url);
        const data = await response.arrayBuffer();
        buffers.set(name, await ctx.decodeAudioData(data));
      })
    ).then(
      () => undefined,
      (error) => {
        // Игра работает и без звука, но причину стоит видеть в консоли
        console.warn("Звуки не загрузились:", error);
      }
    );
  }
  return loading;
}

// rate > 1 делает звук выше и быстрее - так золотая муха звучит отдельно от обычной
export function playSound(name: SoundName, rate = 1) {
  const buffer = buffers.get(name);
  if (!buffer) return;

  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  source.playbackRate.value = rate;
  gain.gain.value = SOUNDS[name].volume;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

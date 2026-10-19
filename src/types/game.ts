import type { FlyInstance } from "./fly";

export type GamePhase = "countdown" | "playing" | "finished";

export interface RoundStats {
  score: number;
  caught: number;
  golden: number; 
  hits: number; 
  misses: number; 
}

export interface Popup {
  id: string;
  x: number; 
  y: number; 
  text: string;
  tone: "hit" | "gold" | "miss";
  expiresAt: number; 
}


export interface RoundState {
  phase: GamePhase;
  countdownLeftMs: number;
  lastCountdownSecond: number; // последняя показанная цифра отсчёта, чтобы тик звучал один раз
  elapsedMs: number; // сколько прошло с начала раунда (таймера нет, нужно для нарастания потока мух)
  nextSpawnAt: number;
  flies: FlyInstance[];
  popups: Popup[];
  stats: RoundStats;
}
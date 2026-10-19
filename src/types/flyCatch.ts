import type { EntrySide } from "./fly";

export type FlyDifficulty = "лёгкая" | "средняя" | "сложная" | "золотая";

// Запись об одной пойманной (убитой) мухе - то, что показывает история
export interface FlyCatch {
  id: string;
  name: string;
  notes: string;
  hitsCount: number; // сколько ударов потребовалось: обычная 1, золотая 3
  avgReactionMs: number;
  dateCaught: string;
  difficulty: FlyDifficulty;
  isGolden: boolean;
  entrySide: EntrySide; // с какого края экрана влетела муха
}

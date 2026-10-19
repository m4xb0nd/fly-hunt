import type { FlyCatch } from "../types/flyCatch";

const mockCatches: FlyCatch[] = [
  {
    id: "fly-001",
    name: "Обычная муха",
    notes: "Вылетела справа и сразу попала под первый удар",
    hitsCount: 1,
    avgReactionMs: 320,
    dateCaught: "2026-09-17",
    difficulty: "лёгкая",
    isGolden: false,
    entrySide: "right",
  },
  {
    id: "fly-002",
    name: "Золотая муха",
    notes: "Редкая, пришлось ударить трижды, прежде чем она упала",
    hitsCount: 3,
    avgReactionMs: 410,
    dateCaught: "2026-09-18",
    difficulty: "золотая",
    isGolden: true,
    entrySide: "top",
  },
];

// Имитация запроса к серверу: возвращает Promise с задержкой
export function getCatchesMock(): Promise<FlyCatch[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCatches);
    }, 800);
  });
}

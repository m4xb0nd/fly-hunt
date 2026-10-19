const STORAGE_KEY = "flyhunt:best-score";

// Рекорд хранится в localStorage - только в браузере этого пользователя.
// Если хранилище недоступно (приватный режим, запрет на cookies), рекорд просто равен нулю.
export function loadBestScore(): number {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number) {
  if (score <= loadBestScore()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // Хранилище недоступно - рекорд не сохранится, игра при этом работает
  }
}

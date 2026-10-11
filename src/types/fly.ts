export type FlyKind = "normal" | "golden";
export type EntrySide = "top" | "bottom" | "left" | "right";
// "flying" - муха летает и её можно ударить;
// "dying" - обычная муха убита: падает, её можно схватить;
// "sparking" - золотая муха убита: на месте проигрываются искры, потом муха исчезает
export type FlyPhase = "flying" | "dying" | "sparking";

// Одна муха на игровом поле (не путать с FlyCatch - записью о пойманной мухе для истории)
export interface FlyInstance {
  id: string;
  kind: FlyKind;
  entrySide: EntrySide;
  x: number; // % от ширины игрового поля, 0-100
  y: number; // % от высоты игрового поля, 0-100
  dx: number; // скорость по x, % в миллисекунду (пока муха летает)
  dy: number; // скорость по y, % в миллисекунду (пока муха летает)
  hitsRequired: number; // сколько ударов нужно, чтобы муха погибла
  hitsLanded: number; // сколько ударов уже засчитано
  phase: FlyPhase;
  deathFrameIndex: number; // какой кадр смерти выпал (выбирается случайно при гибели)

  // Физика мёртвой мухи
  vx: number; // скорость по x, % в миллисекунду
  vy: number; // скорость по y, % в миллисекунду (положительная - вниз)
  spin: number; // поворот картинки, градусы
  spinSpeed: number; // вращение, градусы в миллисекунду
  held: boolean; // муху сейчас держат мышкой
  landed: boolean; // муха упала на "стол" внизу поля
  removeAt: number; // момент (performance.now), когда лежащая муха исчезает
}

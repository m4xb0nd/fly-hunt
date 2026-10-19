import type { EntrySide, FlyInstance, FlyKind } from "../types/fly";
import { FLY_ASSETS } from "./flyAssets";

const ENTRY_SIDES: EntrySide[] = ["top", "bottom", "left", "right"];

function randomEntrySide(): EntrySide {
  return ENTRY_SIDES[Math.floor(Math.random() * ENTRY_SIDES.length)];
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Начальная позиция и направление полёта зависят от того,
// с какого края экрана влетает муха.
function startPositionAndVelocity(side: EntrySide) {
  const speed = randomBetween(0.015, 0.03); // % экрана в миллисекунду

  switch (side) {
    case "top":
      return { x: randomBetween(10, 90), y: -5, dx: randomBetween(-0.01, 0.01), dy: speed };
    case "bottom":
      return { x: randomBetween(10, 90), y: 105, dx: randomBetween(-0.01, 0.01), dy: -speed };
    case "left":
      return { x: -5, y: randomBetween(10, 90), dx: speed, dy: randomBetween(-0.01, 0.01) };
    case "right":
      return { x: 105, y: randomBetween(10, 90), dx: -speed, dy: randomBetween(-0.01, 0.01) };
  }
}

export function spawnFly(kind: FlyKind): FlyInstance {
  const side = randomEntrySide();
  const { x, y, dx, dy } = startPositionAndVelocity(side);

  return {
    id: `fly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    entrySide: side,
    x,
    y,
    dx,
    dy,
    hitsRequired: FLY_ASSETS[kind].hitsRequired,
    hitsLanded: 0,
    phase: "flying",
    deathFrameIndex: 0,
    vx: 0,
    vy: 0,
    spin: 0,
    spinSpeed: 0,
    held: false,
    landed: false,
    removeAt: Infinity,
  };
}

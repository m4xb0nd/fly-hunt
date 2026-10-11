import { useCallback, useEffect, useRef, useState } from "react";
import type { FlyInstance, FlyKind } from "../types/fly";
import type { Popup, RoundState } from "../types/game";
import { spawnFly } from "./spawnFly";
import { pickRandomDeathFrame } from "./flyAssets";
import { playSound } from "./sound";

export const COUNTDOWN_MS = 3000; // обратный отсчёт перед стартом раунда
const RAMP_MS = 60_000; // за это время мухи становятся всё чаще (таймера раунда больше нет)

const GOLDEN_CHANCE = 0.15; // 15% шанс, что вылетит золотая муха
const SPAWN_INTERVAL_START_MS = 1300; // в начале раунда мухи вылетают реже...
const SPAWN_INTERVAL_END_MS = 500; // ...а со временем - почти непрерывным потоком
const POPUP_MS = 700; // сколько живёт всплывающая надпись
const OFFSCREEN_MARGIN = 15; // на сколько % за краем поля муха считается улетевшей
const MAX_FRAME_MS = 100; // большой скачок времени (вкладку свернули) не должен телепортировать мух
const POINTS: Record<FlyKind, number> = { normal: 10, golden: 50 };

// Мёртвая муха падает вниз, пока не упадёт на "стол" - нижнюю линию поля
const GRAVITY = 0.00025; // % в миллисекунду за миллисекунду
const FLOOR_Y = 92; // уровень стола, % от высоты поля
const SIDE_MARGIN = 3; // мёртвую муху не выносит за боковые края
const LIE_MS = 2500; // сколько убитая обычная муха лежит на столе, потом исчезает
const SPARKS_MS = 800; // сколько длятся искры золотой мухи (гифка должна укладываться в это время)

// Отскоки и бросок
const WALL_BOUNCE = 0.5; // после удара о боковую стену или потолок остаётся половина скорости
const FLOOR_BOUNCE = 0.35; // о стол муха отскакивает слабее
const SETTLE_SPEED = 0.01; // медленнее этого муха уже не подпрыгивает, а ложится
const MAX_THROW_SPEED = 0.6; // потолок скорости броска, % в миллисекунду
const THROW_WINDOW_MS = 80; // если курсор стоял дольше этого, при отпускании муха просто падает

// Муха, которую сейчас держат мышкой
interface HeldFly {
  id: string;
  dx: number; // смещение мухи от курсора, % поля
  dy: number;
  lastX: number; // предыдущая позиция курсора, % поля
  lastY: number;
  lastT: number; // когда курсор был в предыдущей позиции
  vx: number; // сглаженная скорость курсора, % в миллисекунду
  vy: number;
}

function createRound(): RoundState {
  return {
    phase: "countdown",
    countdownLeftMs: COUNTDOWN_MS,
    lastCountdownSecond: 0,
    elapsedMs: 0,
    nextSpawnAt: 0,
    flies: [],
    popups: [],
    stats: { score: 0, caught: 0, golden: 0, hits: 0, misses: 0 },
  };
}

// Копия состояния для React: так интерфейс получает новые объекты на каждом кадре
function snapshot(round: RoundState): RoundState {
  return {
    ...round,
    flies: round.flies.map((fly) => ({ ...fly })),
    popups: [...round.popups],
    stats: { ...round.stats },
  };
}

function addPopup(
  round: RoundState,
  x: number,
  y: number,
  text: string,
  tone: Popup["tone"],
  now: number
) {
  round.popups.push({
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    x,
    y,
    text,
    tone,
    expiresAt: now + POPUP_MS,
  });
}

// Чем дольше идёт раунд, тем чаще вылетают мухи
function spawnIntervalFor(elapsedMs: number): number {
  const progress = Math.min(elapsedMs / RAMP_MS, 1); // 0 в начале, 1 через минуту и дальше
  return SPAWN_INTERVAL_START_MS + (SPAWN_INTERVAL_END_MS - SPAWN_INTERVAL_START_MS) * progress;
}

function isOnScreen(fly: FlyInstance): boolean {
  const min = -OFFSCREEN_MARGIN;
  const max = 100 + OFFSCREEN_MARGIN;
  return fly.x > min && fly.x < max && fly.y > min && fly.y < max;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Падение мёртвой мухи: гравитация, снос, вращение и отскоки.
// Бьётся о боковые стены и потолок, подпрыгивает о стол. Когда муха легла на стол,
// она трётся о него (замедляется) и через LIE_MS исчезает.
function updateDeadFly(fly: FlyInstance, dt: number, now: number) {
  fly.vy += GRAVITY * dt;
  fly.x += fly.vx * dt;
  fly.y += fly.vy * dt;
  fly.spin += fly.spinSpeed * dt;

  // Боковые стены поля: муха отлетает обратно
  if (fly.x < SIDE_MARGIN) {
    fly.x = SIDE_MARGIN;
    fly.vx = Math.abs(fly.vx) * WALL_BOUNCE;
  } else if (fly.x > 100 - SIDE_MARGIN) {
    fly.x = 100 - SIDE_MARGIN;
    fly.vx = -Math.abs(fly.vx) * WALL_BOUNCE;
  }

  // Потолок поля
  if (fly.y < 0) {
    fly.y = 0;
    fly.vy = Math.abs(fly.vy) * WALL_BOUNCE;
  }

  if (fly.y < FLOOR_Y) return;

  // Стол: трение действует всегда, пока муха на нём
  fly.y = FLOOR_Y;
  const friction = Math.pow(0.9, dt / 16);
  fly.vx *= friction;
  fly.spinSpeed *= friction;

  // Сильный удар о стол - подпрыгиваем. Слабый - ложимся и начинаем отсчёт до исчезновения.
  if (fly.vy > SETTLE_SPEED) {
    fly.vy = -fly.vy * FLOOR_BOUNCE;
    return;
  }
  fly.vy = 0;
  if (!fly.landed) {
    fly.landed = true;
    fly.removeAt = now + LIE_MS;
  }
}

// Один шаг игры: таймеры, спавн, движение и уборка. Меняет round на месте.
function step(round: RoundState, dt: number, now: number) {
  if (round.phase === "countdown") {
    round.countdownLeftMs -= dt;
    // Тик на каждую новую цифру отсчёта: 3, 2, 1
    const second = Math.ceil(round.countdownLeftMs / 1000);
    if (round.countdownLeftMs > 0 && second !== round.lastCountdownSecond) {
      round.lastCountdownSecond = second;
      playSound("tick");
    }
    if (round.countdownLeftMs <= 0) {
      round.phase = "playing";
      round.nextSpawnAt = now;
      playSound("start");
    }
  }

  if (round.phase === "playing") {
    round.elapsedMs += dt;
    if (now >= round.nextSpawnAt) {
      const kind: FlyKind = Math.random() < GOLDEN_CHANCE ? "golden" : "normal";
      round.flies.push(spawnFly(kind));
      round.nextSpawnAt = now + spawnIntervalFor(round.elapsedMs);
    }
  }

  for (const fly of round.flies) {
    if (fly.phase === "flying") {
      fly.x += fly.dx * dt;
      fly.y += fly.dy * dt;
    } else if (fly.phase === "dying" && !fly.held) {
      // Мёртвую муху в руке не двигаем: её ведёт курсор (см. moveFly)
      updateDeadFly(fly, dt, now);
    }
  }

  // Летающие мухи уходят за экран, убитые обычные - исчезают, когда полежали на столе,
  // золотые - когда догорели искры. Муху в руке не удаляем никогда.
  round.flies = round.flies.filter((fly) => {
    if (fly.phase === "flying") return isOnScreen(fly);
    if (fly.phase === "sparking") return now < fly.removeAt;
    return fly.held || now < fly.removeAt;
  });
  round.popups = round.popups.filter((popup) => popup.expiresAt > now);
}

// Хук ведёт один раунд игры. Состояние меняется в цикле requestAnimationFrame,
// а React получает его копию (state) и перерисовывает поле.
export function useFlyRound() {
  // Изменяемая модель раунда лежит в ref: React не отслеживает её изменения,
  // а интерфейс получает копии через setState
  const roundRef = useRef(createRound());
  const [state, setState] = useState<RoundState>(createRound);
  // Какую муху сейчас держат и как движется курсор
  const heldRef = useRef<HeldFly | null>(null);

  useEffect(() => {
    const round = roundRef.current;
    let frameId = 0;
    let lastTime = performance.now();

    function tick(now: number) {
      const dt = Math.min(Math.max(now - lastTime, 0), MAX_FRAME_MS);
      lastTime = now;
      step(round, dt, now);
      setState(snapshot(round));
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Клик по мухе. Вызывается из обработчика события, а не из setState,
  // поэтому здесь безопасно проигрывать звук и менять счёт.
  const hitFly = useCallback((id: string) => {
    const round = roundRef.current;
    const now = performance.now();
    const fly = round.flies.find((f) => f.id === id);
    if (round.phase !== "playing" || !fly || fly.phase !== "flying") return;

    fly.hitsLanded += 1;
    round.stats.hits += 1;
    // Золотую муху звуком выделяем: чуть выше и быстрее
    const rate = fly.kind === "golden" ? 1.4 : 1;

    if (fly.hitsLanded < fly.hitsRequired) {
      playSound("hit", rate);
      addPopup(round, fly.x, fly.y, `${fly.hitsLanded}/${fly.hitsRequired}`, "hit", now);
      return;
    }

    playSound("kill", rate);

    // Очки и счётчик засчитываются здесь, один раз, в момент убийства.
    const points = POINTS[fly.kind];
    round.stats.caught += 1;
    round.stats.score += points;
    if (fly.kind === "golden") {
      // Золотая муха не падает: на месте вспыхивают искры, потом муха исчезает
      fly.phase = "sparking";
      fly.removeAt = now + SPARKS_MS;
      round.stats.golden += 1;
    } else {
      // Обычная муха перестаёт лететь и падает с небольшим подскоком
      fly.phase = "dying";
      fly.deathFrameIndex = pickRandomDeathFrame(fly.kind);
      fly.vx = (Math.random() - 0.5) * 0.024;
      fly.vy = -0.05;
      fly.spinSpeed = (Math.random() - 0.5) * 0.3;
    }
    addPopup(round, fly.x, fly.y, `+${points}`, fly.kind === "golden" ? "gold" : "hit", now);
  }, []);

  // Схватить убитую муху мышкой. Счёт и счётчик поимок не меняются:
  // поимка уже засчитана в hitFly.
  const grabFly = useCallback((id: string, x: number, y: number) => {
    const fly = roundRef.current.flies.find((f) => f.id === id);
    if (!fly || fly.phase !== "dying") return;

    fly.held = true;
    fly.landed = false;
    fly.removeAt = Infinity;
    fly.vx = 0;
    fly.vy = 0;
    heldRef.current = {
      id,
      dx: fly.x - x,
      dy: fly.y - y,
      lastX: x,
      lastY: y,
      lastT: performance.now(),
      vx: 0,
      vy: 0,
    };
  }, []);

  const moveFly = useCallback((x: number, y: number) => {
    const held = heldRef.current;
    if (!held) return;
    const fly = roundRef.current.flies.find((f) => f.id === held.id);
    if (!fly) {
      heldRef.current = null;
      return;
    }

    const now = performance.now();
    const dt = Math.max(now - held.lastT, 1);
    held.vx = held.vx * 0.5 + ((x - held.lastX) / dt) * 0.5;
    held.vy = held.vy * 0.5 + ((y - held.lastY) / dt) * 0.5;
    held.lastX = x;
    held.lastY = y;
    held.lastT = now;

    fly.x = clamp(x + held.dx, SIDE_MARGIN, 100 - SIDE_MARGIN);
    fly.y = clamp(y + held.dy, 0, 100);
  }, []);

  const releaseFly = useCallback(() => {
    const held = heldRef.current;
    if (!held) return;
    heldRef.current = null;
    const fly = roundRef.current.flies.find((f) => f.id === held.id);
    if (!fly) return;

    fly.held = false;
    let vx = 0;
    let vy = 0;
    if (performance.now() - held.lastT < THROW_WINDOW_MS) {
      vx = held.vx;
      vy = held.vy;
      const speed = Math.hypot(vx, vy);
      if (speed > MAX_THROW_SPEED) {
        vx = (vx / speed) * MAX_THROW_SPEED;
        vy = (vy / speed) * MAX_THROW_SPEED;
      }
    }
    fly.vx = vx;
    fly.vy = vy;
  }, []);

  const registerMiss = useCallback((x: number, y: number) => {
    const round = roundRef.current;
    if (round.phase !== "playing") return;
    round.stats.misses += 1;
    playSound("miss");
    addPopup(round, x, y, "мимо", "miss", performance.now());
  }, []);

  const stopRound = useCallback(() => {
    const round = roundRef.current;
    if (round.phase !== "playing") return;
    heldRef.current = null;
    round.phase = "finished";
    round.flies = [];
    round.popups = [];
    playSound("end");
  }, []);

  const restart = useCallback(() => {
    heldRef.current = null;
    Object.assign(roundRef.current, createRound());
  }, []);

  return { state, hitFly, grabFly, moveFly, releaseFly, registerMiss, stopRound, restart };
}
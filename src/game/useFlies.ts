import { useCallback, useEffect, useRef, useState } from "react";
import type { EntrySide, FlyInstance, FlyKind } from "../types/fly";
import { spawnFly } from "./spawnFly";
import { pickRandomDeathFrame } from "./flyAssets";
import { playHitSound } from "./sound";

export interface CatchResult {
  kind: FlyKind;
  entrySide: EntrySide;
  caughtAt: number;
}

const SPAWN_INTERVAL_MS = 1400; // как часто вылетает новая муха
const GOLDEN_CHANCE = 0.15; // 15% шанс, что вылетит золотая муха
const DEATH_ANIMATION_MS = 600; // сколько держим кадр смерти перед удалением

// Хук инкапсулирует всю игровую логику: спавн мух, их движение и попадания.
// onCatch вызывается один раз для каждой по-настоящему пойманной мухи -
// когда анимация смерти уже доиграла.
export function useFlies(onCatch: (result: CatchResult) => void) {
  const [flies, setFlies] = useState<FlyInstance[]>([]);
  const frameRef = useRef<number>();
  const lastTickRef = useRef<number>(performance.now());

  // Спавн новых мух через равные промежутки времени
  useEffect(() => {
    const spawnTimer = setInterval(() => {
      const kind: FlyKind = Math.random() < GOLDEN_CHANCE ? "golden" : "normal";
      setFlies((prev) => [...prev, spawnFly(kind)]);
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(spawnTimer);
  }, []);

  // Игровой цикл: двигает всех летающих мух на каждом кадре
  useEffect(() => {
    function tick(now: number) {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      setFlies((prev) =>
        prev
          .map((fly) => {
            if (fly.phase !== "flying") return fly;
            return { ...fly, x: fly.x + fly.dx * dt, y: fly.y + fly.dy * dt };
          })
          // муха, которая улетела далеко за пределы экрана и ни разу не была поймана, исчезает
          .filter(
            (fly) =>
              fly.phase !== "flying" ||
              (fly.x > -15 && fly.x < 115 && fly.y > -15 && fly.y < 115)
          )
      );

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Обработка хлопка по конкретной мухе
  const hitFly = useCallback(
    (id: string) => {
      setFlies((prev) =>
        prev.map((fly) => {
          if (fly.id !== id || fly.phase !== "flying") return fly;

          const hitsLanded = fly.hitsLanded + 1;
          playHitSound(fly.kind === "golden" ? 1.4 : 1);

          // золотой мухе нужно несколько хлопков - раньше срока она просто продолжает лететь
          if (hitsLanded < fly.hitsRequired) {
            return { ...fly, hitsLanded };
          }

          const deathFrameIndex = pickRandomDeathFrame(fly.kind);

          // даём кадру смерти подержаться на экране, потом убираем муху и засчитываем поимку
          setTimeout(() => {
            setFlies((current) => current.filter((f) => f.id !== id));
            onCatch({ kind: fly.kind, entrySide: fly.entrySide, caughtAt: Date.now() });
          }, DEATH_ANIMATION_MS);

          return { ...fly, hitsLanded, phase: "dying", deathFrameIndex };
        })
      );
    },
    [onCatch]
  );

  return { flies, hitFly };
}

import { useState, type MouseEvent, type PointerEvent } from "react";
import type { FlyInstance } from "../../types/fly";
import { FLY_ASSETS } from "../../game/flyAssets";
import { FlyArt, FlySparks, FlySplat } from "../FlyArt/FlyArt";
import "./Fly.css";

interface FlyProps {
  fly: FlyInstance;
  onHit: (id: string) => void;
  onGrab: (id: string, event: PointerEvent<HTMLButtonElement>) => void;
  aspect: number; // ширина поля / высота поля
}

// Адреса картинок, которые не загрузились. Запоминаем их, чтобы каждая новая муха
// не запрашивала отсутствующий файл заново.
const brokenImages = new Set<string>();

export function Fly({ fly, onHit, onGrab, aspect }: FlyProps) {
  const assets = FLY_ASSETS[fly.kind];
  const isDying = fly.phase === "dying";
  const isSparking = fly.phase === "sparking";

  // Какая картинка нужна сейчас: в полёте - гифка мухи, после гибели обычной - кадр смерти,
  // у золотой мухи после гибели - гифка искр. Пустая строка значит "картинки нет, рисуем в коде".
  let imageSrc = assets.flyingSrc;
  if (isDying) imageSrc = assets.deathFrames[fly.deathFrameIndex];
  if (isSparking) imageSrc = assets.sparksSrc ?? "";
  const imageFilter = isDying || isSparking ? undefined : assets.flyingFilter;

  // Битая картинка - вместо неё рисуем муху прямо в коде.
  // failedSrc нужен только для перерисовки после ошибки загрузки.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage =
    imageSrc !== "" && !brokenImages.has(imageSrc) && imageSrc !== failedSrc;

  function handleImageError() {
    brokenImages.add(imageSrc);
    setFailedSrc(imageSrc);
  }

  // Летящая нарисованная муха смотрит туда, куда летит. Скорость задана в % поля, а поле не квадратное,
  // поэтому умножаем dx на пропорции поля - тогда угол совпадает с направлением на экране.
  // Картинки в полёте не поворачиваем: персонаж в гифке нарисован анфас.
  const flightAngle = (Math.atan2(fly.dy, fly.dx * aspect) * 180) / Math.PI;
  let rotation = 0;
  if (isDying) rotation = fly.spin; // убитая обычная муха крутится, как падающая
  else if (!isSparking && !showImage) rotation = flightAngle;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Клик по мухе (даже уже мёртвой) не должен считаться промахом по полю
    event.stopPropagation();
    if (fly.phase === "flying") onHit(fly.id);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    // Хватать можно только падающую обычную муху
    if (isDying) onGrab(fly.id, event);
  }

  const classes = [
    "fly",
    `fly--${fly.kind}`,
    isDying ? "fly--dying" : "",
    isSparking ? "fly--sparking" : "",
    fly.held ? "fly--held" : "",
  ].join(" ");

  let content;
  if (showImage) {
    content = (
      <img
        className="fly__image"
        src={imageSrc}
        alt=""
        draggable={false}
        style={{ filter: imageFilter }}
        onError={handleImageError}
      />
    );
  } else if (isDying) {
    content = <FlySplat kind={fly.kind} />;
  } else if (isSparking) {
    content = <FlySparks kind={fly.kind} />;
  } else {
    content = <FlyArt kind={fly.kind} />;
  }

  return (
    <div className={classes} style={{ left: `${fly.x}%`, top: `${fly.y}%` }}>
      <button
        type="button"
        className="fly__button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        aria-label={fly.kind === "golden" ? "Золотая муха" : "Муха"}
      >
        <span className="fly__body">
          <span className="fly__turn" style={{ transform: `rotate(${rotation}deg)` }}>
            {content}
          </span>
        </span>
      </button>

      {fly.kind === "golden" && fly.phase === "flying" && (
        <span className="fly__hits">
          {fly.hitsLanded}/{fly.hitsRequired}
        </span>
      )}
    </div>
  );
}

import type { FlyKind } from "../../types/fly";
import "./FlyArt.css";

interface FlyArtProps {
  kind: FlyKind;
  className?: string;
}

// Муха, нарисованная в коде. Нужна, пока в public/flies нет своих картинок.
// Смотрит вправо (голова справа), поэтому поворот по направлению полёта работает правильно.
export function FlyArt({ kind, className = "" }: FlyArtProps) {
  return (
    <svg className={`fly-art fly-art--${kind} ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(-25 27 20)">
        <ellipse className="fly-art__wing" cx="27" cy="20" rx="12" ry="8" />
      </g>
      <g transform="rotate(25 27 44)">
        <ellipse className="fly-art__wing fly-art__wing--back" cx="27" cy="44" rx="12" ry="8" />
      </g>
      <ellipse className="fly-art__abdomen" cx="21" cy="32" rx="10" ry="6.5" />
      <circle className="fly-art__thorax" cx="33" cy="32" r="7" />
      <circle className="fly-art__head" cx="42" cy="32" r="5" />
      <circle className="fly-art__eye" cx="44" cy="29.5" r="2" />
      <circle className="fly-art__eye" cx="44" cy="34.5" r="2" />
    </svg>
  );
}

// Лучи искр: 8 штрихов от центра наружу
const SPARK_RAYS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    x1: 32 + Math.cos(angle) * 12,
    y1: 32 + Math.sin(angle) * 12,
    x2: 32 + Math.cos(angle) * 28,
    y2: 32 + Math.sin(angle) * 28,
  };
});

// Искры золотой мухи, нарисованные в коде. Нужны, пока нет своей гифки public/flies/sparks.gif.
// Проигрываются один раз и гаснут; длительность задаётся в CSS (fly-sparks__ray).
export function FlySparks({ kind, className = "" }: FlyArtProps) {
  return (
    <svg className={`fly-art fly-art--${kind} fly-sparks ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      {SPARK_RAYS.map((ray, i) => (
        <line
          key={i}
          className="fly-sparks__ray"
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          style={{ animationDelay: `${(i % 4) * 0.04}s` }}
        />
      ))}
    </svg>
  );
}

// Лужица от раздавленной мухи - показывается вместо живой мухи после попадания
export function FlySplat({ kind, className = "" }: FlyArtProps) {
  return (
    <svg className={`fly-art fly-art--${kind} fly-art--splat ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <path
        className="fly-art__splat"
        d="M32 6C40 6 44 12 50 13C56 14 58 20 56 26C62 30 60 38 55 40C58 46 54 54 46 52C42 58 34 60 30 55C24 60 14 58 14 50C8 50 5 42 9 37C4 32 6 24 12 22C12 15 18 11 22 13C24 8 28 6 32 6Z"
      />
      <circle className="fly-art__splat" cx="54" cy="56" r="2.5" />
      <circle className="fly-art__splat" cx="9" cy="56" r="2" />
    </svg>
  );
}

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Fly } from "../../components/Fly/Fly";
import { loadBestScore, saveBestScore } from "../../game/bestScore";
import { preloadSounds } from "../../game/sound";
import { useFlyRound } from "../../game/useFlyRound";
import type { RoundStats } from "../../types/game";
import "./Game.css";

interface GameProps {
  onExit: () => void;
}

interface StatProps {
  label: string;
  value: string | number;
  hint?: string;
  big?: boolean; // крупное число, для очков
}

interface RoundResultsProps {
  stats: RoundStats;
  onRestart: () => void;
  onExit: () => void;
}

function Stat({ label, value, hint, big = false }: StatProps) {
  return (
    <div className={`hud__stat ${big ? "hud__stat--score" : ""}`}>
      <span className="hud__label">{label}</span>
      <span className="hud__value">{value}</span>
      {hint && <span className="hud__hint">{hint}</span>}
    </div>
  );
}

// Точность: удачные хлопки от всех кликов
function formatAccuracy(stats: RoundStats): string {
  const shots = stats.hits + stats.misses;
  return shots > 0 ? `${Math.round((stats.hits / shots) * 100)}%` : "—";
}

// Итоги раунда. Компонент появляется в конце каждого раунда, поэтому
// рекорд сверяем с сохранённым значением именно здесь.
function RoundResults({ stats, onRestart, onExit }: RoundResultsProps) {
  const [previousBest] = useState(loadBestScore);
  const record = Math.max(previousBest, stats.score);

  useEffect(() => {
    saveBestScore(stats.score);
  }, [stats.score]);

  return (
    <div className="game__overlay">
      <div className="results ink-box" role="dialog" aria-label="Итоги раунда">
        <h2 className="results__title">
          <span className="marker">Раунд окончен!</span>
        </h2>
        <p className="results__score">{stats.score.toLocaleString("ru-RU")}</p>
        <p className="results__label">очков</p>
        <p className="results__record marker">Рекорд: {record.toLocaleString("ru-RU")}</p>

        <dl className="results__grid">
          <div>
            <dt>Поймано</dt>
            <dd>{stats.caught}</dd>
          </div>
          <div>
            <dt>Золотых</dt>
            <dd>{stats.golden}</dd>
          </div>
          <div>
            <dt>Точность</dt>
            <dd>{formatAccuracy(stats)}</dd>
          </div>
          <div>
            <dt>Промахов</dt>
            <dd>{stats.misses}</dd>
          </div>
        </dl>

        <div className="results__actions">
          <button className="btn btn--primary btn--large" type="button" onClick={onRestart}>
            Играть снова
          </button>
          <button className="btn" type="button" onClick={onExit}>
            В меню
          </button>
        </div>
      </div>
    </div>
  );
}

// Координаты курсора в % от поля
function fieldPercent(field: HTMLDivElement, event: { clientX: number; clientY: number }) {
  const rect = field.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  };
}

export function Game({ onExit }: GameProps) {
  const { state, hitFly, grabFly, moveFly, releaseFly, registerMiss, stopRound, restart } =
    useFlyRound();
  const { phase, countdownLeftMs, flies, popups, stats } = state;
  const fieldRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState(1);
  // Идёт ли сейчас перетаскивание мёртвой мухи
  const grabbingRef = useRef(false);
  // Когда закончилось последнее перетаскивание: клик, который браузер шлёт после отпускания,
  // не должен считаться промахом
  const lastGrabEndRef = useRef(0);

  // Звуки грузим заранее, пока идёт отсчёт; повторный вызов ничего не делает
  useEffect(() => {
    void preloadSounds();
  }, []);

  // Следим за размером поля: от пропорций зависит поворот нарисованных мух
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const updateAspect = () => setAspect(field.clientWidth / Math.max(field.clientHeight, 1));
    updateAspect();
    const observer = new ResizeObserver(updateAspect);
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  const countdownNumber = Math.ceil(countdownLeftMs / 1000);

  // Клик по пустому месту поля - промах. Клики по мухам сюда не доходят (см. Fly).
  function handleFieldClick(event: MouseEvent<HTMLDivElement>) {
    if (performance.now() - lastGrabEndRef.current < 150) return;
    const { x, y } = fieldPercent(event.currentTarget, event);
    registerMiss(x, y);
  }

  // Нажали на убитую муху - начинаем её держать. Поле захватываем целиком,
  // чтобы муха не терялась, если курсор уехал за пределы спрайта.
  function handleFlyGrab(id: string, event: PointerEvent<HTMLButtonElement>) {
    const field = fieldRef.current;
    if (!field) return;
    const { x, y } = fieldPercent(field, event);
    grabbingRef.current = true;
    grabFly(id, x, y);
    field.setPointerCapture(event.pointerId);
  }

  function handleFieldPointerMove(event: PointerEvent<HTMLDivElement>) {
    const field = fieldRef.current;
    if (!grabbingRef.current || !field) return;
    const { x, y } = fieldPercent(field, event);
    moveFly(x, y);
  }

  function handleFieldPointerUp() {
    if (!grabbingRef.current) return;
    grabbingRef.current = false;
    lastGrabEndRef.current = performance.now();
    releaseFly();
  }

  return (
    <div className="game">
      <header className="hud">
        <button className="btn btn--ghost" type="button" onClick={onExit}>
          ← Меню
        </button>
        <div className="hud__stats">
          <Stat label="Очки" value={stats.score.toLocaleString("ru-RU")} big />
          <Stat label="Поймано" value={stats.caught} hint={`золотых: ${stats.golden}`} />
          <Stat label="Точность" value={formatAccuracy(stats)} />
        </div>
        {phase === "playing" && (
          <button className="btn" type="button" onClick={stopRound}>
            Стоп
          </button>
        )}
      </header>

      <div className="game__stage">
        <div
          ref={fieldRef}
          className="game__field"
          onClick={handleFieldClick}
          onPointerMove={handleFieldPointerMove}
          onPointerUp={handleFieldPointerUp}
          onPointerCancel={handleFieldPointerUp}
        >
          {flies.map((fly) => (
            <Fly key={fly.id} fly={fly} onHit={hitFly} onGrab={handleFlyGrab} aspect={aspect} />
          ))}
          {popups.map((popup) => (
            <span
              key={popup.id}
              className={`popup popup--${popup.tone}`}
              style={{ left: `${popup.x}%`, top: `${popup.y}%` }}
            >
              {popup.text}
            </span>
          ))}
        </div>

        {phase === "countdown" && (
          <div className="game__overlay game__overlay--passive">
            {/* key пересоздаёт элемент каждую секунду, и анимация проигрывается заново */}
            <span key={countdownNumber} className="countdown">
              {countdownNumber}
            </span>
            <p className="countdown__hint">Приготовьтесь!</p>
          </div>
        )}

        {phase === "finished" && (
          <RoundResults stats={stats} onRestart={restart} onExit={onExit} />
        )}
      </div>
    </div>
  );
}
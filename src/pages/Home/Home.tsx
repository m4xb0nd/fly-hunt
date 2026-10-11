import { useEffect, useState } from "react";
import type { FlyCatch } from "../../types/flyCatch";
import { getCatchesMock } from "../../mocks/catches";
import { Header } from "../../components/Header/Header";
import { CatchList } from "../../components/CatchList/CatchList";
import { FLY_ASSETS } from "../../game/flyAssets";
import { loadBestScore } from "../../game/bestScore";
import "./Home.css";

interface HomeProps {
  onStartGame: () => void;
}

interface StatCardProps {
  value: string | number;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card ink-box">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

export function Home({ onStartGame }: HomeProps) {
  // useState хранит данные, которые придут из mock-источника
  const [catches, setCatches] = useState<FlyCatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Рекорд очков берём из браузера (см. game/bestScore.ts)
  const [bestScore] = useState(loadBestScore);

  // useEffect запускает получение данных один раз при открытии страницы
  useEffect(() => {
    getCatchesMock().then((data) => {
      setCatches(data);
      setIsLoading(false);
    });
  }, []);

  const totalCaught = catches.length;
  const bestReaction =
    catches.length > 0 ? Math.min(...catches.map((c) => c.avgReactionMs)) : null;

  return (
    <div className="home">
      <Header onStartGame={onStartGame} />

      <main className="menu">
        <section className="menu__hero">
          <img className="menu__fly" src={FLY_ASSETS.normal.flyingSrc} alt="" />
          <h1 className="menu__title">Охота на мух</h1>
          <p className="menu__lead">
            Мухи вылетают с краёв стола. Обычная муха гибнет с одного удара и приносит
            10 очков. Золотая требует три удара и приносит 50. Убитую муху можно схватить
            и переложить, это на счёт не влияет.
          </p>
          <button className="btn btn--primary btn--large" type="button" onClick={onStartGame}>
            Начать игру
          </button>
        </section>

        <section className="menu__stats" aria-label="Статистика">
          <StatCard value={totalCaught} label="мух в истории" />
          <StatCard value={bestReaction !== null ? `${bestReaction} мс` : "—"} label="лучшая реакция" />
          <StatCard value={bestScore} label="рекорд очков" />
        </section>

        <section className="menu__history">
          <h2>Последние пойманные мухи</h2>
          {isLoading ? (
            <p className="menu__loading">Загрузка...</p>
          ) : (
            <CatchList catches={catches} />
          )}
        </section>
      </main>
    </div>
  );
}

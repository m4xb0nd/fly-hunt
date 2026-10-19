import { Link } from "react-router-dom";
import "../Page.css";

// Страница истории пойманных мух. Пока заглушка: список показан на главной странице.
export function Catches() {
  return (
    <main className="page">
      <h1 className="page__title">История</h1>
      <p className="page__text">
        Здесь появится полный список пойманных мух. Пока последние поимки показаны на главной.
      </p>
      <div className="page__actions">
        <Link className="btn btn--primary" to="/game">
          Сыграть
        </Link>
      </div>
    </main>
  );
}

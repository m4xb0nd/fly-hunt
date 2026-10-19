import { Link } from "react-router-dom";
import "../Page.css";

// Ответ на адрес, которого нет в приложении (маршрут "*")
export function NotFound() {
  return (
    <main className="page">
      <h1 className="page__title">Страница не найдена</h1>
      <p className="page__text">Такого адреса в приложении нет. Возможно, ссылка устарела.</p>
      <div className="page__actions">
        <Link className="btn btn--primary" to="/">
          На главную
        </Link>
      </div>
    </main>
  );
}

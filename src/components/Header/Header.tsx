import { Link, NavLink } from "react-router-dom";
import { FLY_ASSETS } from "../../game/flyAssets";
import "./Header.css";

// Подсвечивает текущий раздел: класс меняется, когда адрес совпадает со ссылкой
function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav__link nav__link--active" : "nav__link";
}

// Общая шапка всех страниц: название, меню разделов. Выводится один раз в Layout.
export function Header() {
  return (
    <header className="header">
      <Link className="header__brand" to="/">
        <img className="header__icon" src={FLY_ASSETS.normal.flyingSrc} alt="" />
        <span>Охота на мух</span>
      </Link>

      <nav className="header__nav" aria-label="Основное меню">
        {/* end нужен у главной: иначе "/" считалась бы активной на любой странице */}
        <NavLink to="/" end className={navClass}>
          Главная
        </NavLink>
        <NavLink to="/game" className={navClass}>
          Игра
        </NavLink>
        <NavLink to="/catches" className={navClass}>
          История
        </NavLink>
      </nav>
    </header>
  );
}

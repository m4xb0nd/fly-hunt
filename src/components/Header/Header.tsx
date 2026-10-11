import { FLY_ASSETS } from "../../game/flyAssets";
import "./Header.css";

interface HeaderProps {
  onStartGame: () => void;
}

// Шапка главной страницы: только название приложения и кнопка игры
export function Header({ onStartGame }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <img className="header__icon" src={FLY_ASSETS.normal.flyingSrc} alt="" />
        <span>Охота на мух</span>
      </div>

      <button className="btn btn--primary" type="button" onClick={onStartGame}>
        Играть
      </button>
    </header>
  );
}

import { Outlet } from "react-router-dom";
import { Header } from "../Header/Header";

// Общий макет: шапка с меню остаётся на месте, а содержимое страницы меняется через Outlet
export function Layout() {
  return (
    <div className="layout">
      <Header />
      <Outlet />
    </div>
  );
}

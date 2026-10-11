import { useState } from "react";
import { Home } from "./pages/Home/Home";
import { Game } from "./pages/Game/Game";

type View = "home" | "game";

// Переключение между страницами через useState - временное решение.
// Когда в одной из следующих лабораторных подключим React Router,
// это заменится на нормальные маршруты /, /game и т.д.
function App() {
  const [view, setView] = useState<View>("home");

  if (view === "game") {
    return <Game onExit={() => setView("home")} />;
  }

  return <Home onStartGame={() => setView("game")} />;
}

export default App;

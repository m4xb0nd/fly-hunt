import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { Game } from "./pages/Game/Game";
import { Catches } from "./pages/Catches/Catches";
import { NotFound } from "./pages/NotFound/NotFound";

// Маршруты приложения. Layout - общий макет с шапкой и меню,
// выбранная страница выводится внутри него через Outlet.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/catches" element={<Catches />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

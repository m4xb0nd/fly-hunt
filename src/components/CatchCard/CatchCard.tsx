import type { FlyCatch } from "../../types/flyCatch";
import type { EntrySide } from "../../types/fly";
import "./CatchCard.css";

interface CatchCardProps {
  catchItem: FlyCatch;
}

const ENTRY_TEXT: Record<EntrySide, string> = {
  top: "сверху",
  bottom: "снизу",
  left: "слева",
  right: "справа",
};

export function CatchCard({ catchItem }: CatchCardProps) {
  const { name, notes, avgReactionMs, hitsCount, difficulty, isGolden, entrySide, dateCaught } =
    catchItem;

  return (
    <article className={`catch-card ink-box ${isGolden ? "catch-card--golden" : ""}`}>
      <header className="catch-card__header">
        <h3 className="catch-card__name">{name}</h3>
        {isGolden && <span className="catch-card__badge">золотая</span>}
      </header>

      <p className="catch-card__notes">{notes}</p>

      <dl className="catch-card__stats">
        <div>
          <dt>Реакция</dt>
          <dd>{avgReactionMs} мс</dd>
        </div>
        <div>
          <dt>Ударов</dt>
          <dd>{hitsCount}</dd>
        </div>
        <div>
          <dt>Сложность</dt>
          <dd>{difficulty}</dd>
        </div>
      </dl>

      <footer className="catch-card__footer">
        <span className="catch-card__status">вылетела {ENTRY_TEXT[entrySide]}</span>
        <span className="catch-card__date">{dateCaught}</span>
      </footer>
    </article>
  );
}

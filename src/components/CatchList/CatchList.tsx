import type { FlyCatch } from "../../types/flyCatch";
import { CatchCard } from "../CatchCard/CatchCard";
import "./CatchList.css";

interface CatchListProps {
  catches: FlyCatch[];
}

export function CatchList({ catches }: CatchListProps) {
  if (catches.length === 0) {
    return <p className="catch-list__empty">Пока ни одной пойманной мухи</p>;
  }

  return (
    <div className="catch-list">
      {catches.map((item) => (
        <CatchCard key={item.id} catchItem={item} />
      ))}
    </div>
  );
}

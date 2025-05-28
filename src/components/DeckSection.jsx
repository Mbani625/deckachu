import React, { useState } from "react";
import DeckCard from "./DeckCard";

const DeckSection = ({ title, cards, onAdd, onRemove }) => {
  const [open, setOpen] = useState(true);

  // Calculate total count of cards in this section
  const total = cards.reduce((sum, { count }) => sum + count, 0);

  return (
    <div className="mb-4">
      <div
        className="flex justify-between items-center cursor-pointer mb-2 bg-gray-900 p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-lg font-semibold">
          {title} <span className="text-sm text-gray-400">({total})</span>
        </h3>
        <span className="text-sm text-blue-400">
          {open ? "Hide ▲" : "Show ▼"}
        </span>
      </div>

      {open &&
        (cards.length === 0 ? (
          <p className="text-sm text-gray-500 pl-2">
            No {title.toLowerCase()} cards.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cards.map(({ card, count }) => (
              <DeckCard
                key={card.id}
                card={card}
                count={count}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            ))}
          </div>
        ))}
    </div>
  );
};

export default DeckSection;

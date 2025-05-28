import React, { useState } from "react";
import CardExpandInfo from "./CardExpandInfo";

const Card = ({ card, onAdd, setSearchTerm }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-gray-800 p-2 rounded shadow text-center">
      <div className="cursor-pointer" onClick={() => setExpanded(true)}>
        <img
          src={card.images.small}
          alt={card.name}
          className="mx-auto mb-2 rounded"
        />
      </div>

      <h3 className="text-sm font-semibold">{card.name}</h3>
      <button
        onClick={() => onAdd(card)}
        className="mt-2 text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Add to Deck
      </button>

      {expanded && (
        <CardExpandInfo
          card={card}
          onClose={() => setExpanded(false)}
          setSearchTerm={setSearchTerm}
        />
      )}
    </div>
  );
};

export default Card;

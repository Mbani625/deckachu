import React, { useState } from "react";
import CardExpandInfo from "./CardExpandInfo";

const DeckCard = ({ card, count, onAdd, onRemove, setSearchTerm }) => {
  const [expanded, setExpanded] = useState(false);
  const [pulseClass, setPulseClass] = useState("");

  const handleAdd = () => {
    onAdd(card);
    setPulseClass("pulse-green");
    setTimeout(() => setPulseClass(""), 400);
  };

  const handleRemove = () => {
    onRemove(card.id);
    setPulseClass("pulse-red");
    setTimeout(() => setPulseClass(""), 400);
  };

  return (
    <div
      className={`relative w-[165px] h-[330px] bg-gray-800 p-3 rounded shadow text-center flex flex-col items-center justify-between transition-all duration-300 ${pulseClass} opacity-0 animate-fade-in`}
    >
      <div className="cursor-pointer" onClick={() => setExpanded(true)}>
        <img
          src={card.images.small}
          alt={card.name}
          className="w-full h-auto rounded mb-2"
        />
      </div>

      <h3 className="text-sm font-semibold leading-tight text-white text-center mb-1 line-clamp-2">
        {card.name}
      </h3>
      <p className="text-sm text-gray-300 mb-3">x{count}</p>

      <div className="flex gap-2">
        <button
          onClick={handleRemove}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded"
        >
          -1
        </button>
        <button
          onClick={handleAdd}
          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded"
          disabled={count >= 4}
        >
          +1
        </button>
      </div>

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

export default DeckCard;

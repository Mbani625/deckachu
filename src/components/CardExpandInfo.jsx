import React from "react";
import { createPortal } from "react-dom";

const CardExpandInfo = ({
  card,
  onClose,
  setSearchTerm,
  searchCards,
  filters,
}) => {
  const handleEvolveSearch = (type) => {
    let nameToSearch = null;

    if (type === "evolvesFrom" && card.evolvesFrom) {
      nameToSearch = card.evolvesFrom;
    }

    if (type === "evolvesTo" && card.evolvesTo && card.evolvesTo.length > 0) {
      nameToSearch = card.evolvesTo[0]; // Optionally: map over all
    }

    if (!nameToSearch) return;

    setSearchTerm(nameToSearch);
    searchCards(nameToSearch, filters); // trigger the actual search
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-xl w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
        >
          ✖
        </button>
        {card.images?.large && (
          <img
            src={card.images.large}
            alt={card.name}
            className="w-full h-auto rounded-lg mb-4"
          />
        )}

        <h2 className="text-xl font-bold mb-4">{card.name}</h2>
        <p className="text-sm text-gray-400">Set: {card.set.name}</p>
        <p className="text-sm text-gray-400">Type: {card.supertype}</p>
        {card.subtypes?.length > 0 && (
          <p className="text-sm text-gray-500">
            Subtype: {card.subtypes.join(", ")}
          </p>
        )}
        {card.rarity && (
          <p className="text-sm text-yellow-300 mt-1">Rarity: {card.rarity}</p>
        )}
        <div className="mt-4 flex gap-2">
          {card.evolvesFrom && (
            <button
              onClick={() => handleEvolveSearch("evolvesFrom")}
              className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded"
            >
              Evolves From: {card.evolvesFrom}
            </button>
          )}
          {card.evolvesTo && card.evolvesTo.length > 0 && (
            <button
              onClick={() => handleEvolveSearch("evolvesTo")}
              className="text-xs bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded"
            >
              Show Evolves To: {card.evolvesTo.join(", ")}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CardExpandInfo;

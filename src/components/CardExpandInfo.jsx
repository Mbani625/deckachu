import React from "react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 overflow-y-auto">
      <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 w-[350px] md:w-[450px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
        >
          ✕
        </button>
        <img
          src={card.images.large || card.images.small}
          alt={card.name}
          className="w-full h-auto rounded mb-3"
        />
        <h2 className="text-lg font-bold text-white">{card.name}</h2>
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
    </div>
  );
};

export default CardExpandInfo;

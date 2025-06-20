import React from "react";

export default function DeckImageSelectModal({ deck, onSelect, onClose }) {
  const cards = Object.values(deck).map((entry) => entry.card || entry);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Choose Deck Image</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-[70vh] overflow-y-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() =>
                onSelect({
                  id: card.id,
                  name: card.name,
                  image: card.images?.small,
                })
              }
            >
              <img
                src={card.images?.small}
                alt={card.name}
                className="w-full rounded"
              />
              <p className="text-sm text-white text-center mt-1">{card.name}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

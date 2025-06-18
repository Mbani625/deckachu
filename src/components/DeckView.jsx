import React, { useState } from "react";
import DeckSection from "./DeckSection";
import CardExpandInfo from "./CardExpandInfo";

const DeckView = ({
  deck,
  onAdd,
  onRemove,
  setSearchTerm,
  searchCards,
  filters,
  showOptionsMenu,
  setShowOptionsMenu,
  dropUp,
  toggleDeckView,
  setShowTextImport,
  handleExportDeck,
  saveDeck,
  saveDeckAs,
  listSavedDecks,
  loadDeckByName,
  setCurrentDeckName,
  setDeck,
  optionsButtonRef,
  deckExpanded,
}) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const deckArray = Object.values(deck);
  const totalCount = deckArray.reduce((sum, { count }) => sum + count, 0);

  const categorizeDeck = () => {
    const pokemon = [];
    const trainer = [];
    const energy = [];

    deckArray.forEach(({ card, count }) => {
      const supertype = card.supertype || "";
      const entry = { card, count };

      if (supertype === "Pokémon") pokemon.push(entry);
      else if (supertype === "Trainer") trainer.push(entry);
      else if (supertype === "Energy") energy.push(entry);
    });

    return { pokemon, trainer, energy };
  };

  const { pokemon, trainer, energy } = categorizeDeck();

  const handleExpand = (card) => setExpandedCard(card);
  const handleClose = () => setExpandedCard(null);

  return (
    <div className="relative">
      <div className="flex justify-between items-center px-4 pt-2 pb-1">
        <div>
          <h2 className="text-xl font-bold">Your Deck</h2>
          <p className="text-sm text-gray-400">
            Total Cards:{" "}
            <span className="text-white font-semibold">{totalCount}</span> / 60
          </p>
        </div>

        <div className="relative inline-block text-right z-50">
          <button
            ref={optionsButtonRef}
            onClick={() => setShowOptionsMenu((prev) => !prev)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded"
          >
            ⚙ Deck Options
          </button>

          {showOptionsMenu && (
            <div
              className={`absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 ${
                dropUp ? "bottom-full mb-2" : "top-full mt-2"
              }`}
            >
              <button
                onClick={() => {
                  toggleDeckView();
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                {deckExpanded ? "Collapse Deck" : "Expand Deck"}
              </button>

              <button
                onClick={() => {
                  document.getElementById("deck-file-input").click();
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                Import from File
              </button>
              <button
                onClick={() => {
                  setShowTextImport(true);
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                Import Text
              </button>
              <button
                onClick={() => {
                  handleExportDeck();
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                Export Deck
              </button>
              <button
                onClick={() => {
                  saveDeck();
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={() => {
                  saveDeckAs();
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                Save As
              </button>
              <button
                onClick={() => {
                  const savedNames = listSavedDecks();
                  const name = prompt(
                    `Enter name to load from:\n${savedNames.join("\n")}`
                  );
                  if (name) {
                    loadDeckByName(name);
                    setCurrentDeckName(name);
                  }
                  setShowOptionsMenu(false);
                }}
                className="block w-full px-4 py-2 hover:bg-gray-800"
              >
                Load
              </button>
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  if (
                    window.confirm(
                      "Are you sure you want to clear your entire deck?"
                    )
                  ) {
                    setDeck({});
                    localStorage.removeItem("deckachu_mainDeck");
                  }
                }}
                className="block w-full px-4 py-2 text-red-400 hover:bg-gray-800"
              >
                Clear Deck
              </button>
            </div>
          )}
        </div>
      </div>

      <DeckSection
        title="Pokémon"
        cards={pokemon}
        onAdd={onAdd}
        onRemove={onRemove}
        setSearchTerm={setSearchTerm}
        onExpand={handleExpand}
      />
      <DeckSection
        title="Trainer"
        cards={trainer}
        onAdd={onAdd}
        onRemove={onRemove}
        setSearchTerm={setSearchTerm}
        onExpand={handleExpand}
      />
      <DeckSection
        title="Energy"
        cards={energy}
        onAdd={onAdd}
        onRemove={onRemove}
        setSearchTerm={setSearchTerm}
        onExpand={handleExpand}
      />

      {expandedCard && (
        <CardExpandInfo
          card={expandedCard}
          onClose={handleClose}
          setSearchTerm={setSearchTerm}
          searchCards={searchCards}
          filters={filters}
        />
      )}
    </div>
  );
};

export default DeckView;

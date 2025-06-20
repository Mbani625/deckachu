import React, { useState } from "react";
import DeckSection from "./DeckSection";
import CardExpandInfo from "./CardExpandInfo";
import LoadDeckModal from "./LoadDeckModal";
import DeckNotesModal from "./DeckNotesModal";
import DeckImageSelectionModal from "./DeckImageSelectionModal";

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
  currentDeckName,
  deckNotes,
  setDeckNotes,
  setSelectedDeckImage,
}) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const deckArray = Object.values(deck);
  const totalCount = deckArray.reduce((sum, { count }) => sum + count, 0);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDeckImageModal, setShowDeckImageModal] = useState(false);

  const categorizeDeck = () => {
    const categorized = {
      Pokémon: [],
      Trainer: [],
      Energy: [],
    };

    deckArray.forEach((entry) => {
      const card = entry.card || entry;
      if (!card || typeof card !== "object") return;

      const supertype = card.supertype || "";

      if (supertype === "Pokémon") {
        categorized.Pokémon.push({ ...entry, card });
      } else if (supertype === "Trainer") {
        categorized.Trainer.push({ ...entry, card });
      } else if (supertype === "Energy") {
        categorized.Energy.push({ ...entry, card });
      } else {
        // Unknown or missing supertype — fallback if needed
        console.warn("Card missing supertype:", card.name || "[unknown]");
      }
    });

    return {
      pokemon: categorized.Pokémon,
      trainer: categorized.Trainer,
      energy: categorized.Energy,
    };
  };

  const { pokemon, trainer, energy } = categorizeDeck();

  const handleExpand = (card) => setExpandedCard(card);
  const handleClose = () => setExpandedCard(null);

  return (
    <div className="relative px-4">
      <div className="flex justify-between items-center pt-2 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
              <h2 className="text-xl font-bold">
                {currentDeckName || "Your Deck"}
              </h2>
              <p className="text-sm text-gray-400">
                Total Cards:{" "}
                <span className="text-white font-semibold">{totalCount}</span> /
                60
              </p>
            </div>
            {/* Notes button */}
            <div className="flex flex-col sm:flex-row sm:items-center mx-4 gap-2 sm:gap-2">
              <button
                onClick={() => setShowNotesModal(true)}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              >
                Primer
              </button>
              <button
                onClick={() => setShowDeckImageModal(true)}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              >
                Deck Image
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex-row text-right z-50">
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
                  setShowOptionsMenu(false);
                  if (
                    window.confirm(
                      `Are you sure you want to save the changes to "${
                        currentDeckName || "this deck"
                      }"?`
                    )
                  ) {
                    saveDeck();
                  }
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
                  setShowLoadModal(true);
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
      <div
        className={`overflow-y-auto pr-2 ${
          deckExpanded ? "max-h-[80vh]" : "max-h-[40vh]"
        }`}
      >
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
      {showLoadModal && (
        <LoadDeckModal
          onSelect={async (deckName) => {
            await loadDeckByName(deckName);
            setCurrentDeckName(deckName);
          }}
          onClose={() => setShowLoadModal(false)}
        />
      )}
      {showNotesModal && (
        <DeckNotesModal
          initialNotes={deckNotes}
          onSave={(newNotes) => {
            setDeckNotes(newNotes); // from props, passed from App.js
          }}
          onClose={() => setShowNotesModal(false)}
        />
      )}
      {showDeckImageModal && (
        <DeckImageSelectionModal
          deck={deck}
          onSelect={(imageData) => {
            setSelectedDeckImage(imageData);
            setShowDeckImageModal(false);
          }}
          onClose={() => setShowDeckImageModal(false)}
        />
      )}
    </div>
  );
};

export default DeckView;

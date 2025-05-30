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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6  gap-4 p-4 h-auto">
        <h2 className="text-xl font-bold">Your Deck</h2>
        <p className="text-sm text-gray-400">
          Total Cards:{" "}
          <span className="text-white font-semibold">{totalCount}</span> / 60
        </p>
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

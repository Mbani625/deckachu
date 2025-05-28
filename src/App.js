// src/App.js
import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import CardGrid from "./components/CardGrid";
import DeckView from "./components/DeckView";
import useDebouncedSearch from "./hooks/useDebouncedSearch";
import { canAddCardToDeck } from "./utils/deckRules";
import useCardSearch from "./hooks/useCardSearch";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deck, setDeck] = useState({});
  const [format, setFormat] = useState("standard");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subtypeFilter, setSubtypeFilter] = useState("");
  const [pokemonTypeFilter, setPokemonTypeFilter] = useState("");
  const debouncedSearch = useDebouncedSearch(searchTerm);
  const { results, searchCards } = useCardSearch();

  useEffect(() => {
    if (debouncedSearch.length < 2) return;

    let query = `name:"${debouncedSearch}" AND legalities.${format}:legal`;

    if (typeFilter !== "all") {
      query += ` AND supertype:"${typeFilter}"`;
    }

    if (subtypeFilter) {
      query += ` AND subtypes:"${subtypeFilter}"`;
    }

    if (pokemonTypeFilter && typeFilter === "Pokémon") {
      query += ` AND types:"${pokemonTypeFilter}"`;
    }

    searchCards(query);
  }, [
    debouncedSearch,
    format,
    typeFilter,
    subtypeFilter,
    pokemonTypeFilter,
    searchCards,
  ]);

  const handleAddToDeck = (card) => {
    if (!canAddCardToDeck(deck, card)) return;

    setDeck((prev) => {
      const existing = prev[card.id];
      return {
        ...prev,
        [card.id]: {
          card,
          count: existing ? existing.count + 1 : 1,
        },
      };
    });
  };

  const handleRemoveFromDeck = (cardId) => {
    setDeck((prev) => {
      const currentEntry = prev[cardId];
      if (!currentEntry) return prev;

      const newDeck = { ...prev };

      if (currentEntry.count > 1) {
        newDeck[cardId] = {
          ...currentEntry,
          count: currentEntry.count - 1,
        };
      } else {
        delete newDeck[cardId];
      }

      return newDeck;
    });
  };

  // App.js layout wrap
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Scrollable main content */}
      <div className="flex-grow overflow-y-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Deckachu - Pokémon Deckbuilder
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Format */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
            >
              <option value="standard">Standard</option>
              <option value="expanded">Expanded</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
            >
              <option value="all">All</option>
              <option value="Pokémon">Pokémon</option>
              <option value="Trainer">Trainer</option>
              <option value="Energy">Energy</option>
            </select>
          </div>

          {/* Subtype */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Subtype
            </label>
            <select
              value={subtypeFilter}
              onChange={(e) => setSubtypeFilter(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
            >
              <option value="">All</option>
              <option value="BREAK">BREAK</option>
              <option value="Baby">Baby</option>
              <option value="Basic">Basic</option>
              <option value="EX">EX / ex</option>
              <option value="GX">GX</option>
              <option value="Goldenrod Game Corner">
                Goldenrod Game Corner
              </option>
              <option value="Item">Item</option>
              <option value="LEGEND">LEGEND</option>
              <option value="Level-Up">Level-Up</option>
              <option value="MEGA">MEGA</option>
              <option value="Pokémon Tool">Pokémon Tool</option>
              <option value="Pokémon Tool F">Pokémon Tool F</option>
              <option value="Rapid Strike">Rapid Strike</option>
              <option value="Restored">Restored</option>
              <option value="Rocket's Secret Machine">
                Rocket's Secret Machine
              </option>
              <option value="Single Strike">Single Strike</option>
              <option value="Special">Special</option>
              <option value="Stadium">Stadium</option>
              <option value="Stage 1">Stage 1</option>
              <option value="Stage 2">Stage 2</option>
              <option value="Supporter">Supporter</option>
              <option value="TAG TEAM">TAG TEAM</option>
              <option value="Technical Machine">Technical Machine</option>
              <option value="V">V</option>
              <option value="VMAX">VMAX</option>
            </select>
          </div>

          {/* Pokémon Type */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1 text-gray-300">
              Pokémon Type
            </label>
            <select
              value={pokemonTypeFilter}
              onChange={(e) => setPokemonTypeFilter(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
            >
              <option value="">All</option>
              <option value="Colorless">Colorless</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Grass">Grass</option>
              <option value="Lightning">Lightning</option>
              <option value="Psychic">Psychic</option>
              <option value="Fighting">Fighting</option>
              <option value="Darkness">Darkness</option>
              <option value="Metal">Metal</option>
              <option value="Dragon">Dragon</option>
              <option value="Fairy">Fairy</option>
            </select>
          </div>
        </div>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <CardGrid
          cards={results}
          onAdd={handleAddToDeck}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Fixed deck view at bottom */}
      <div className="h-[50vh] bg-gray-950 border-t border-gray-800 overflow-y-auto p-3">
        <DeckView
          deck={deck}
          onAdd={handleAddToDeck}
          onRemove={handleRemoveFromDeck}
          setSearchTerm={setSearchTerm}
        />
      </div>
    </div>
  );
}

export default App;

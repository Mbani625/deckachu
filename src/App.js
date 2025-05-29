// src/App.js
import React, { useState, useMemo } from "react";
import SearchBar from "./components/SearchBar";
import CardGrid from "./components/CardGrid";
import DeckView from "./components/DeckView";
import { canAddCardToDeck } from "./utils/deckRules";
import useCardSearch from "./hooks/useCardSearch";
import FilterDropdown from "./components/FilterDropdown";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deck, setDeck] = useState({});
  const [format, setFormat] = useState("standard");
  const [typeFilter, setTypeFilter] = useState("");
  const [subtypeFilter, setSubtypeFilter] = useState("");
  const [pokemonTypeFilter, setPokemonTypeFilter] = useState("");
  const [sortOption, setSortOption] = useState("");
  const { results, searchCards, loadMore, page, allResults } = useCardSearch();

  const handleSearch = () => {
    let queryParts = [];

    if (format === "standard") {
      queryParts.push(
        `(regulationMark:"F" OR regulationMark:"G" OR regulationMark:"H" OR regulationMark:"I")`
      );
    } else if (format && format !== "all") {
      queryParts.push(`legalities.${format}:legal`);
    }

    if (typeFilter && typeFilter !== "") {
      queryParts.push(`supertype:"${typeFilter}"`);
    }

    if (subtypeFilter) {
      queryParts.push(`subtypes:"${subtypeFilter}"`);
    }

    if (pokemonTypeFilter && typeFilter === "Pokémon") {
      queryParts.push(`types:"${pokemonTypeFilter}"`);
    }

    const query = queryParts.join(" AND ");
    if (query.length > 0) {
      searchCards(
        searchTerm,
        {
          format,
          cardType: typeFilter,
          subType: subtypeFilter,
          pokemonType: pokemonTypeFilter,
          sort: sortOption,
        },
        1,
        false
      );
    }
  };

  const sortedResults = useMemo(() => {
    let sorted = [...allResults];
    switch (sortOption) {
      case "A-Z":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Z-A":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Pokémon Type":
        sorted.sort((a, b) =>
          (a.types?.[0] || "").localeCompare(b.types?.[0] || "")
        );
        break;
      default:
        break;
    }
    return sorted.slice(0, page * 20);
  }, [allResults, sortOption, page]);

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
    <div className="flex flex-col h-screen bg-gray-900 text-white ">
      {/* Scrollable main content */}
      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="sticky top-0 z-20 bg-gray-900 p-3 shadow-md">
          <h1 className="text-3xl font-bold mb-3 text-white text-center">
            Deckachu – Pokémon Deckbuilder
          </h1>
          <div className="flex items-center gap-2">
            {/* Vertically aligned search section */}
            <div className="flex items-center gap-2 h-12">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearchSubmit={handleSearch}
              />
              <button
                onClick={handleSearch}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
              >
                Search
              </button>
            </div>
            <div className="w-px h-8 bg-gray-700 mx-2"></div> {/* divider */}
            {/* Uniform-width filter dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                label="Format"
                value={format}
                onChange={setFormat}
                options={["standard", "expanded", "unlimited"]}
                className="w-[180px]"
              />

              <FilterDropdown
                label="Card Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={["Pokémon", "Trainer", "Energy"]}
                className="w-[180px]"
              />

              <FilterDropdown
                label="Subtype"
                value={subtypeFilter}
                onChange={setSubtypeFilter}
                options={[
                  "Stage 1",
                  "Stage 2",
                  "Basic",
                  "EX",
                  "V",
                  "VSTAR",
                  "V-UNION",
                  "BREAK",
                  "Item",
                  "Supporter",
                  "Stadium",
                  "ACE SPEC",
                  "Pokémon Tool",
                  "Special Energy",
                  "Technical Machine",
                  "Ancient",
                  "Fossil",
                ]}
                className="w-[180px]"
              />

              <FilterDropdown
                label="Pokémon Type"
                value={pokemonTypeFilter}
                onChange={setPokemonTypeFilter}
                options={[
                  "Colorless",
                  "Darkness",
                  "Dragon",
                  "Fairy",
                  "Fighting",
                  "Fire",
                  "Grass",
                  "Lightning",
                  "Metal",
                  "Psychic",
                  "Water",
                ]}
                className="w-[180px]"
              />
              <FilterDropdown
                label="Sort By"
                value={sortOption}
                onChange={setSortOption}
                options={["A-Z", "Z-A", "Pokémon Type"]}
                className="w-[180px]"
              />
            </div>
          </div>
        </div>

        <CardGrid
          cards={sortedResults}
          onAdd={handleAddToDeck}
          setSearchTerm={setSearchTerm}
        />

        {results.length > 0 && (
          <div className="text-center mb-[40vh]">
            <button
              onClick={loadMore}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Fixed deck view at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[40vh] bg-gray-950 border-t border-gray-800 overflow-y-auto z-10 p-3">
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

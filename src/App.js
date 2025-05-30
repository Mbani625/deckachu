// src/App.js
import React, { useState, useEffect, useRef, useMemo } from "react";

import SearchBar from "./components/SearchBar";
import CardGrid from "./components/CardGrid";
import DeckView from "./components/DeckView";
import { canAddCardToDeck } from "./utils/deckRules";
import useCardSearch from "./hooks/useCardSearch";
import FilterDropdown from "./components/FilterDropdown";
import { formatDeckForExport } from "./utils/formatDeckForExport";
import { importDeckFromTxt } from "./utils/importDeckFromTxt";

function App() {
  const [deck, setDeck] = useState(() => {
    const saved = localStorage.getItem("deckachu_deck");
    return saved ? JSON.parse(saved) : [];
  });
  const [isDeckExpanded, setIsDeckExpanded] = useState(false);
  const toggleDeckView = () => {
    setIsDeckExpanded((prev) => !prev);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [format, setFormat] = useState("standard");
  const [typeFilter, setTypeFilter] = useState("");
  const [subtypeFilter, setSubtypeFilter] = useState("");
  const [pokemonTypeFilter, setPokemonTypeFilter] = useState("");
  const [sortOption, setSortOption] = useState("");
  const { results, searchCards, loadMore, page, allResults } = useCardSearch();
  const [hasSearched, setHasSearched] = useState(false);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTop = useRef(0);
  const scrollDirection = useRef("down");
  const scrollUpDistance = useRef(0);
  const SCROLL_UP_THRESHOLD = 100;

  const activeFilters = useMemo(
    () => ({
      format,
      cardType: typeFilter,
      subType: subtypeFilter,
      pokemonType: pokemonTypeFilter,
      sort: sortOption,
    }),
    [format, typeFilter, subtypeFilter, pokemonTypeFilter, sortOption]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const prevScroll = lastScrollTop.current;
      const delta = scrollTop - prevScroll;

      // Scrolling down
      if (delta > 0) {
        if (scrollDirection.current !== "down") {
          scrollDirection.current = "down";
          scrollUpDistance.current = 0;
        }
        if (hasSearched) {
          setShowHeader(false);
        }
      }

      // Scrolling up
      else if (delta < 0) {
        if (scrollDirection.current !== "up") {
          scrollDirection.current = "up";
          scrollUpDistance.current = 50;
        }

        scrollUpDistance.current += Math.abs(delta);

        if (scrollUpDistance.current > SCROLL_UP_THRESHOLD) {
          setShowHeader(true);
        }
      }

      setShowBackToTop(scrollTop > 30);
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const handleExportDeck = async () => {
    const deckArray = Object.values(deck);
    const formatted = await formatDeckForExport(deckArray); // ✅ await it!

    const blob = new Blob([formatted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deck.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDeck = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importDeckFromTxt(file, setDeck);
  };

  const handleSearch = () => {
    let queryParts = [];

    if (format === "standard") {
      queryParts.push(
        `( regulationMark:"G" OR regulationMark:"H" OR regulationMark:"I" OR regulationMark:"J")`
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
    setHasSearched(true);
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

  useEffect(() => {
    localStorage.setItem("deckachu_deck", JSON.stringify(deck));
  }, [deck]);

  const handleAddToDeck = (card) => {
    if (!canAddCardToDeck(deck, card)) return;

    console.log("ADDING CARD TO DECK:", card);

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
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Scrollable main content */}
      <div className="p-4 pt-[200px]">
        <div
          className={`transition-transform duration-300 ease-in-out fixed top-0 left-0 right-0 z-20 bg-gray-900 shadow-md ${
            showHeader ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="p-3">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-white text-center">
              Deckachu
            </h1>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
              {/* Vertically aligned search section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center  gap-2 w-full">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onSearchSubmit={handleSearch}
                />
                <button
                  onClick={handleSearch}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded"
                >
                  Search
                </button>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-700 mx-2"></div>{" "}
              {/* vertical on sm+ */}
              <div className="block sm:hidden h-px w-full bg-gray-700 my-2"></div>{" "}
              {/* horizontal on mobile */}
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
                  label="Sort By"
                  value={sortOption}
                  onChange={setSortOption}
                  options={["A-Z", "Z-A", "Pokémon Type"]}
                  className="w-[180px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto md:mt-[0px] mt-[100px] p-4 pt-0">
          <CardGrid
            cards={sortedResults}
            onAdd={handleAddToDeck}
            setSearchTerm={setSearchTerm}
            onSearchSubmit={handleSearch}
            loadMore={loadMore}
            hasMore={page < 10}
            searchCards={searchCards}
            filters={activeFilters}
          />
        </div>

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
      <div
        className={`fixed left-0 right-0 p-4 bg-gray-950 border-t border-gray-800 transition-all duration-300 overflow-y-auto ${
          isDeckExpanded
            ? "top-0 bottom-0 z-[9999]" // Full-screen overlay
            : "bottom-0 z-[30] h-[25vh] sm:h-[40vh] md:h-[40vh]"
        }`}
      >
        <div className="flex justify-evenly items-center">
          <button
            className="flex top-2 z-20 px-3 py-1 justify-center rounded w-[90px] bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to clear your entire deck?"
                )
              ) {
                setDeck({});
                localStorage.removeItem("deckachu_mainDeck");
              }
            }}
          >
            Clear
          </button>

          <button
            onClick={handleExportDeck}
            className="flex top-2 px-3 py-1 rounded justify-center w-[90px] bg-green-600 hover:bg-green-700 text-white"
          >
            Export
          </button>

          <input
            type="file"
            accept=".txt"
            onChange={handleImportDeck}
            className="text-white text-sm my-2"
          />

          <button
            onClick={toggleDeckView}
            className="flex top-2 z-20 px-3 py-1 rounded justify-center w-[90px] bg-blue-600 text-white hover:bg-blue-700"
          >
            {isDeckExpanded ? "Compress" : "Expand"}
          </button>
        </div>

        <DeckView
          deck={deck}
          onAdd={handleAddToDeck}
          onRemove={handleRemoveFromDeck}
          setSearchTerm={setSearchTerm}
          searchCards={searchCards}
          filters={activeFilters}
        />
      </div>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-5 z-30 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-md text-lg opacity-70 hover:opacity-100 transition"
          title="Back to Top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default App;

// src/App.js
import React, { useState, useEffect, useMemo } from "react";
import SearchBar from "./components/SearchBar";
import CardGrid from "./components/CardGrid";
import DeckView from "./components/DeckView";
import { canAddCardToDeck } from "./utils/deckRules";
import useCardSearch from "./hooks/useCardSearch";
import { formatDeckForExport } from "./utils/formatDeckForExport";
import { importDeckFromTxt } from "./utils/importDeckFromTxt";
import DeckTextImportModal from "./components/DeckTextImportModal";
import { fetchAndCacheSets } from "./utils/setCache";
import { login, logout, onAuthChange } from "./auth";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import FilterBar from "./components/FilterBar";
import ProfilePage from "./components/ProfilePage";
import {
  saveDeckToFirebase,
  loadDeckFromFirebase,
  listUserDecks,
} from "./components/Deckmanager";

function App() {
  const [user, setUser] = useState(null);

  const [deck, setDeck] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("deckachu_deck"));
      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {};
    } catch {
      return {};
    }
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
  const { results, searchCards, loadMore, page, allResults, isLoading } =
    useCardSearch();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showTextImport, setShowTextImport] = useState(false);
  const [rawDeckText, setRawDeckText] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [dropUp, setDropUp] = useState(false);
  const optionsButtonRef = React.useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showProfile, setShowProfile] = useState(false);
  const [deckNotes, setDeckNotes] = useState("");
  const [selectedDeckImage, setSelectedDeckImage] = useState(null);

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

  const handleImportFromText = () => {
    importDeckFromTxt(rawDeckText, setDeck, true);
    setRawDeckText("");
    setShowTextImport(false);
  };

  const handleImportDeck = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importDeckFromTxt(file, setDeck, false); // `false` = not raw text
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

  const [currentDeckName, setCurrentDeckName] = useState(null);

  const listSavedDecks = async () => {
    if (!user) return [];
    const decks = await listUserDecks(user.uid);
    return decks.map((d) => d.name || d.id);
  };

  const handleExportDeck = async () => {
    try {
      const text = await formatDeckForExport(deck); // ✅ Full deck object
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "deck.txt";
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Deck export failed. Check console for details.");
    }
  };

  const saveDeck = () => {
    if (!user) {
      alert("You must be logged in to save a deck.");
      return;
    }
    if (!currentDeckName) {
      return saveDeckAs();
    }
    saveDeckToFirebase(user.uid, currentDeckName, {
      cards: deck,
      notes: deckNotes,
      deckImage: selectedDeckImage,
    });
  };

  const saveDeckAs = () => {
    if (!user) {
      alert("You must be logged in to save a deck.");
      return;
    }
    const newName = prompt("Enter a new name for this deck:");
    if (newName) {
      saveDeckToFirebase(user.uid, currentDeckName, {
        cards: deck,
        notes: deckNotes,
        deckImage: selectedDeckImage,
      });

      setCurrentDeckName(newName);
    }
  };

  const loadDeckByName = async (name) => {
    if (!user) {
      alert("Log in to load a deck.");
      return;
    }
    const deckData = await loadDeckFromFirebase(user.uid, name);
    if (deckData && deckData.cards) {
      setDeck(deckData.cards);
      setDeckNotes(deckData.notes || "");
      setCurrentDeckName(name);
    } else {
      alert("Failed to load deck or no cards found.");
    }
  };

  const handleAddToDeck = (card) => {
    setDeck((prevDeck) => {
      const existing = prevDeck[card.id];
      const currentCount = existing ? existing.count : 0;

      const isBasic =
        card.supertype === "Energy" && card.subtypes?.includes("Basic");

      if (!isBasic && !canAddCardToDeck(card, currentCount)) return prevDeck;

      return {
        ...prevDeck,
        [card.id]: {
          card,
          count: currentCount + 1,
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

  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchAndCacheSets(); // just load it and cache
  }, []);

  useEffect(() => {
    localStorage.setItem("deckachu_deck", JSON.stringify(deck));
  }, [deck]);

  useEffect(() => {
    if (showOptionsMenu && optionsButtonRef.current) {
      const buttonRect = optionsButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const dropdownHeight = 300; // estimate height of menu in px
      setDropUp(spaceBelow < dropdownHeight); // true = pop up
    }
  }, [showOptionsMenu]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleGoHome = () => setShowProfile(false);
    window.addEventListener("goHome", handleGoHome);
    return () => {
      window.removeEventListener("goHome", handleGoHome);
    };
  }, []);

  useEffect(() => {
    const handleGoHome = () => {
      const saved = JSON.parse(localStorage.getItem("deckachu_deck"));
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        setDeck(saved.cards || {});
        setCurrentDeckName(saved.name || null);
      }
      setShowProfile(false); // Close profile page
    };

    window.addEventListener("goHome", handleGoHome);
    return () => window.removeEventListener("goHome", handleGoHome);
  }, []);

  useEffect(() => {
    const handleShowProfile = () => setShowProfile(true);
    window.addEventListener("showProfile", handleShowProfile);

    return () => {
      window.removeEventListener("showProfile", handleShowProfile);
    };
  }, []);
  if (showProfile && user) {
    return <ProfilePage user={user} onBackHome={() => setShowProfile(false)} />;
  }

  // App.js layout wrap
  return (
    <div className="bg-gray-900 text-white min-h-screen px-4 ">
      {/* Scrollable main content */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <div>
        <div className="fixed top-0 left-0 right-0 z-20 bg-gray-900 shadow-md">
          <div className="p-3">
            <Header
              user={user}
              login={login}
              logout={logout}
              onShowLogin={() => setShowLogin(true)}
            />

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
              {/* Search section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                <div className="flex w-full items-stretch gap-2">
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
                  {/* ⬇️ Collapse/Expand Toggle Here */}
                  <button
                    onClick={() => setShowFilters((prev) => !prev)}
                    className="sm:hidden bg-gray-700 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-600"
                  >
                    {showFilters ? "▲ Collapse Filters" : "▼ Expand Filters"}
                  </button>
                </div>
              </div>
              {/* horizontal divider */}
              <div className="block h-px w-full bg-gray-700 my-2"></div>{" "}
              {/* Uniform-width filter dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <FilterBar
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  windowWidth={windowWidth}
                  format={format}
                  setFormat={setFormat}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  pokemonTypeFilter={pokemonTypeFilter}
                  setPokemonTypeFilter={setPokemonTypeFilter}
                  subtypeFilter={subtypeFilter}
                  setSubtypeFilter={setSubtypeFilter}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-visible p-4 pt-[175px] md:pt-[210px] relative z-10">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-4 mb-4"></div>
              <p className="text-white text-sm">Searching cards...</p>
            </div>
          ) : (
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
          )}
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
        className={`fixed left-0 right-0 p-4 bg-gray-950 border-t border-gray-800 transition-all duration-300 overflow-visible ${
          isDeckExpanded
            ? "top-0 bottom-0 z-[9999]" // Full-screen overlay
            : "bottom-0 z-[30] h-[10vh] sm:h-[20vh] md:h-[20vh]"
        }`}
      >
        {/* BUTTON GROUP */}
        <div className="w-full flex flex-col md:flex-row justify-evenly items-center gap-2 relative">
          {/* Hidden file input */}
          <input
            type="file"
            accept=".txt"
            id="deck-file-input"
            className="hidden"
            onChange={handleImportDeck}
          />
        </div>
        <DeckView
          deck={deck}
          onAdd={handleAddToDeck}
          onRemove={handleRemoveFromDeck}
          setSearchTerm={setSearchTerm}
          searchCards={searchCards}
          filters={activeFilters}
          showOptionsMenu={showOptionsMenu}
          setShowOptionsMenu={setShowOptionsMenu}
          dropUp={dropUp}
          toggleDeckView={toggleDeckView}
          setShowTextImport={setShowTextImport}
          handleExportDeck={handleExportDeck}
          saveDeck={saveDeck}
          saveDeckAs={saveDeckAs}
          loadDeckByName={loadDeckByName}
          listSavedDecks={listSavedDecks}
          setCurrentDeckName={setCurrentDeckName}
          setDeck={setDeck}
          optionsButtonRef={optionsButtonRef}
          deckExpanded={isDeckExpanded}
          currentDeckName={currentDeckName}
          deckNotes={deckNotes}
          setDeckNotes={setDeckNotes}
          setSelectedDeckImage={setSelectedDeckImage}
        />
      </div>

      {/* DECK TEXT MODAL */}
      {showTextImport && (
        <DeckTextImportModal
          onClose={() => setShowTextImport(false)}
          text={rawDeckText}
          setText={setRawDeckText}
          onImport={handleImportFromText}
        />
      )}
    </div>
  );
}

export default App;

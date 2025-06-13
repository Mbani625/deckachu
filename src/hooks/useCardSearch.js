import { useState, useRef } from "react";
import { fetchAndCacheSets, getCachedSet } from "../utils/setCache"; // adjust path as needed

const cardSearchCache = {};

const useCardSearch = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const lastSearchParams = useRef({ query: "", filters: {} });

  const searchCards = async (query = "", filters = {}) => {
    const searchTerm = query.trim().toLowerCase();
    const q = [];

    const lowerQuery = query.toLowerCase();
    const isBasicEnergySearch =
      (lowerQuery.includes("basic energy") ||
        (lowerQuery.includes("basic") && lowerQuery.includes("energy")) ||
        lowerQuery.includes("basic")) &&
      (filters.cardType === "Energy" || filters.cardType === "All");

    // Base filter: only by format/cardType/subtype/type
    if (filters.format === "standard" && !isBasicEnergySearch) {
      q.push(
        '(regulationMark:"G" OR regulationMark:"H" OR regulationMark:"I" OR regulationMark:"J")'
      );
    }

    if (filters.cardType && filters.cardType !== "") {
      q.push(`supertype:${filters.cardType}`);
    }

    if (filters.subType) {
      q.push(`subtypes:${filters.subType}`);
    }

    if (filters.pokemonType) {
      q.push(`types:${filters.pokemonType}`);
    }

    const fullQuery = q.join(" ");
    const cacheKey = JSON.stringify({ filters });

    setIsLoading(true);
    setError(null);
    setPage(1);
    lastSearchParams.current = { query, filters };

    try {
      let rawCards = [];

      if (cardSearchCache[cacheKey]) {
        rawCards = cardSearchCache[cacheKey];
      } else {
        let page = 1;
        let more = true;

        while (more) {
          const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
            fullQuery
          )}&page=${page}&pageSize=250`;
          const res = await fetch(url);
          const data = await res.json();
          const batch = data?.data || [];

          rawCards.push(...batch);

          more = batch.length === 250;
          page++;
        }

        cardSearchCache[cacheKey] = rawCards;
      }

      await fetchAndCacheSets();

      const mappedCards = await Promise.all(
        rawCards.map(async (card) => {
          const ptcgoCode = getCachedSet(card.set?.id) || "?";

          return {
            id: card.id,
            name: card.name,
            supertype: card.supertype,
            subtypes: card.subtypes,
            types: card.types,
            images: card.images,
            evolvesFrom: card.evolvesFrom || null,
            evolvesTo: card.evolvesTo || [],
            number: card.number || "",
            rules: card.rules || [],
            abilities: card.abilities || [],
            attacks: card.attacks || [],
            set: {
              id: card.set?.id || "",
              ptcgoCode,
              name: card.set?.name || "",
              series: card.set?.series || "",
            },
          };
        })
      );

      // ✅ Apply search term matching on all fields here
      const filteredCards = filterCardsBySearchTerm(mappedCards, searchTerm);
      applySortAndPaginate(filteredCards, filters, 1);
    } catch (err) {
      console.error(err);
      setError("Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterCardsBySearchTerm = (cards, searchTerm) => {
    if (!searchTerm) return cards;

    return cards.filter((card) => {
      const textMatch = [
        ...(card.rules || []),
        ...(card.attacks || []).map((a) => a.text || ""),
        ...(card.abilities || []).map((a) => a.text || ""),
      ].some((text) => text.toLowerCase().includes(searchTerm));

      const nameMatch = card.name.toLowerCase().includes(searchTerm);

      return nameMatch || textMatch;
    });
  };

  const applySortAndPaginate = (cards, filters, pageNum) => {
    let sorted = [...cards];

    if (filters.sort) {
      switch (filters.sort) {
        case "name-asc":
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "type-asc":
          sorted.sort((a, b) =>
            (a.types?.[0] || "").localeCompare(b.types?.[0] || "")
          );
          break;
        default:
          break;
      }
    }

    setAllResults(sorted);
    const startIndex = (pageNum - 1) * 20;
    const endIndex = startIndex + 20;
    setResults(sorted.slice(startIndex, endIndex));
  };

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * 20;
    const endIndex = startIndex + 20;
    const nextBatch = allResults.slice(startIndex, endIndex);
    setResults((prev) => [...prev, ...nextBatch]);
    setPage(nextPage);
  };

  const resetSearch = () => {
    setPage(1);
    setResults([]);
    setAllResults([]);
  };

  return {
    results,
    error,
    isLoading,
    searchCards,
    loadMore,
    resetSearch,
    page,
    allResults,
  };
};

export default useCardSearch;

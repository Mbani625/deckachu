import { useState, useRef } from "react";

const cardSearchCache = {};

const useCardSearch = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const lastSearchParams = useRef({ query: "", filters: {} });

  const searchCards = async (query = "", filters = {}) => {
    const q = [];

    if (query.trim()) {
      const quotedQuery = query.includes(" ")
        ? `"${query.trim()}"`
        : query.trim();
      q.push(`name:${quotedQuery}`);
    }

    const lowerQuery = query.toLowerCase();
    const isBasicEnergySearch =
      (lowerQuery.includes("basic energy") ||
        (lowerQuery.includes("basic") && lowerQuery.includes("energy")) ||
        lowerQuery.includes("basic")) &&
      (filters.cardType === "Energy" || filters.cardType === "All");

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

    if (q.length === 0) {
      setResults([]);
      setAllResults([]);
      return;
    }

    const fullQuery = q.join(" ");
    const cacheKey = `${fullQuery}`;

    setIsLoading(true);
    setError(null);
    setPage(1);
    lastSearchParams.current = { query, filters };

    if (cardSearchCache[cacheKey]) {
      applySortAndPaginate(cardSearchCache[cacheKey], filters, 1);
      return;
    }

    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(fullQuery)}`
      );
      const data = await res.json();
      const allData = data?.data || [];

      const fetchSetPtgcoCode = async (setId) => {
        try {
          const setRes = await fetch(
            `https://api.pokemontcg.io/v2/sets/${setId}`
          );
          const setData = await setRes.json();
          return setData?.data?.ptcgoCode || "?";
        } catch {
          return "?";
        }
      };

      const mappedCards = await Promise.all(
        allData.map(async (card) => {
          let ptcgoCode = card.set?.ptcgoCode || "?";

          if (ptcgoCode === "?" && card.set?.id) {
            ptcgoCode = await fetchSetPtgcoCode(card.set.id);
          }

          return {
            id: card.id,
            name: card.name,
            supertype: card.supertype,
            subtypes: card.subtypes,
            types: card.types,
            images: card.images,
            number: card.number || "",
            set: {
              id: card.set?.id || "",
              ptcgoCode,
              name: card.set?.name || "",
              series: card.set?.series || "",
            },
          };
        })
      );

      cardSearchCache[cacheKey] = mappedCards;
      applySortAndPaginate(mappedCards, filters, 1);
    } catch (err) {
      console.error(err);
      setError("Search failed.");
    } finally {
      setIsLoading(false);
    }
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

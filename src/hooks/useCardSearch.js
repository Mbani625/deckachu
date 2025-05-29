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

    if (query && query.trim().length > 0) {
      const trimmedQuery = query.trim();
      const quotedQuery = trimmedQuery.includes(" ")
        ? `"${trimmedQuery}"`
        : trimmedQuery;
      q.push(`name:${quotedQuery}`);
    }

    if (filters.format === "standard") {
      q.push(
        '(regulationMark:"G" OR regulationMark:"H" OR regulationMark:"I" OR regulationMark:"J" )'
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
      const cached = cardSearchCache[cacheKey];
      applySortAndPaginate(cached, filters, 1);
      return;
    }

    try {
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
          fullQuery
        )}&pageSize=250`
      );
      const data = await res.json();
      const allData = Array.isArray(data.data) ? data.data : [];

      if (allData.length > 200) {
        alert(
          "Too many results! Please apply additional filters to narrow your search."
        );
        setResults([]);
        setAllResults([]);
        setIsLoading(false);
        return;
      }

      cardSearchCache[cacheKey] = allData;
      applySortAndPaginate(allData, filters, 1);
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

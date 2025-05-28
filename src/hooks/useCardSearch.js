import { useState, useCallback } from "react";

const cardSearchCache = {};

const useCardSearch = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const searchCards = useCallback(async (query) => {
    if (!query || query.length < 2) return;

    if (cardSearchCache[query]) {
      setResults(cardSearchCache[query]);
      return;
    }

    try {
      setError(null);
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
          query
        )}&pageSize=20`
      );
      const data = await res.json();
      cardSearchCache[query] = data.data;
      setResults(data.data);
    } catch (err) {
      setError("Search failed.");
    }
  }, []);

  return { results, error, searchCards };
};

export default useCardSearch;

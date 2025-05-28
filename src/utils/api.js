const BASE_URL = "https://api.pokemontcg.io/v2/cards";

export const fetchCardsByName = async (name, format = "standard") => {
  const legalFilter = `legalities.${format}:legal`;
  const query = `name:"${name}" AND ${legalFilter}`;
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&pageSize=20`;

  const res = await fetch(url);
  const data = await res.json();
  return data.data;
};

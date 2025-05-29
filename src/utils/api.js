const BASE_URL = "https://api.pokemontcg.io/v2/cards";

export const fetchCardsByName = async (name) => {
  const query = `name:"${name}"`;
  const url = `${BASE_URL}?q=${encodeURIComponent(query)}&pageSize=250`; // large enough to get all printings

  const res = await fetch(url);
  const data = await res.json();
  return data.data;
};

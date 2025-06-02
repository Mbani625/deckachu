// setCache.js
let cachedSets = null;

export const fetchAndCacheSets = async () => {
  if (cachedSets) return cachedSets;

  try {
    const res = await fetch("https://api.pokemontcg.io/v2/sets");
    const data = await res.json();
    const sets = data.data;

    const ptcgoToId = {};
    const idToPtcgo = {};

    sets.forEach((set) => {
      if (set.ptcgoCode) {
        ptcgoToId[set.ptcgoCode] = set.id;
        idToPtcgo[set.id] = set.ptcgoCode;
      }
    });

    cachedSets = { ptcgoToId, idToPtcgo };
    return cachedSets;
  } catch (err) {
    console.error("Failed to fetch set data:", err);
    cachedSets = { ptcgoToId: {}, idToPtcgo: {} };
    return cachedSets;
  }
};

export const getCachedSet = (id) => {
  return cachedSets?.idToPtcgo?.[id] || null;
};

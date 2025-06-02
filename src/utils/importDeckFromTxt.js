import { fetchAndCacheSets } from "./setCache";

export const importDeckFromTxt = async (input, setDeck, isRawText = false) => {
  const text = isRawText ? input : await input.text();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const setMap = await fetchAndCacheSets();

  const ptcgoToSetIdMap = setMap.ptcgoToId;

  let currentSection = null;
  const deckEntries = [];

  for (const line of lines) {
    if (line.startsWith("Pokémon")) {
      currentSection = "Pokémon";
      continue;
    } else if (line.startsWith("Trainer")) {
      currentSection = "Trainer";
      continue;
    } else if (line.startsWith("Energy")) {
      currentSection = "Energy";
      continue;
    } else if (/^Total Cards/i.test(line)) {
      break;
    }

    const match = line.match(/^(\d+)\s+(.*?)\s+([A-Z0-9]+)\s+(\d+)$/);
    if (!match) continue;

    const [, count, name, setCode, setNumber] = match;

    deckEntries.push({
      name: name.trim(),
      count: parseInt(count, 10),
      set: setCode.trim(),
      number: setNumber.trim(),
      section: currentSection,
    });
  }

  const newDeck = {};

  for (const entry of deckEntries) {
    const setId = ptcgoToSetIdMap[entry.set];
    if (!setId) {
      console.warn(`Unknown set code: ${entry.set}`);
      continue;
    }

    const query = `set.id:${setId} number:${entry.number}`;
    try {
      let res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`
      );
      let data = await res.json();
      let card = data.data?.[0];

      if (!card) {
        const fallback = `set.id:${setId} name:"${entry.name}"`;
        res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(fallback)}`
        );
        data = await res.json();
        card = data.data?.[0];
      }

      if (!card) {
        console.warn(`Card not found: ${entry.name} (${entry.set})`);
        continue;
      }

      // Patch card to include proper info if missing
      if (
        card.supertype === "Energy" &&
        (!card.subtypes || !card.subtypes.includes("Basic")) &&
        entry.name.startsWith("Basic ")
      ) {
        card.subtypes = ["Basic"];
      }

      const existing = newDeck[card.id];
      const totalCount = (existing?.count || 0) + entry.count;

      const isBasic =
        card.supertype === "Energy" && card.subtypes?.includes("Basic");

      newDeck[card.id] = {
        card,
        count: isBasic ? totalCount : Math.min(totalCount, 4),
      };
    } catch (err) {
      console.error(`Failed to fetch card: ${entry.name}`, err);
    }
  }

  setDeck(newDeck);
};

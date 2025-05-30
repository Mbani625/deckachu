export const importDeckFromTxt = async (input, setDeck, isRawText = false) => {
  const text = isRawText ? input : await input.text();
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let ptcgoToSetIdMap = {};

  const loadSetMappings = async () => {
    if (Object.keys(ptcgoToSetIdMap).length > 0) return;

    const res = await fetch("https://api.pokemontcg.io/v2/sets");
    const data = await res.json();
    const sets = data.data || [];

    sets.forEach((set) => {
      if (set.ptcgoCode) {
        ptcgoToSetIdMap[set.ptcgoCode] = set.id;
      }
    });
  };

  await loadSetMappings();

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

  for (const entry of deckEntries) {
    const setId = ptcgoToSetIdMap[entry.set];
    if (!setId) {
      console.warn(`Unknown set code: ${entry.set}`);
      continue;
    }

    const exactQuery = `set.id:${setId} number:${entry.number}`;
    let card = null;

    try {
      let res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(exactQuery)}`
      );
      let data = await res.json();
      card = data.data?.[0];

      if (!card) {
        const nameQuery = `set.id:${setId} name:"${entry.name}"`;
        res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(
            nameQuery
          )}`
        );
        data = await res.json();
        card = data.data?.[0];
      }

      if (!card) {
        console.warn(`Card not found: ${entry.name} (${entry.set})`);
        continue;
      }

      setDeck((prev) => {
        const existing = prev[card.id];
        return {
          ...prev,
          [card.id]: {
            card,
            count: Math.min((existing?.count || 0) + entry.count, 4),
          },
        };
      });
    } catch (err) {
      console.error(`Failed to fetch card: ${entry.name}`, err);
    }
  }
};

import { fetchAndCacheSets } from "./setCache";

const ENERGY_SYMBOLS = {
  D: "Darkness",
  F: "Fighting",
  G: "Grass",
  L: "Lightning",
  M: "Metal",
  P: "Psychic",
  R: "Fire",
  W: "Water",
  Y: "Fairy",
  N: "Dragon",
  C: "Colorless",
};

export const importDeckFromTxt = async (input, setDeck, isRawText = false) => {
  const text = isRawText ? input : await input.text();
  const lines = text
    .split("\n")
    .map((line) => line.trim().replace(/\s+(PH|RH|RR|SH|SV|TG|AR|GG)$/, ""))
    .filter(Boolean);

  const setMap = await fetchAndCacheSets();
  const ptcgoToSetIdMap = setMap.ptcgoToId;

  const deckEntries = [];
  const replacedCards = [];

  for (let line of lines) {
    if (/^(Pokémon|Trainer|Energy|Total Cards)/i.test(line)) continue;

    console.log("📥 Reading line:", line);

    // Match lines like: 2 Basic {P} Energy Energy 13
    const energyRewriteMatch = line.match(
      /^(\d+)\s+Basic\s+\{([A-Z])\}\s+Energy\s+Energy\s+(\d+)$/
    );
    if (energyRewriteMatch) {
      const [, count, symbol, number] = energyRewriteMatch;

      const energyName = ENERGY_SYMBOLS[symbol]
        ? `${ENERGY_SYMBOLS[symbol]}`
        : `Unknown`;

      // Get most recent valid set code
      const allSets = Object.entries(ptcgoToSetIdMap).map(([code, id]) => ({
        code,
        id,
      }));
      const latestSet = allSets.sort((a, b) => b.code.localeCompare(a.code))[0];
      const validSetCode = latestSet.code;

      // Rewrite only the setCode from "Energy" to latest valid
      line = `${count} Basic ${energyName} Energy ${validSetCode} ${number}`;
      console.log("🛠️ Rewritten line to:", line);
    }

    const match = line.match(/^(\d+)\s+(.*?)\s+([A-Z0-9]+)\s+(\d+)$/);
    if (!match) {
      console.warn(
        "⚠️ Line did not match expected pattern and was skipped:",
        line
      );
      continue;
    }

    let [, count, name, setCode, setNumber] = match;

    name = name.replace(/\s*\(.*?\)\s*/g, "").trim();

    console.log("🔍 Parsed:", { count, name, setCode, setNumber });

    let foundCard = null;

    // ✅ Normalize Basic {X} Energy to "Psychic Energy"
    const basicEnergyMatch = name.match(/^Basic\s+\{([A-Z])\}\s+Energy$/);
    if (basicEnergyMatch) {
      const symbol = basicEnergyMatch[1];
      if (ENERGY_SYMBOLS[symbol]) {
        name = `${ENERGY_SYMBOLS[symbol]} Energy`;
        console.log(`🔄 Converted basic energy symbol {${symbol}} to: ${name}`);
      }
    }

    // ✅ Replace invalid Energy setCode with latest valid one
    if (name.includes("Energy") && setCode === "Energy") {
      const allSets = Object.entries(ptcgoToSetIdMap).map(([code, id]) => ({
        code,
        id,
      }));

      // Pick the newest set (alphabetically sorted by code for simplicity)
      const latestSet = allSets.sort((a, b) => b.code.localeCompare(a.code))[0];
      setCode = latestSet.code;
      setNumber = ""; // discard number to allow fuzzy match
      console.log(`⚡ Replaced invalid Energy setCode with: ${setCode}`);
    }

    const querySet = ptcgoToSetIdMap[setCode];

    // --- Try exact match if possible ---
    if (querySet && setNumber) {
      const url = `https://api.pokemontcg.io/v2/cards?q=name:"${name}" set.id:${querySet} number:${setNumber}`;
      try {
        console.log("🌐 Fetching exact match:", url);
        const res = await fetch(url);
        const data = await res.json();
        if (data?.data?.[0]) {
          foundCard = data.data[0];
        }
      } catch (e) {
        console.warn(
          `Exact match fetch failed for ${name} (${setCode} ${setNumber})`,
          e
        );
      }
    }

    // --- Fallback: name only, use most recent ---
    if (!foundCard) {
      try {
        console.log("🌐 Fallback fetch for name:", name);
        const res = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=name:"${name}"`
        );
        const data = await res.json();
        if (data?.data?.length > 0) {
          const sorted = data.data
            .filter((c) => c.set && c.set.releaseDate && c.set.ptcgoCode)
            .sort((a, b) => b.set.releaseDate.localeCompare(a.set.releaseDate));

          foundCard = sorted.find((card) => card.set?.ptcgoCode);

          replacedCards.push({
            original: `${name} ${setCode} ${setNumber}`,
            replacement: `${foundCard.name} (${foundCard.set.ptcgoCode} ${foundCard.number})`,
          });
        }
      } catch (e) {
        console.warn(`Fallback search failed for ${name}`, e);
      }
    }

    if (foundCard) {
      console.log(
        `✅ Found card: ${foundCard.name} (${foundCard.set.ptcgoCode} ${foundCard.number})`
      );
      for (let i = 0; i < parseInt(count); i++) {
        deckEntries.push(foundCard);
      }
    }
  }

  setDeck(buildDeckObject(deckEntries));

  if (replacedCards.length > 0) {
    const message = replacedCards
      .map((r) => `- ${r.original} → ${r.replacement}`)
      .join("\n");
    alert("Some cards were replaced with alternate versions:\n\n" + message);
  }
};

function buildDeckObject(cards) {
  const deck = {};
  cards.forEach((card) => {
    if (!deck[card.id]) {
      deck[card.id] = { card, count: 1 };
    } else {
      deck[card.id].count += 1;
    }
  });
  return deck;
}

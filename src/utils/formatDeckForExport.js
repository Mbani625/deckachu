import { fetchAndCacheSets } from "./setCache";

export async function formatDeckForExport(deck) {
  const setCache = await fetchAndCacheSets();

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

  const categorized = {
    Pokémon: [],
    Trainer: [],
    Energy: [],
  };

  for (const cardEntry of Object.values(deck)) {
    const card = cardEntry.card;
    const count = cardEntry.count;

    const supertype = card.supertype || "Trainer";
    const category =
      supertype === "Pokémon"
        ? "Pokémon"
        : supertype === "Energy"
        ? "Energy"
        : "Trainer";

    const rawSetId = card.set?.id || card.setCode || "???";
    const setCode =
      setCache.idToPtcgo?.[rawSetId] || card.set?.ptcgoCode || rawSetId;

    let line = `${count} ${card.name} ${setCode} ${card.number}`;

    // Fix Basic Energy formatting
    if (card.supertype === "Energy" && card.subtypes?.includes("Basic")) {
      const match = card.name.match(/Basic (\w+) Energy/);
      if (match) {
        const typeName = match[1];
        const symbol = Object.entries(ENERGY_SYMBOLS).find(
          ([key, value]) => value.toLowerCase() === typeName.toLowerCase()
        );
        if (symbol) {
          line = `${count} Basic {${symbol[0]}} Energy ${setCode} ${card.number}`;
        }
      }
    }

    categorized[category].push(line);
  }

  const output = [
    `Pokémon: ${categorized["Pokémon"].reduce(
      (acc, line) => acc + parseInt(line.split(" ")[0]),
      0
    )}`,
    ...categorized["Pokémon"],
    "",
    `Trainer: ${categorized["Trainer"].reduce(
      (acc, line) => acc + parseInt(line.split(" ")[0]),
      0
    )}`,
    ...categorized["Trainer"],
    "",
    `Energy: ${categorized["Energy"].reduce(
      (acc, line) => acc + parseInt(line.split(" ")[0]),
      0
    )}`,
    ...categorized["Energy"],
  ];

  return output.join("\n");
}

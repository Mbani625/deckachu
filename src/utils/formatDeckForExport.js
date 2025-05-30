export async function formatDeckForExport(deck) {
  if (!Array.isArray(deck)) return "";

  const sections = {
    Pokémon: [],
    Trainer: [],
    Energy: [],
  };

  let total = 0;

  // Cache set ID → ptcgoCode
  const setMap = {};

  const fetchSetPtgcoCode = async (setId) => {
    if (setMap[setId]) return setMap[setId];
    try {
      const res = await fetch(`https://api.pokemontcg.io/v2/sets/${setId}`);
      const data = await res.json();
      const ptcgoCode = data?.data?.ptcgoCode || setId;
      setMap[setId] = ptcgoCode;
      return ptcgoCode;
    } catch {
      return setId;
    }
  };

  for (const { card, count } of deck) {
    let ptcgoCode = card.set?.ptcgoCode || "?";

    // If it's missing or placeholder, try to fetch it
    if (ptcgoCode === "?" && card.set?.id) {
      ptcgoCode = await fetchSetPtgcoCode(card.set.id);
    }

    const line = `${count} ${card.name} ${ptcgoCode} ${card.number}`;

    if (card.supertype === "Pokémon") {
      sections.Pokémon.push(line);
    } else if (card.supertype === "Trainer") {
      sections.Trainer.push(line);
    } else if (card.supertype === "Energy") {
      sections.Energy.push(line);
    }

    total += count;
  }

  return (
    `Pokémon: ${sections.Pokémon.length}\n` +
    sections.Pokémon.join("\n") +
    `\n\nTrainer: ${sections.Trainer.length}\n` +
    sections.Trainer.join("\n") +
    `\n\nEnergy: ${sections.Energy.length}\n` +
    sections.Energy.join("\n") +
    `\n\nTotal Cards: ${total}`
  );
}

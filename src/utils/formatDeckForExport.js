export function formatDeckForExport(deck) {
  if (!Array.isArray(deck)) return "";

  const sections = {
    Pokémon: [],
    Trainer: [],
    Energy: [],
  };

  let total = 0;

  deck.forEach(({ card, count }) => {
    const line = `${count} ${card.name} ${
      card.set?.ptcgoCode || card.set?.id || "?"
    } ${card.number}`;

    if (card.supertype === "Pokémon") {
      sections.Pokémon.push(line);
    } else if (card.supertype === "Trainer") {
      sections.Trainer.push(line);
    } else if (card.supertype === "Energy") {
      sections.Energy.push(line);
    }
    total += count;
  });

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

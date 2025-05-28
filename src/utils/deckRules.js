// src/utils/deckRules.js

// List of basic energy names (can be duplicated beyond 4 copies)
const BASIC_ENERGIES = [
  "Grass Energy",
  "Fire Energy",
  "Water Energy",
  "Lightning Energy",
  "Psychic Energy",
  "Fighting Energy",
  "Darkness Energy",
  "Metal Energy",
  "Fairy Energy",
  "Dragon Energy", // in some fan sets
];

// Check if a card is a basic energy
export const isBasicEnergy = (card) => {
  return card.supertype === "Energy" && BASIC_ENERGIES.includes(card.name);
};

// Normalize names by removing parentheses and trimming spaces
const normalizeName = (name) => {
  return name
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim()
    .toLowerCase();
};

const getComparisonKey = (card) => {
  const baseName = normalizeName(card.name);
  const firstAttack = card.attacks?.[0]?.name || "";
  return `${baseName}::${firstAttack.toLowerCase()}`;
};

// Get count of all cards in the deck matching normalized name
export const getCardNameCount = (deck, cardName, referenceCard = null) => {
  const referenceKey = referenceCard
    ? getComparisonKey(referenceCard)
    : normalizeName(cardName);

  return Object.values(deck)
    .filter(({ card }) => {
      if (referenceCard && card.supertype === "Pokémon") {
        return getComparisonKey(card) === referenceKey;
      }
      return normalizeName(card.name) === referenceKey;
    })
    .reduce((sum, { count }) => sum + count, 0);
};

export const canAddCardToDeck = (deck, card) => {
  if (isBasicEnergy(card)) return true;

  const nameCount = getCardNameCount(deck, card.name, card);
  return nameCount < 4;
};

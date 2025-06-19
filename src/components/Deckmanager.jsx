// DeckManager.jsx
import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export const saveDeckToFirebase = async (uid, deckName, deckData) => {
  try {
    const deckRef = doc(db, "users", uid, "decks", deckName);
    await setDoc(deckRef, {
      name: deckName,
      createdAt: serverTimestamp(),
      cards: deckData,
    });
    alert(`Deck '${deckName}' saved to Firebase!`);
  } catch (error) {
    console.error("Error saving deck:", error);
    alert("Failed to save deck.");
  }
};

export const loadDeckFromFirebase = async (uid, deckName) => {
  try {
    const deckRef = doc(db, "users", uid, "decks", deckName);
    const deckSnap = await getDoc(deckRef);
    if (deckSnap.exists()) {
      return deckSnap.data();
    } else {
      alert("Deck not found.");
      return null;
    }
  } catch (error) {
    console.error("Error loading deck:", error);
    alert("Failed to load deck.");
    return null;
  }
};

export const listUserDecks = async (uid) => {
  try {
    const decksRef = collection(db, "users", uid, "decks");
    const snapshot = await getDocs(decksRef);
    const decks = [];
    snapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() });
    });
    return decks;
  } catch (error) {
    console.error("Error listing decks:", error);
    return [];
  }
};

export const deleteDeckFromFirebase = async (uid, deckName) => {
  try {
    const deckRef = doc(db, "users", uid, "decks", deckName);
    await deleteDoc(deckRef);
    alert(`Deck '${deckName}' deleted.`);
  } catch (error) {
    console.error("Error deleting deck:", error);
    alert("Failed to delete deck.");
  }
};

export const exportDeckAsText = (deck) => {
  return Object.entries(deck)
    .map(([cardName, count]) => `${cardName} x${count}`)
    .join("\n");
};

export const importDeckFromText = (text) => {
  const deck = {};
  const lines = text.split("\n");
  lines.forEach((line) => {
    const match = line.trim().match(/^(.+?)\s+x(\d+)$/);
    if (match) {
      const [, name, count] = match;
      deck[name.trim()] = parseInt(count);
    }
  });
  return deck;
};

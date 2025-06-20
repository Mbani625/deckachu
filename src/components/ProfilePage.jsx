import React, { useEffect, useState } from "react";
import Header from "./Header";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import {
  listUserDecks,
  loadDeckFromFirebase,
  deleteDeckFromFirebase,
} from "./Deckmanager";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [decks, setDecks] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    const fetchDecks = async () => {
      const userDecks = await listUserDecks(user.uid);
      setDecks(userDecks);
    };

    fetchUserData();
    fetchDecks();
  }, [user]);

  const handleDelete = async (deckName) => {
    if (window.confirm(`Delete deck '${deckName}'?`)) {
      await deleteDeckFromFirebase(user.uid, deckName);
      setDecks((prev) => prev.filter((deck) => deck.name !== deckName));
    }
  };

  const handleLoad = async (deckName) => {
    const deckData = await loadDeckFromFirebase(user.uid, deckName);
    if (deckData) {
      localStorage.setItem(
        "deckachu_deck",
        JSON.stringify({ name: deckName, cards: deckData.cards })
      );
      window.dispatchEvent(new CustomEvent("goHome"));
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen px-4 py-6">
      <Header user={user} onShowLogin={() => {}} />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>

        <div className="mb-6">
          <p>
            <strong>Username:</strong> {userData?.username || "Loading..."}
          </p>
          <p>
            <strong>Join Date:</strong>{" "}
            {userData?.createdAt?.toDate
              ? new Date(userData.createdAt.toDate()).toLocaleDateString()
              : "Loading..."}
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Saved Decks</h2>
          {decks.length === 0 ? (
            <p className="text-gray-400">No decks saved yet.</p>
          ) : (
            <ul className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {decks.map((deck) => (
                  <div
                    key={deck.name}
                    className="bg-gray-800 p-3 rounded-lg flex flex-col items-center shadow hover:shadow-lg transition-shadow"
                  >
                    {deck.deckImage ? (
                      <button
                        onClick={() => handleLoad(deck.name)}
                        className="mb-2"
                      >
                        <img
                          src={deck.deckImage.image}
                          alt={deck.deckImage.name}
                          className="h-40 w-auto rounded hover:scale-105 transition-transform"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLoad(deck.name)}
                        className="h-40 w-28 bg-gray-700 rounded mb-2"
                        title="Open deck"
                      />
                    )}

                    <p className="text-white text-sm font-semibold mb-1">
                      {deck.name}
                    </p>

                    <button
                      onClick={() => handleDelete(deck.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

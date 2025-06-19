// LoadDeckModal.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // adjust path if needed

const LoadDeckModal = ({ onSelect, onClose }) => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn("No user logged in");
        setDecks([]);
        setLoading(false);
        return;
      }

      const deckRef = collection(db, "users", user.uid, "decks");
      const snapshot = await getDocs(deckRef);

      const userDecks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDecks(userDecks);
      setLoading(false);
    };

    fetchDecks();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg max-w-sm w-full shadow-xl">
        <h3 className="text-white text-lg font-semibold mb-3">
          Load a Saved Deck
        </h3>

        {loading ? (
          <p className="text-gray-400">Loading decks...</p>
        ) : decks.length === 0 ? (
          <p className="text-gray-400">No decks found.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto text-white space-y-1">
            {decks.map((deck, index) => (
              <li
                key={deck.id || index}
                className="hover:bg-gray-700 px-2 py-1 cursor-pointer rounded"
                onClick={() => {
                  onSelect(deck.name);
                  onClose(); // close modal on click
                }}
              >
                {deck.name}
              </li>
            ))}
          </ul>
        )}

        <button
          className="mt-4 text-sm text-gray-300 hover:text-white"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoadDeckModal;

// src/components/DeckTextImportModal.jsx
import React from "react";

const DeckTextImportModal = ({ onClose, onImport, text, setText }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex justify-center items-center">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-[90%] max-w-xl shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-4">Paste Deck List</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
          placeholder="Paste decklist here..."
        />
        <button
          onClick={onImport}
          className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          Import
        </button>
      </div>
    </div>
  );
};

export default DeckTextImportModal;

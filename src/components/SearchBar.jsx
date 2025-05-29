// SearchBar.jsx
import React from "react";

const SearchBar = ({ searchTerm, setSearchTerm, onSearchSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="w-full sm:w-auto h-10">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search Pokémon cards..."
        className="h-10 px-4 py-2 rounded border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
};

export default SearchBar;

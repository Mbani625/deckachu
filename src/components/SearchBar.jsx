// SearchBar.jsx
import React from "react";

const SearchBar = ({ searchTerm, setSearchTerm, onSearchSubmit }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="h-10">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search Pokémon cards..."
        className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
};

export default SearchBar;

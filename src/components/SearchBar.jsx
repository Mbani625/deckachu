// SearchBar.jsx
import React from "react";

// The actual search term is debounced inside App.js, not here
const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search Pokémon cards..."
        className="w-full bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded"
      />
    </div>
  );
};

export default SearchBar;

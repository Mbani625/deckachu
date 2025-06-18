// src/components/FilterBar.jsx
import React from "react";
import FilterDropdown from "./FilterDropdown";

const FilterBar = ({
  showFilters,
  setShowFilters,
  windowWidth,
  format,
  setFormat,
  typeFilter,
  setTypeFilter,
  pokemonTypeFilter,
  setPokemonTypeFilter,
  subtypeFilter,
  setSubtypeFilter,
  sortOption,
  setSortOption,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(showFilters || windowWidth >= 640) && (
        <>
          <FilterDropdown
            label="Format"
            value={format}
            onChange={setFormat}
            options={["standard", "expanded", "unlimited"]}
          />
          <FilterDropdown
            label="Card Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={["Pokémon", "Trainer", "Energy"]}
          />
          <FilterDropdown
            label="Pokémon Type"
            value={pokemonTypeFilter}
            onChange={setPokemonTypeFilter}
            options={[
              "Colorless",
              "Darkness",
              "Dragon",
              "Fairy",
              "Fighting",
              "Fire",
              "Grass",
              "Lightning",
              "Metal",
              "Psychic",
              "Water",
            ]}
          />
          <FilterDropdown
            label="Subtype"
            value={subtypeFilter}
            onChange={setSubtypeFilter}
            options={[
              "Stage 1",
              "Stage 2",
              "Basic",
              "EX",
              "V",
              "VSTAR",
              "V-UNION",
              "BREAK",
              "Item",
              "Supporter",
              "Stadium",
              "ACE SPEC",
              "Pokémon Tool",
              "Special Energy",
              "Technical Machine",
              "Ancient",
              "Fossil",
            ]}
          />
          <FilterDropdown
            label="Sort By"
            value={sortOption}
            onChange={setSortOption}
            options={["A-Z", "Z-A", "Pokémon Type"]}
          />
        </>
      )}
    </div>
  );
};

export default FilterBar;

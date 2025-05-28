// src/components/FilterDropdown.jsx
import React from "react";

const FilterDropdown = ({ label, value, onChange, options }) => {
  return (
    <div className="flex flex-col text-sm">
      <label className="text-gray-200 mb-1">{label}</label>
      <select
        className="bg-gray-700 text-white p-1 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;

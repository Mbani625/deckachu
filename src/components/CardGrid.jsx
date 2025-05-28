// src/components/CardGrid.jsx
import React from "react";
import Card from "./Card";

const CardGrid = ({ cards, onAdd, setSearchTerm }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-4 h-auto">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onAdd={onAdd}
          setSearchTerm={setSearchTerm}
        />
      ))}
    </div>
  );
};

export default CardGrid;

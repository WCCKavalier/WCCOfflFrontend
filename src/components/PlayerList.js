import React from "react";

const PlayerList = ({ players, onSelect, selectedPlayer }) => {
  return (
    <div className="w-full md:w-1/2 overflow-y-auto max-h-[400px]">
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className={`p-3 cursor-pointer rounded-lg transition-all ${
              selectedPlayer.id === player.id
                ? "bg-blue-100 shadow-lg scale-105"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
            onClick={() => onSelect(player)}
          >
            {player.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;

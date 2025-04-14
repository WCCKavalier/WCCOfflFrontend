import React from "react";

const PlayerDetails = ({ player }) => {
  if (!player) {
    return <p className="text-gray-500">Select a player to see details.</p>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <img
        src={player.image}
        alt={player.name}
        className="w-48 h-48 object-cover mx-auto rounded-full"
      />
      <h2 className="text-2xl font-bold text-center mt-4">{player.name}</h2>
      <p className="text-center text-gray-600">{player.position}</p>
      <p className="text-center text-blue-500">{player.team}</p>
    </div>
  );
};

export default PlayerDetails;

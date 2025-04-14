import React, { useState, useEffect } from "react";
import "./PlayerSection.css"; // Assuming this file contains the relevant styles
import { MdNoMeals } from "react-icons/md";

function PlayerSection({ players }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLocked, setIsLocked] = useState(false); // Prevent hover change after click
  const [isModalActive, setIsModalActive] = useState(false); // Track modal visibility
 
  useEffect(() => {
    if (!selectedPlayer && players.length > 0) {
      setSelectedPlayer(players[0]);
    }
  }, [players, selectedPlayer]);

  // Hover changes selection only if not locked
  const handlePlayerHover = (player) => {
    if (!isLocked) {
      setSelectedPlayer(player);
    }
  };

  // Clicking locks selection and activates modal
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setIsLocked(true);
    setIsModalActive(true);  // Activate modal and background blur
    document.body.classList.add("blur"); // Add blur to background
  };

  const closeModal = () => {
    setIsModalActive(false);
    document.body.classList.remove("blur"); // Remove blur from background
  };

  return (
    <div className="player-section">
      <div className="player-container">
        {/* Player List */}
        <div className="player-list">
          {players.length > 0 ? (
            players.map((player) => (
              <div
                key={player.id}
                className={`player-item ${
                  selectedPlayer?.id === player.id ? "active" : ""
                }`}
                onMouseEnter={() => handlePlayerHover(player)}
                onClick={() => handlePlayerClick(player)}
              >
                {player.name}
              </div>
            ))
          ) : (
            <p className="no-players">No players available.</p>
          )}
        </div>

        {/* Player Details with Image */}
        <div className={`player-details ${isModalActive ? "active" : ""}`}>
          {selectedPlayer ? (
            <>
              {selectedPlayer.image && (
              <img
                src={selectedPlayer.image || "/img/no-dp.jpg"}
                alt={selectedPlayer.name}
                className="player-image"
                onError={(e) => {
                  e.target.onerror = null; // prevent looping
                  e.target.src = "/img/no-dp.jpg";
                }}
              />
              )}
              <h2>{selectedPlayer.name}</h2>
              <div className="player-meta">
                <p><strong>DOB:</strong> {selectedPlayer.dob || "--"}</p>
                <p><strong>Feared For:</strong> {selectedPlayer.fearedFor || "--"}</p>
                <p className="player-description">{selectedPlayer.details || "No details available."}</p>
              </div>
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
            </>
          ) : (
            <p className="no-selection">Hover over a player to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerSection;

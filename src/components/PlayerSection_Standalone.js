// PlayerSection_Standalone.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom'; // Import Link
import "./PlayerSection_Standalone.css";

function PlayerSection({ players }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);

  useEffect(() => {
    if (players.length > 0 && !selectedPlayer) {
      setSelectedPlayer(players[0]);
    }
  }, [players, selectedPlayer]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("https://wccbackendoffl.onrender.com/api/uploadScorecard/playerstat");
        setPlayerStats(res.data || []);
      } catch (error) {
        console.error("Failed to fetch player stats", error);
      }
    };
    fetchStats();
  }, []);

  const handlePlayerHover = (player) => {
    setSelectedPlayer(player);
  };

  const getMatchingStats = (playerId) => {
    return playerStats.find(stat => stat.serial === playerId);
  };

  const matchedStats = selectedPlayer ? getMatchingStats(selectedPlayer.id) : null;

  return (
    <div className="player-section">
      <div className="player-container">
        <div className="player-list">
          {players.length > 0 ? (
            players.map((player) => (
              <div
                key={player.id}
                className={`player-item ${selectedPlayer?.id === player.id ? "active" : ""}`}
                onMouseEnter={() => handlePlayerHover(player)}
              >
                {player.name}
              </div>
            ))
          ) : (
            <p className="no-players-message">No players available.</p>
          )}
        </div>

        <div className="player-details">
          {selectedPlayer ? (
            <>
              <img
                src={selectedPlayer.image || "/img/no-dp.jpg"}
                alt={selectedPlayer.name}
                className="player-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/img/no-dp.jpg";
                }}
              />
              <h2>{selectedPlayer.name || "Unknown Player"}</h2>
              <div className="player-meta">
                <p><strong>DOB:</strong> {selectedPlayer.dob || "--"}</p>
                <p><strong>Feared For:</strong> {selectedPlayer.fearedFor || "--"}</p>
                <p className="player-description">{selectedPlayer.details || "No description available."}</p>
              </div>

              {matchedStats ? (
                <div className="player-stats-summary">
                  <h3>Batting Stats</h3>
                  <p><strong>Matches:</strong> {matchedStats.batting.matches}</p>
                  <p><strong>Runs:</strong> {matchedStats.batting.runs}</p>
                  <p><strong>Strike Rate:</strong> {matchedStats.batting.strikeRate}</p>

                  <h3>Bowling Stats</h3>
                  <p><strong>Matches:</strong> {matchedStats.bowling.matches}</p>
                  <p><strong>Wickets:</strong> {matchedStats.bowling.wickets}</p>
                  <p><strong>Economy:</strong> {matchedStats.bowling.economy}</p>

                  <div className="detailed-stats-link">
                    {/* Updated Link to include player name */}
                    <Link to={`/stats?player=${encodeURIComponent(selectedPlayer.name)}`}>
                      View Detailed Stats for {selectedPlayer.name}
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="no-stats-message">No detailed stats available for this player.</p>
              )}
            </>
          ) : (
            <p className="no-player-selected-message">Hover over a player on the left to see their profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerSection;
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PlayerSection_Standalone.css";

function PlayerSection({ players }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);

  useEffect(() => {
    if (players.length > 0) {
      setSelectedPlayer(players[0]);
    }
  }, [players]);

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
        {/* Left - Player List */}
        <div className="player-list">
          {players.map((player) => (
            <div
              key={player.id}
              className={`player-item ${selectedPlayer?.id === player.id ? "active" : ""}`}
              onMouseEnter={() => handlePlayerHover(player)}
            >
              {player.name}
            </div>
          ))}
        </div>

        {/* Right - Player Details */}
        <div className="player-details fade-in">
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
                <p className="player-description">{selectedPlayer.details || "No details available."}</p>
              </div>

              {/* Player Stats */}
              {matchedStats ? (
                <div className="player-stats">
                  <h3>Batting Stats</h3>
                  <p><strong>Matches:</strong> {matchedStats.batting.matches}</p>
                  <p><strong>Runs:</strong> {matchedStats.batting.runs}</p>
                  <p><strong>Balls:</strong> {matchedStats.batting.balls}</p>
                  <p><strong>Fours:</strong> {matchedStats.batting.fours}</p>
                  <p><strong>Sixes:</strong> {matchedStats.batting.sixes}</p>
                  <p><strong>Strike Rate:</strong> {matchedStats.batting.strikeRate}</p>
                  <p><strong>Not Outs:</strong> {matchedStats.batting.NOs}</p>

                  <h3>Bowling Stats</h3>
                  <p><strong>Matches:</strong> {matchedStats.bowling.matches}</p>
                  <p><strong>Overs:</strong> {matchedStats.bowling.overs}</p>
                  <p><strong>Runs:</strong> {matchedStats.bowling.runs}</p>
                  <p><strong>Wickets:</strong> {matchedStats.bowling.wickets}</p>
                  <p><strong>Economy:</strong> {matchedStats.bowling.economy}</p>
                  <p><strong>Maidens:</strong> {matchedStats.bowling.maidens}</p>
                  <p><strong>Dots:</strong> {matchedStats.bowling.dots}</p>
                  <p><strong>Fours:</strong> {matchedStats.bowling.fours}</p>
                  <p><strong>Sixes:</strong> {matchedStats.bowling.sixes}</p>
                  <p><strong>Wides:</strong> {matchedStats.bowling.wd}</p>
                  <p><strong>No Balls:</strong> {matchedStats.bowling.nb}</p>
                </div>
              ) : (
                <p className="text-white">Stats not available.</p>
              )}
            </>
          ) : (
            <p className="text-white">No player selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerSection;

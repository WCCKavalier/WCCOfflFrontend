import React from 'react';
import './PlayerProfile.css'; // Make sure this CSS file is in the same directory

export const PlayerProfile = ({ player, onBack }) => {
  // If player data is not available, display a message
  if (!player) {
    return (
      <div className="player-profile-container">
        <button onClick={onBack} className="back-button">← Back to Overall Stats</button>
        <p>No player data available or player not found.</p>
      </div>
    );
  }

  return (
    <div className="player-profile-container">
      <button onClick={onBack} className="back-button">← Back to Overall Stats</button>
      <h2 className="profile-title">{player.name}'s Profile</h2>

      {/* New: Overall Matches Played */}
      <div className="profile-section">
        <h3>Overall Summary</h3>
        <div className="stat-grid">
          <p><strong>Matches Played:</strong> {player.matchesPlayed}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Batting Stats</h3>
        <div className="stat-grid">
          {/* Changed from player.battingMatches to player.battingInnings */}
          <p><strong>Innings Batted:</strong> {player.battingInnings}</p>
          <p><strong>Runs:</strong> {player.runs}</p>
          <p><strong>Balls Faced:</strong> {player.ballsFaced}</p>
          <p><strong>Outs:</strong> {player.outs}</p>
          <p><strong>Not Outs:</strong> {player.notOuts}</p>
          <p><strong>High Score:</strong> {player.highScore}</p>
          <p><strong>Fifties:</strong> {player.fifties}</p>
          <p><strong>Hundreds:</strong> {player.hundreds}</p>
          <p><strong>Average:</strong> {player.average}</p>
          <p><strong>Strike Rate:</strong> {player.strikeRate}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Bowling Stats</h3>
        <div className="stat-grid">
          {/* Changed from player.bowlingMatches to player.bowlingInnings */}
          <p><strong>Innings Bowled:</strong> {player.bowlingInnings}</p>
          <p><strong>Overs:</strong> {player.overs}</p>
          <p><strong>Runs Conceded:</strong> {player.runsConceded}</p>
          <p><strong>Wickets:</strong> {player.wickets}</p>
          <p><strong>Best Bowling:</strong> {player.bestBowling}</p>
          <p><strong>Economy:</strong> {player.economy}</p>
          <p><strong>Maidens:</strong> {player.maidens}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Fielding Stats</h3>
        <div className="stat-grid">
          <p><strong>Catches:</strong> {player.catches}</p>
          <p><strong>Run Outs:</strong> {player.runOuts}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Overview</h3>
        <p>
          <strong>Series Played:</strong>{' '}
          {player.seriesPlayed && player.seriesPlayed.length > 0
            ? player.seriesPlayed.join(', ')
            : 'N/A'}
        </p>
        <p>
          <strong>Years Played:</strong>{' '}
          {player.yearsPlayed && player.yearsPlayed.length > 0
            ? player.yearsPlayed.join(', ')
            : 'N/A'}
        </p>
      </div>
    </div>
  );
};
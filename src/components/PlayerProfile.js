// PlayerProfile.js
import React from 'react';
import './PlayerProfile.css';

// Helper component for displaying individual stats
const StatItem = ({ label, value, unit = '' }) => (
    <div className="profile-stat-item">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}{unit}</strong>
    </div>
);

export const PlayerProfile = ({ player, onBack }) => {
    if (!player) {
        return (
            <div className="player-profile-container fallback">
                <button onClick={onBack} className="back-button">← Back to Overall Stats</button>
                <div className="no-player-found">
                    <p>Player data for this profile could not be loaded. Please try again.</p>
                </div>
            </div>
        );
    }

    // Helper for formatting averages and strike rates
    const formatStat = (value) => {
        if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
        }
        // Check if it's an integer, if so, just return it. Otherwise, format to 2 decimal places.
        return Number.isInteger(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
    };

    return (
        <div className="player-profile-container">
            <div className="profile-header">
                <button onClick={onBack} className="back-button">← Back to Overall Stats</button>
                <h2 className="profile-title">{player.name}'s Performance</h2>
                <p className="profile-subtitle">Insights into their cricketing journey.</p>
            </div>

            {/* Overall Summary Section */}
            <div className="profile-section overall-summary">
                <h3 className="section-title">Career Overview</h3>
                <div className="stat-grid">
                    <StatItem label="Matches Played" value={player.matchesPlayed} />
                    <StatItem label="Years Active" value={player.yearsPlayed?.length || 0} />
                    <StatItem label="Series Participated" value={player.seriesPlayed?.length || 0} />
                </div>
            </div>

            {/* Batting Stats Section */}
            <div className="profile-section batting-stats">
                <h3 className="section-title">Batting</h3>
                {/* Key Batting Stats - always visible, perhaps 2-columns on mobile */}
                <div className="key-stats-grid">
                    <StatItem label="Runs" value={player.runs} />
                    <StatItem label="Avg" value={formatStat(player.average)} />
                    <StatItem label="SR" value={formatStat(player.strikeRate)} unit="%" />
                    <StatItem label="HS" value={player.highScore} />
                </div>
                {/* All Batting Stats - might scroll horizontally on small screens */}
                <div className="full-stat-grid-wrapper"> {/* New wrapper for horizontal scroll */}
                    <div className="stat-grid full-stat-grid">
                        <StatItem label="Innings Batted" value={player.battingInnings} />
                        <StatItem label="Not Outs" value={player.notOuts} />
                        <StatItem label="Balls Faced" value={player.ballsFaced} />
                        {/* <StatItem label="Fifties" value={player.fifties} />
                        <StatItem label="Hundreds" value={player.hundreds} /> */}
                        <StatItem label="Ducks" value={player.ducks || '0'} />
                    </div>
                </div>
            </div>

            {/* Bowling Stats Section */}
            <div className="profile-section bowling-stats">
                <h3 className="section-title">Bowling</h3>
                {/* Key Bowling Stats */}
                <div className="key-stats-grid">
                    <StatItem label="Wickets" value={player.wickets} />
                    <StatItem label="Economy" value={formatStat(player.economy)} />
                    <StatItem label="B.Bowling" value={player.bestBowling} />
                    <StatItem label="Maidens" value={player.maidens} />
                </div>
                {/* All Bowling Stats */}
                <div className="full-stat-grid-wrapper"> {/* New wrapper for horizontal scroll */}
                    <div className="stat-grid full-stat-grid">
                        <StatItem label="Innings Bowled" value={player.bowlingInnings} />
                        <StatItem label="Overs Bowled" value={formatStat(player.overs)} />
                        <StatItem label="Runs Conceded" value={player.runsConceded} />
                        <StatItem label="3-Wkt Hauls" value={player.threeWicketHauls} />

                        {/* <StatItem label="5-Wkt Hauls" value={player.fiveWicketHauls || '0'} /> */}
                    </div>
                </div>
            </div>

            {/* Fielding Stats Section */}
            <div className="profile-section fielding-stats">
                <h3 className="section-title">Fielding</h3>
                <div className="stat-grid"> {/* This section likely doesn't need key/full separation */}
                    <StatItem label="Catches" value={player.catches} />
                    <StatItem label="Run Outs" value={player.runOuts} />
                </div>
            </div>

            {/* Overview Section */}
            <div className="profile-section career-details">
                <h3 className="section-title">Career Snapshot</h3>
                <div className="stat-list">
                    <p>
                        <strong>Series Played:</strong>{' '}
                        <span className="detail-value">
                            {player.seriesPlayed && player.seriesPlayed.length > 0
                                ? player.seriesPlayed.join(', ')
                                : 'N/A'}
                        </span>
                    </p>
                    <p>
                        <strong>Years Active:</strong>{' '}
                        <span className="detail-value">
                            {player.yearsPlayed && player.yearsPlayed.length > 0
                                ? player.yearsPlayed.join(', ')
                                : 'N/A'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
// StatsPage.js
import React, { useState, useMemo, useEffect } from 'react';
import axios from "axios";
import { useLocation } from 'react-router-dom'; // Import useLocation
import { processMatchData } from './processStats';
import { StatsTable } from './StatsTable';
import { PlayerProfile } from './PlayerProfile';
import './StatsPage.css';
const API_BASE_URL = "https://wccbackendoffl.onrender.com";

// Helper function to parse query parameters (can be in a utils file)
function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const StatsPage = () => {
  const [allScorecards, setAllScorecards] = useState([]);
  useEffect(() => {
      fetchScorecard();
    }, []);
  const fetchScorecard = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/uploadScorecard/allscorecard`);
      setAllScorecards(res.data);
    } catch (err) {
      console.error('Failed to load scorecards', err);
    }
  };
  const { overallPlayerStats, uniqueSeriesNames, uniqueYears } = useMemo(
    () => processMatchData(allScorecards),
    [allScorecards]
  );

  const query = useQuery(); // Get query params
  const playerNameToLoad = query.get('player'); // Get 'player' param

  const [currentView, setCurrentView] = useState('batting');
  const [yearFilter, setYearFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');

  // Initialize selectedPlayerName from URL parameter if present
  const [selectedPlayerName, setSelectedPlayerName] = useState(playerNameToLoad || null);

  const filteredTableData = useMemo(() => {
    if (selectedPlayerName) return []; // Don't show table if a player profile is active

    const dataset = overallPlayerStats;
    return dataset.filter((player) => {
      const yearMatch = yearFilter ? player.yearsPlayed.includes(yearFilter) : true;
      const seriesMatch = seriesFilter ? player.seriesPlayed.includes(seriesFilter) : true;
      const searchMatch = playerSearchTerm
        ? player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
        : true;
      return yearMatch && seriesMatch && searchMatch;
    });
  }, [overallPlayerStats, yearFilter, seriesFilter, playerSearchTerm, selectedPlayerName]);

  const selectedPlayerData = useMemo(() => {
    if (!selectedPlayerName) return null;
    return overallPlayerStats.find(player => player.name === selectedPlayerName);
  }, [selectedPlayerName, overallPlayerStats]);

  // Effect to handle initial player load from URL and reset filters if a player is loaded
  useEffect(() => {
    const playerNameFromUrl = query.get('player');
    if (playerNameFromUrl) {
      // Check if this player exists in our processed stats
      const playerExists = overallPlayerStats.some(p => p.name === playerNameFromUrl);
      if (playerExists) {
        setSelectedPlayerName(playerNameFromUrl);
        // Clear other filters when a player is loaded directly
        setPlayerSearchTerm('');
        setYearFilter('');
        setSeriesFilter('');
        setCurrentView('batting'); // Or a default view for player profile context
      } else {
        // Optional: Handle case where player from URL isn't found, e.g., show error or clear selection
        setSelectedPlayerName(null); 
        console.warn(`Player "${playerNameFromUrl}" from URL not found in stats.`);
      }
    }
  }, [playerNameToLoad, overallPlayerStats, query]); // Rerun if playerNameToLoad from URL or overallPlayerStats changes

  // Effect to reset filters when matches data changes,
  // but preserve selectedPlayerName if it came from URL or was already set.
  useEffect(() => {
    if (!playerNameToLoad) { // Only reset if not loading a player from URL
        setYearFilter('');
        setSeriesFilter('');
        setPlayerSearchTerm('');
        setSelectedPlayerName(null); // This would clear a player selected via table click
    }
  }, [allScorecards, playerNameToLoad]); // Added playerNameToLoad

  const handlePlayerSelect = (playerName) => {
    setSelectedPlayerName(playerName);
    setPlayerSearchTerm('');
    setYearFilter('');
    setSeriesFilter('');
  };

  const handleBackToOverall = () => {
    setSelectedPlayerName(null);
    // Optional: navigate to '/stats' without query param if you want the URL to be clean
    // history.push('/stats'); // if using older react-router or a custom history object
  };

  return (
    <div className="stats-page-container">
      {!selectedPlayerName && <h1 className="page-title">Player Detailed Statistics</h1>} {/* Hide title if profile is shown or adjust */}

      {!selectedPlayerName && (
        <>
          <div className="view-selector">
            {/* ... buttons ... */}
            <button className={currentView === 'batting' ? 'active' : ''} onClick={() => setCurrentView('batting')}>Batting Stats</button>
            <button className={currentView === 'bowling' ? 'active' : ''} onClick={() => setCurrentView('bowling')}>Bowling Stats</button>
            <button className={currentView === 'fielding' ? 'active' : ''} onClick={() => setCurrentView('fielding')}>Fielding Stats</button>
          </div>
          <div className="filters-container">
            {/* ... filters ... */}
            <label className="filter-label">
              Search Player:
              <input type="text" value={playerSearchTerm} onChange={(e) => setPlayerSearchTerm(e.target.value)} placeholder="Search by name..."/>
            </label>
            <label className="filter-label">
              Filter Stats by Year:
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="">All Years</option>
                {uniqueYears.map((year) => (<option key={year} value={year}>{year}</option>))}
              </select>
            </label>
            <label className="filter-label">
              Filter Stats by Series:
              <select value={seriesFilter} onChange={(e) => setSeriesFilter(e.target.value)}>
                <option value="">All Series</option>
                {uniqueSeriesNames.map((seriesName) => (<option key={seriesName} value={seriesName}>{seriesName}</option>))}
              </select>
            </label>
          </div>
          <div className="table-context-info">
            {yearFilter && <span>Year: {yearFilter} | </span>}
            {seriesFilter && <span>Series: {seriesFilter} | </span>}
            {playerSearchTerm && <span>Searching for: "{playerSearchTerm}" | </span>}
            {!yearFilter && !seriesFilter && !playerSearchTerm && <span>Overall Stats</span>}
          </div>
          <p className="player-click-hint">
            💡 **Click on a player's name in the table for detailed stats!**
          </p>
          <StatsTable
            data={filteredTableData}
            view={currentView}
            onPlayerClick={handlePlayerSelect}
          />
        </>
      )}

      {selectedPlayerName && selectedPlayerData && (
        <PlayerProfile
          player={selectedPlayerData}
          onBack={handleBackToOverall}
        />
      )}

      {selectedPlayerName && !selectedPlayerData && (
        // This handles the case where a name is in URL but not found after overallPlayerStats load
        <div className="no-player-found">
            <p>Player "{selectedPlayerName}" not found.</p>
            <button onClick={handleBackToOverall} className="back-button">← Back to Overall Stats</button>
        </div>
      )}
    </div>
  );
};
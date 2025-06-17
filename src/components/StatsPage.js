import React, { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { processMatchData } from './processStats';
import { StatsTable } from './StatsTable'; // Assuming StatsTable internally handles column definitions
import { PlayerProfile } from './PlayerProfile';
import './StatsPage.css'; // Make sure this CSS file is correctly linked and contains the mobile overrides

// Import Material UI hooks for responsive design
import { useMediaQuery, useTheme } from '@mui/material';

const API_BASE_URL = 'https://wccbackendoffl.onrender.com';

// Helper function to parse query parameters (can be in a utils file)
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const StatsPage = () => {
  const [allScorecards, setAllScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Material UI hooks for responsive design
  const theme = useTheme();
  // Using 'xs' breakpoint (0px-600px) for a stricter mobile detection
  // or a custom value like 500px for even smaller screens.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Standard 'sm' (600px)

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/uploadScorecard/allscorecard`);
        setAllScorecards(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load scorecards', err);
        setError('Failed to load player data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchScorecard();
  }, []);

  const query = useQuery();
  const playerNameToLoad = query.get('player');

  const [currentView, setCurrentView] = useState('batting');
  const [yearFilter, setYearFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [selectedPlayerName, setSelectedPlayerName] = useState(playerNameToLoad || null);
  // Removed showFilters state as filters will always be visible
const { overallPlayerStats, uniqueSeriesNames, uniqueYears } = useMemo(
  () => processMatchData(allScorecards, seriesFilter, yearFilter),
  [allScorecards, seriesFilter, yearFilter] // ✅ include seriesFilter here
);


  const filteredTableData = useMemo(() => {
    if (selectedPlayerName) return [];

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

  useEffect(() => {
    if (playerNameToLoad) {
      const playerExists = overallPlayerStats.some(p => p.name === playerNameToLoad);
      if (playerExists) {
        setSelectedPlayerName(playerNameToLoad);
        setPlayerSearchTerm('');
        setYearFilter('');
        setSeriesFilter('');
        setCurrentView('batting');
      } else {
        setSelectedPlayerName(null);
        console.warn(`Player "${playerNameToLoad}" from URL not found in stats.`);
      }
    }
  }, [playerNameToLoad, overallPlayerStats, query]);

  useEffect(() => {
    if (!playerNameToLoad) {
      setYearFilter('');
      setSeriesFilter('');
      setPlayerSearchTerm('');
      setSelectedPlayerName(null);
    }
  }, [allScorecards, playerNameToLoad]);

  const handlePlayerSelect = useCallback((playerName) => {
    setSelectedPlayerName(playerName);
    setPlayerSearchTerm('');
    setYearFilter('');
    setSeriesFilter('');
  }, []);

  const handleBackToOverall = useCallback(() => {
    setSelectedPlayerName(null);
  }, []);

  // Define columns for Material-React-Table dynamically based on view and mobile status
  const tableColumns = useMemo(() => {
    const commonColumns = [
      {
        accessorKey: 'name',
        header: 'Player',
        size: isMobile ? 90 : 200, // Reduced width for player name on mobile
        Cell: ({ cell }) => (
          <span className="player-name-link" onClick={() => handlePlayerSelect(cell.getValue())}>
            {cell.getValue()}
          </span>
        ),
        enableColumnFilter: true, // Allow filtering by player name
      },
      {
        accessorKey: 'matches',
        header: 'M', // Matches played
        size: isMobile ? 40 : 80, // Reduced width
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        accessorKey: 'innings',
        header: 'Inn', // Innings
        size: isMobile ? 40 : 80, // Reduced width
        enableColumnFilter: false,
        enableSorting: true,
      },
    ];

    let specificColumns = [];

    switch (currentView) {
      case 'batting':
        specificColumns = [
          { accessorKey: 'runs', header: 'Runs', size: isMobile ? 60 : 100, enableColumnFilter: true }, // Reduced width
          { accessorKey: 'highScore', header: 'HS', size: isMobile ? 50 : 90, enableColumnFilter: true }, // Reduced width
          { accessorKey: 'average', header: 'Avg', size: isMobile ? 60 : 100, enableColumnFilter: true }, // Reduced width
          { accessorKey: 'strikeRate', header: 'SR', size: isMobile ? 60 : 100, enableColumnFilter: true }, // Reduced width
          { accessorKey: 'notOuts', header: 'NO', size: isMobile ? 40 : 80, enableColumnFilter: false}, // Reduced, can be hidden
          { accessorKey: 'fours', header: '4s', size: isMobile ? 40 : 80, enableColumnFilter: false }, // Reduced, can be hidden
          { accessorKey: 'sixes', header: '6s', size: isMobile ? 40 : 80, enableColumnFilter: false }, // Reduced, can be hidden
          // { accessorKey: 'hundreds', header: '100s', size: isMobile ? 50 : 90, enableColumnFilter: false, enableHiding: true }, // Reduced, can be hidden
          // { accessorKey: 'fifties', header: '50s', size: isMobile ? 40 : 80, enableColumnFilter: false, enableHiding: true }, // Reduced, can be hidden
          // Add other batting specific columns
        ];
        break;
      case 'bowling':
        specificColumns = [
          { accessorKey: 'wickets', header: 'Wkts', size: isMobile ? 60 : 100, enableColumnFilter: false }, // Reduced width
          { accessorKey: 'economy', header: 'Eco', size: isMobile ? 60 : 100, enableColumnFilter: false }, // Reduced width
          { accessorKey: 'bowlingAverage', header: 'Avg', size: isMobile ? 60 : 100, enableColumnFilter: false }, // Reduced width
          { accessorKey: 'bestBowling', header: 'BBI', size: isMobile ? 50 : 90, enableColumnFilter: false }, // Reduced width
          { accessorKey: 'overs', header: 'Overs', size: isMobile ? 50 : 90, enableColumnFilter: false, enableHiding: true }, // Reduced
          { accessorKey: 'maidenOvers', header: 'Maiden', size: isMobile ? 50 : 90, enableColumnFilter: false, enableHiding: true }, // Reduced
          { accessorKey: 'runsConceded', header: 'Runs C', size: isMobile ? 60 : 100, enableColumnFilter: false, enableHiding: true }, // Reduced
          // Add other bowling specific columns
        ];
        break;
      case 'fielding':
        specificColumns = [
          { accessorKey: 'catches', header: 'Ct', size: isMobile ? 50 : 90, enableColumnFilter: false }, // Reduced width
          { accessorKey: 'stumpings', header: 'St', size: isMobile ? 50 : 90, enableColumnFilter: false }, // Reduced width
          { accessorKey: 'runOuts', header: 'RO', size: isMobile ? 50 : 90, enableColumnFilter: false, enableHiding: true }, // Reduced
          // Add other fielding specific columns
        ];
        break;
      default:
        break;
    }
    return [...commonColumns, ...specificColumns];
  }, [currentView, isMobile, handlePlayerSelect]);

  // Show loading, error, or data
  if (loading) {
    return (
      <div className="stats-page-container loading-state">
        <p>Loading player statistics...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-page-container error-state">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">Retry Loading</button>
      </div>
    );
  }

  return (
    <div className="stats-page-container">
      {!selectedPlayerName && <h1 className="page-title">Player Statistics</h1>}

      {!selectedPlayerName && (
        <>
          <div className="view-selector">
            <button className={currentView === 'batting' ? 'active' : ''} onClick={() => setCurrentView('batting')}>Batting</button>
            <button className={currentView === 'bowling' ? 'active' : ''} onClick={() => setCurrentView('bowling')}>Bowling</button>
            <button className={currentView === 'fielding' ? 'active' : ''} onClick={() => setCurrentView('fielding')}>Fielding</button>
          </div>

          {/* Filters are always visible now, removed the toggle button and its state */}
          <div className="filters-container mobile-active">
            <label className="filter-label">
              Search Player:
              <input type="text" value={playerSearchTerm} onChange={(e) => setPlayerSearchTerm(e.target.value)} placeholder="Search name..." />
            </label>
            <label className="filter-label year-filter-label">
              Filter by Year:
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                <option value="">All Years</option>
                {uniqueYears.map((year) => (<option key={year} value={year}>{year}</option>))}
              </select>
            </label>
            <label className="filter-label series-filter-label">
              Filter by Series:
              <select value={seriesFilter} onChange={(e) => setSeriesFilter(e.target.value)}>
                <option value="">All Series</option>
                {uniqueSeriesNames.map((seriesName) => (<option key={seriesName} value={seriesName}>{seriesName}</option>))}
              </select>
            </label>
          </div>

          <div className="table-context-info">
            {yearFilter && <span>Year: {yearFilter} | </span>}
            {seriesFilter && <span>Series: {seriesFilter} | </span>}
            {playerSearchTerm && <span>Searching: "{playerSearchTerm}" | </span>}
            {!yearFilter && !seriesFilter && !playerSearchTerm && <span>Overall Stats</span>}
          </div>
          <p className="player-click-hint">
            💡 **Tap on a player's name for detailed stats!**
          </p>
          <StatsTable
            data={filteredTableData}
            columns={tableColumns} // Pass the dynamically generated columns
            view={currentView} // Still pass view if StatsTable uses it internally for other logic
            onPlayerClick={handlePlayerSelect} // This will be redundant if Cell is used directly, but keep it for safety if StatsTable uses it elsewhere.
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
        <div className="no-player-found">
          <p>Player "{selectedPlayerName}" not found.</p>
          <button onClick={handleBackToOverall} className="back-button">← Back to Overall Stats</button>
        </div>
      )}
    </div>
  );
};
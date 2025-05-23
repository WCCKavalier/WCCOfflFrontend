// components/StatsTable.js

import React, { useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import './StatsTable.css'; // Make sure this CSS file is present as discussed earlier

export const StatsTable = ({ data, view, onPlayerClick }) => {
  const columns = useMemo(() => {
    // Base column for player name, always present and clickable
    const playerColumn = {
      accessorKey: 'name',
      header: 'Player',
      Cell: ({ cell }) => (
        <span
          className="player-name-link" // This class will now correctly apply the golden theme
          onClick={() => onPlayerClick(cell.getValue())}
          // REMOVED: Inline styles that were overriding your CSS
          // style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
          {cell.getValue()}
        </span>
      ),
    };

    // Define a common 'Matches Played' column for all views
    const matchesPlayedColumn = {
      accessorKey: 'matchesPlayed',
      header: 'Matches',
      Cell: ({ cell }) => (cell.getValue() !== undefined ? cell.getValue() : '-'),
    };

    if (view === 'batting') {
      return [
        playerColumn,
        matchesPlayedColumn,
        { accessorKey: 'battingInnings', header: 'Innings' },
        { accessorKey: 'runs', header: 'Runs' },
        { accessorKey: 'highScore', header: 'HS' },
        { accessorKey: 'notOuts', header: 'NO' },
        { accessorKey: 'average', header: 'Avg' },
        { accessorKey: 'strikeRate', header: 'SR' },
        { accessorKey: 'fifties', header: '50s' },
        { accessorKey: 'hundreds', header: '100s' },
      ];
    } else if (view === 'bowling') {
      return [
        playerColumn,
        matchesPlayedColumn,
        { accessorKey: 'bowlingInnings', header: 'Innings' },
        { accessorKey: 'overs', header: 'Overs' },
        { accessorKey: 'runsConceded', header: 'Runs' },
        { accessorKey: 'wickets', header: 'Wickets' },
        { accessorKey: 'bestBowling', header: 'Best' },
        { accessorKey: 'economy', header: 'Economy' },
        { accessorKey: 'maidens', header: 'Maidens' },
      ];
    } else if (view === 'fielding') {
      return [
        playerColumn,
        matchesPlayedColumn,
        { accessorKey: 'catches', header: 'Catches' },
        { accessorKey: 'runOuts', header: 'Run Outs' },
      ];
    }
    return []; // Default return
  }, [view, onPlayerClick]);

  return (
    <div className="stats-table-container">
      <MaterialReactTable columns={columns} data={data} enableColumnOrdering enableGlobalFilter={false} />
    </div>
  );
};
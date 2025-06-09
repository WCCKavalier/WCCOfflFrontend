// components/StatsTable.js

import React, { useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Box, useMediaQuery, useTheme } from '@mui/material'; // Import Material UI components for responsive design
import './StatsTable.css';

export const StatsTable = ({ data, view, onPlayerClick }) => {
  const theme = useTheme();
  // Check if screen is small (e.g., mobile)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo(() => {
    const playerColumn = {
      accessorKey: 'name',
      header: 'Player',
      Cell: ({ cell }) => (
        <span
          className="player-name-link"
          onClick={() => onPlayerClick(cell.getValue())}
        >
          {cell.getValue()}
        </span>
      ),
      size: 120, // Give player column a fixed size
    };

    const matchesPlayedColumn = {
      accessorKey: 'matchesPlayed',
      header: 'Matches',
      Cell: ({ cell }) => (cell.getValue() !== undefined ? cell.getValue() : '-'),
      size: 80, // Smaller size for matches played
    };

    // Define common core columns for all views on mobile
    const mobileCoreColumns = [
      playerColumn,
      matchesPlayedColumn,
    ];

    if (view === 'batting') {
      // For batting, show essential columns on mobile, others can be hidden or in a detail panel
      const battingColumns = [
        { accessorKey: 'battingInnings', header: 'Innings', size: 80, enableHiding: false, },
        { accessorKey: 'runs', header: 'Runs', size: 70 },
        { accessorKey: 'average', header: 'Avg', size: 70 },
        { accessorKey: 'strikeRate', header: 'SR', size: 70 },
        // These columns can be hidden on small screens by default or moved to a detail panel
        { accessorKey: 'highScore', header: 'HS', size: 70, enableHiding: false, },
        { accessorKey: 'notOuts', header: 'NO', size: 60, enableHiding: false, },

      ].filter(column => !isSmallScreen || !column.enableHiding); // Filter out columns that are enabled for hiding on small screens

      return [...mobileCoreColumns, ...battingColumns];

    } else if (view === 'bowling') {
      const bowlingColumns = [
        { accessorKey: 'overs', header: 'Overs', size: 70, enableHiding: false },
        { accessorKey: 'wickets', header: 'Wickets', size: 80 },
        { accessorKey: 'economy', header: 'Economy', size: 80 },
        { accessorKey: 'runsConceded', header: 'Runs', size: 70 },
        // Hide less critical columns on mobile
        { accessorKey: 'bestBowling', header: 'Best', size: 80, enableHiding: false },
        { accessorKey: 'maidens', header: 'Maidens', size: 80, enableHiding: true },

        // { accessorKey: 'bowlingInnings', header: 'Matches Bowlt', size: 80, enableHiding: true },
      ].filter(column => !isSmallScreen || !column.enableHiding);

      return [...mobileCoreColumns, ...bowlingColumns];

    } else if (view === 'fielding') {
      return [
        playerColumn,
        matchesPlayedColumn,
        { accessorKey: 'catches', header: 'Catches', size: 80 },
        { accessorKey: 'runOuts', header: 'Run Outs', size: 80 },
      ];
    }
    return [];
  }, [view, onPlayerClick, isSmallScreen]); // Add isSmallScreen to dependency array

  return (
    <Box className="stats-table-container">
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnOrdering={false} // Disable column ordering on mobile for simplicity
        enableGlobalFilter={false}
        enableColumnResizing={false} // Disable column resizing on mobile
        enableColumnActions={!isSmallScreen} // Hide column actions menu on small screens
        enableColumnFilters={false} // Disable column filters on mobile
        enablePagination={true} // Keep pagination for navigation
        enableDensityToggle={false} // Hide density toggle on mobile
        enableFullScreenToggle={false} // Hide full screen toggle on mobile
        enableStickyHeader // Keep sticky header for better scrolling experience
        // enableRowNumbers // Consider enabling row numbers for better context if needed
        muiTablePaperProps={{
          elevation: 0, // Remove shadow for a flatter look
          sx: {
            backgroundColor: 'transparent', // Ensure table paper is transparent
          },
        }}
        muiTableContainerProps={{
          sx: {
            maxHeight: '70vh', // Limit height to enable scrolling within the table
            overflowX: isSmallScreen ? 'auto' : 'unset', // Enable horizontal scrolling only on small screens
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            backgroundColor: '#000000', // Ensure header background is black
            color: '#FFD700', // Gold text for headers
            fontSize: isSmallScreen ? '0.75rem' : '0.875rem', // Smaller font on mobile
            padding: isSmallScreen ? '8px 4px' : '12px 16px', // Smaller padding on mobile
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            backgroundColor: '#000000', // Ensure body cell background is black
            color: '#e0e0e0', // Light grey text for body cells
            fontSize: isSmallScreen ? '0.7rem' : '0.8125rem', // Smaller font on mobile
            padding: isSmallScreen ? '6px 4px' : '8px 16px', // Smaller padding on mobile
            whiteSpace: 'nowrap', // Prevent text wrapping in cells
            overflow: 'hidden', // Hide overflowing text
            textOverflow: 'ellipsis', // Add ellipsis for overflowing text
          },
        }}
        muiTablePaginationProps={{
          sx: {
            backgroundColor: '#000000',
            color: '#e0e0e0',
          },
        }}
        initialState={{
          columnVisibility: {
            // Initially hide some columns on small screens
            // highScore: !isSmallScreen,
            notOuts: !isSmallScreen,
            // battingInnings: !isSmallScreen,
            // bestBowling: !isSmallScreen,
            maidens: !isSmallScreen,
            // overs: !isSmallScreen,
            bowlingInnings: !isSmallScreen,
          },
          density: 'compact', // Start with compact density on mobile
        }}
        state={{
          columnVisibility: {
            // Dynamic visibility based on screen size
            // highScore: !isSmallScreen,
            notOuts: !isSmallScreen,
            // battingInnings: !isSmallScreen,
            bestBowling: !isSmallScreen,
            maidens: !isSmallScreen,
            overs: !isSmallScreen,
            bowlingInnings: !isSmallScreen,
          },
        }}
      />
    </Box>
  );
};
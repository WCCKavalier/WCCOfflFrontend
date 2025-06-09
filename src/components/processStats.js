// utils/processStats.js

export function processMatchData(matches) {
  const allPlayerStats = {};
  const uniqueSeriesNames = new Set();
  const uniqueYears = new Set();

  // Helper function to initialize player stats
  const initializePlayerStats = (name) => {
    return {
      name,
      matchesPlayed: 0, // Initialize overall matches played
      batting: {
        innings: 0,
        runs: 0,
        balls: 0,
        outs: 0,
        highScore: 0,
        fifties: 0,
        hundreds: 0,
        notOuts: 0,
      },
      bowling: {
        innings: 0,
        overs: 0,
        runs: 0,
        wickets: 0,
        maidens: 0,
        bestBowlingInnings: { wickets: 0, runs: Infinity },
      },
      fielding: {
        catches: 0,
        runOuts: 0,
      },
      seriesPlayed: new Set(),
      yearsPlayed: new Set(),
    };
  };

  matches.forEach((match) => {
    const { matchInfo, innings } = match;

    const year = matchInfo.date.slice(-4);
    uniqueYears.add(year);

    const series = matchInfo.teams.join(' vs ');
    uniqueSeriesNames.add(series);

    // Keep track of players who participated in the current match
    const playersInThisMatch = new Set();

    innings.forEach((inning) => {
      // Process batting stats
      inning.batsmen.forEach((batsman) => {
        const { name, runs, balls, outDesc } = batsman;

        // Ensure player is initialized if they don't exist
        if (!allPlayerStats[name]) {
          allPlayerStats[name] = initializePlayerStats(name);
        }
        playersInThisMatch.add(name); // Add batter to current match players

        const player = allPlayerStats[name];

        // Batting Stats
        player.batting.innings += 1;
        player.batting.runs += runs;
        player.batting.balls += balls;
        if (outDesc && !/^\s*not\s*out\s*$/i.test(outDesc)) {
          player.batting.outs += 1;
        } else {
          player.batting.notOuts += 1;
        }
        player.batting.highScore = Math.max(player.batting.highScore, runs);
        if (runs >= 50 && runs < 100) player.batting.fifties += 1;
        if (runs >= 100) player.batting.hundreds += 1;

        player.seriesPlayed.add(series);
        player.yearsPlayed.add(year);

        // Fielding from outDesc (Catches & Run Outs)
        if (outDesc) {
          const lowerCaseOutDesc = outDesc;

          // Catch parsing
          const catchRegex = /^c\s+([a-z\s.]+?)(?:\s+b|$)/i;
          const catchMatch = lowerCaseOutDesc.match(catchRegex);

          if (catchMatch && catchMatch[1]) {
            const fielderName = catchMatch[1].trim();
            // Ensure fielder is initialized
            if (!allPlayerStats[fielderName]) {
              allPlayerStats[fielderName] = initializePlayerStats(fielderName);
            }

            playersInThisMatch.add(fielderName); // Fielder also played in this match
            allPlayerStats[fielderName].fielding.catches += 1;
            allPlayerStats[fielderName].seriesPlayed.add(series);
            allPlayerStats[fielderName].yearsPlayed.add(year);
          }


          // Run-out parsing (assuming a format like "runout (Fielder Name)")
          const runoutRegex = /run\s*out\s*\(([^)]+)\)/i;
          // Adjusted regex to capture run out description
          const runoutMatch = lowerCaseOutDesc.match(runoutRegex);

          if (runoutMatch && runoutMatch[1]) {
            const fielderNames = runoutMatch[1].split('/').map(name => name.trim());

            fielderNames.forEach(fielderName => {
              if (!allPlayerStats[fielderName]) {
                allPlayerStats[fielderName] = initializePlayerStats(fielderName);
              }

              playersInThisMatch.add(fielderName); // Fielder also played in this match
              allPlayerStats[fielderName].fielding.runOuts += 1;
              allPlayerStats[fielderName].seriesPlayed.add(series);
              allPlayerStats[fielderName].yearsPlayed.add(year);
            });
          }

        }
      });

      // Process bowling stats
      inning.bowlers.forEach((bowler) => {
        const { name, overs, runs, wickets, maidens } = bowler;

        // Ensure player is initialized if they don't exist
        if (!allPlayerStats[name]) {
          allPlayerStats[name] = initializePlayerStats(name);
        }
        playersInThisMatch.add(name); // Add bowler to current match players

        const player = allPlayerStats[name];

        // Bowling Stats
        player.bowling.innings += 1;
        // Use Number() for robust conversion, handles both strings and numbers
        player.bowling.overs = addOvers(player.bowling.overs || 0, Number(overs));
        player.bowling.runs += runs;
        player.bowling.wickets += wickets;
        player.bowling.maidens += (maidens || 0);

        if (wickets > player.bowling.bestBowlingInnings.wickets) {
          player.bowling.bestBowlingInnings = { wickets, runs };
        } else if (wickets === player.bowling.bestBowlingInnings.wickets && runs < player.bowling.bestBowlingInnings.runs) {
          player.bowling.bestBowlingInnings = { wickets, runs };
        }

        player.seriesPlayed.add(series);
        player.yearsPlayed.add(year);
      });
    }); // End of innings.forEach

    // After processing all innings for the match, increment the match count
    // for all players who participated in this match.
    playersInThisMatch.forEach(playerName => {
      // Player should always exist here due to prior initialization, but good for safety
      if (allPlayerStats[playerName]) {
        allPlayerStats[playerName].matchesPlayed++;
      }
    });

  }); // End of matches.forEach

  // Final calculations and conversion of Sets to Arrays
  const overallPlayerStats = Object.values(allPlayerStats).map((player) => {
    const totalRuns = player.batting.runs || 0;
    const totalBalls = player.batting.balls || 0;
    const totalOuts = player.batting.outs || 0;
    const totalOvers = player.bowling.overs || 0;
    const totalRunsConceded = player.bowling.runs || 0;

    const battingAvg = totalOuts > 0 ? (totalRuns / totalOuts).toFixed(2) : '-';
    const battingSR = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : '0.00';
    const bowlingEconomy = totalOvers > 0 ? (totalRunsConceded / totalOvers).toFixed(2) : '0.00';

    const bestBowlingStr = player.bowling.bestBowlingInnings.wickets > 0
      ? `${player.bowling.bestBowlingInnings.wickets}/${player.bowling.bestBowlingInnings.runs}`
      : '-';
    return {
      name: player.name,
      matchesPlayed: player.matchesPlayed, // Use the new overall match count
      // Batting
      battingInnings: player.batting.innings,
      runs: totalRuns,
      ballsFaced: totalBalls,
      outs: totalOuts,
      notOuts: player.batting.notOuts,
      highScore: player.batting.highScore,
      fifties: player.batting.fifties,
      hundreds: player.batting.hundreds,
      average: battingAvg,
      strikeRate: battingSR,

      // Bowling
      bowlingInnings: player.bowling.innings,
      overs: totalOvers,
      runsConceded: totalRunsConceded,
      wickets: player.bowling.wickets,
      maidens: player.bowling.maidens,
      bestBowling: bestBowlingStr,
      economy: bowlingEconomy,

      // Fielding
      catches: player.fielding.catches,
      runOuts: player.fielding.runOuts,

      seriesPlayed: Array.from(player.seriesPlayed),
      yearsPlayed: Array.from(player.yearsPlayed),
    };
  });

  const sortedUniqueYears = Array.from(uniqueYears).sort((a, b) => parseInt(b) - parseInt(a));

  return {
    overallPlayerStats,
    uniqueSeriesNames: Array.from(uniqueSeriesNames),
    uniqueYears: sortedUniqueYears,
  };
}

// Keeping getUniqueSeriesNames for backward compatibility if needed elsewhere.
export function getUniqueSeriesNames(matches) {
  const uniqueSeries = new Set();
  matches.forEach(match => {
    uniqueSeries.add(match.matchInfo.teams.join(' vs '));
  });
  return Array.from(uniqueSeries);
}

export function getPlayerStats(playerName, overallPlayerStats) {
  return overallPlayerStats.find(player => player.name === playerName);
}

function addOvers(existingOvers, newOvers) {
  const [eOver, eBalls] = existingOvers.toString().split('.').map(Number);
  const [nOver, nBalls] = newOvers.toString().split('.').map(Number);

  // Convert both to balls
  const totalBalls = (eOver * 6 + (eBalls || 0)) + (nOver * 6 + (nBalls || 0));

  // Convert back to overs format
  const finalOvers = Math.floor(totalBalls / 6);
  const remainingBalls = totalBalls % 6;

  return Number(`${finalOvers}.${remainingBalls}`);
}

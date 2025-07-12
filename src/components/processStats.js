export function processMatchData(matches, selectedSeries = '', selectedYear = '') {
  const allPlayerStats = {};
  const uniqueSeriesNames = new Set();
  const uniqueYears = new Set();

  const initializePlayerStats = (name) => ({
    name,
    matchesPlayed: 0,
    batting: {
      innings: 0, runs: 0, balls: 0, outs: 0, highScore: 0, fifties: 0, hundreds: 0, notOuts: 0, ducks: 0,
    },
    bowling: {
      innings: 0, overs: 0, runs: 0, wickets: 0, maidens: 0,
      bestBowlingInnings: { wickets: 0, runs: Infinity }, wi3: 0, // 3-wicket hauls
    },
    fielding: { catches: 0, runOuts: 0 },
    seriesPlayed: new Set(),
    yearsPlayed: new Set(),
  });

  matches.forEach((match) => {
    const { matchInfo, innings } = match;
    const year = matchInfo.date.slice(-4);
    const series = matchInfo.teams.slice().sort().join(' vs ');

    uniqueSeriesNames.add(series);
    uniqueYears.add(year);

    // Skip match if it's not in selected series or year
    if ((selectedSeries && series !== selectedSeries) || (selectedYear && year !== selectedYear)) {
      return;
    }

    const playersInThisMatch = new Set();

    innings.forEach((inning) => {
      // Batting stats
      inning.batsmen.forEach(({ name, runs, balls, outDesc }) => {
        if (!allPlayerStats[name]) allPlayerStats[name] = initializePlayerStats(name);
        playersInThisMatch.add(name);

        const player = allPlayerStats[name];
        player.batting.innings += 1;
        player.batting.runs += runs;
        player.batting.balls += balls;

        if (outDesc && !/^\s*not\s*out\s*$/i.test(outDesc)) {
          player.batting.outs += 1;
          if (runs === 0) player.batting.ducks = (player.batting.ducks || 0) + 1; // Count ducks
        } else {
          player.batting.notOuts += 1;
        }

        player.batting.highScore = Math.max(player.batting.highScore, runs);
        if (runs >= 50 && runs < 100) player.batting.fifties += 1;
        if (runs >= 100) player.batting.hundreds += 1;

        player.seriesPlayed.add(series);
        player.yearsPlayed.add(year);

        // Fielding from outDesc
        if (outDesc) {
          const catchRegex = /^c\s+([a-z\s.]+?)(?:\s+b|$)/i;
          const catchMatch = outDesc.match(catchRegex);
          if (catchMatch && catchMatch[1]) {
            const fielderName = catchMatch[1].trim();
            if (!allPlayerStats[fielderName]) allPlayerStats[fielderName] = initializePlayerStats(fielderName);
            playersInThisMatch.add(fielderName);
            allPlayerStats[fielderName].fielding.catches += 1;
            allPlayerStats[fielderName].seriesPlayed.add(series);
            allPlayerStats[fielderName].yearsPlayed.add(year);
          }

          const runoutRegex = /run\s*out\s*\(([^)]+)\)/i;
          const runoutMatch = outDesc.match(runoutRegex);
          if (runoutMatch && runoutMatch[1]) {
            const fielderNames = runoutMatch[1].split('/').map(name => name.trim());
            fielderNames.forEach(fielderName => {
              if (!allPlayerStats[fielderName]) allPlayerStats[fielderName] = initializePlayerStats(fielderName);
              playersInThisMatch.add(fielderName);
              allPlayerStats[fielderName].fielding.runOuts += 1;
              allPlayerStats[fielderName].seriesPlayed.add(series);
              allPlayerStats[fielderName].yearsPlayed.add(year);
            });
          }
        }
      });

      // Bowling stats
      inning.bowlers.forEach(({ name, overs, runs, wickets, maidens }) => {
        if (!allPlayerStats[name]) allPlayerStats[name] = initializePlayerStats(name);
        playersInThisMatch.add(name);

        const player = allPlayerStats[name];
        player.bowling.innings += 1;
        player.bowling.overs = addOvers(player.bowling.overs || 0, Number(overs));
        player.bowling.runs += runs;
        player.bowling.wickets += wickets;
        player.bowling.maidens += maidens || 0;
        if (wickets > 2) { player.bowling.wi3 += 1; }

        const best = player.bowling.bestBowlingInnings;
        if (wickets > best.wickets || (wickets === best.wickets && runs < best.runs)) {
          player.bowling.bestBowlingInnings = { wickets, runs };
        }

        player.seriesPlayed.add(series);
        player.yearsPlayed.add(year);
      });
    });

    playersInThisMatch.forEach(playerName => {
      if (allPlayerStats[playerName]) allPlayerStats[playerName].matchesPlayed++;
    });
  });

  const overallPlayerStats = Object.values(allPlayerStats).map((player) => {
    const totalRuns = player.batting.runs;
    const totalBalls = player.batting.balls;
    const totalOuts = player.batting.outs;
    const totalOvers = player.bowling.overs;
    const runsConceded = player.bowling.runs;

    const battingAvg = totalOuts > 0 ? (totalRuns / totalOuts).toFixed(2) : '-';
    const battingSR = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(2) : '0.00';
    const bowlingEco = totalOvers > 0 ? (runsConceded / totalOvers).toFixed(2) : '0.00';

    const best = player.bowling.bestBowlingInnings;
    const bestBowling = best.wickets > 0 ? `${best.wickets}/${best.runs}` : '-';

    return {
      name: player.name,
      matchesPlayed: player.matchesPlayed,
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
      ducks: player.batting.ducks || 0,

      bowlingInnings: player.bowling.innings,
      overs: totalOvers,
      runsConceded,
      wickets: player.bowling.wickets,
      maidens: player.bowling.maidens,
      bestBowling,
      economy: bowlingEco,
      threeWicketHauls: player.bowling.wi3 || 0,

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
    uniqueSeries.add(match.matchInfo.teams.slice().sort().join(' vs '));
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

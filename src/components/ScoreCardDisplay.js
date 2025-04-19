import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './ScorecardDisplay.css';
import stringSimilarity from 'string-similarity';

const socket = io('https://wccbackendoffl.onrender.com');

function ScoreCardDisplay() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scorecards, setScorecards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef(null);

  const fetchScorecards = () => {
    fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard')
      .then((res) => res.json())
      .then((data) => {
        setScorecards(data);
        setCurrentIndex(0);
      })
      .catch((err) => {
        console.error('Error fetching scorecards:', err);
        alert('Failed to load scorecards, please try again later.');
      });
  };

  useEffect(() => {
    fetchScorecards();

    const handleNewScorecard = () => {
      console.log('📥 New scorecard received');
      fetchScorecards();
    };

    socket.on('connect', () => {
      console.log('🟢 Connected to socket');
    });

    socket.on('newScorecard', handleNewScorecard);

    return () => {
      socket.off('newScorecard', handleNewScorecard);
      socket.disconnect();
    };
  }, []);

  const promptUserForNameSuggestions = async (suggestions) => {
    // Prompt the user for name corrections or accept the suggested names
    const updated = [];
  
    for (const { original, suggested } of suggestions) {
      const userInput = prompt(
        `Missing Player: "${original}"\nSuggested Match: "${suggested}"\n\nPress OK to accept or type a corrected name:`,
        suggested
      );
  
      if (userInput === null) {
        // User cancelled
        return null;
      }
  
      updated.push({ original, updated: userInput });
    }
  
    return updated;
  };
  
  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF!');
    if (file.type !== 'application/pdf') return alert('Only PDF files are allowed!');
  
    const formData = new FormData();
    formData.append('pdf', file);
    setUploading(true);
  
    try {
      const validationRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard/validateStumpsReport', {
        method: 'POST',
        body: formData,
      });
  
      const { isValid } = await validationRes.json();
      if (!isValid) {
        alert('❌ This PDF is not a STUMPS match report. Please upload a valid STUMPS report.');
        return;
      }
  
      const extractionRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard/extractPlayerNames', {
        method: 'POST',
        body: formData,
      });
  
      const { playerNames: extractedNames } = await extractionRes.json();
  
      const validationPlayerNamesRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard/validatePlayerNames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerNames: extractedNames }),
      });
  
      const data = await validationPlayerNamesRes.json();
      const missingPlayers = data.missingPlayers || [];
  
      if (missingPlayers.length > 0) {
        const playerStatsRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard/playerstat');
        const playerStats = await playerStatsRes.json();
        const allNamesFromDB = playerStats.map(p => p.name);
  
        // Replace promptUserForNameSuggestions with dropdown selection
        const userConfirmedUpdates = [];
  
        for (const missing of missingPlayers) {
          const selected = window.prompt(
            `Select the correct name for "${missing}" from the player list (copy/paste one):\n\n` + 
            allNamesFromDB.join('\n')
          );
  
          if (!selected) {
            alert('Upload cancelled.');
            return;
          }
  
          userConfirmedUpdates.push({ original: selected, updated: missing });
        }
  
        const updateRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard/updatePlayerNames', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: userConfirmedUpdates }),
        });
  
        const updateData = await updateRes.json();
        if (updateData.success) {
          alert('✅ Player names updated successfully!');
          const nameList = extractedNames.map(name => {
            const updatedEntry = userConfirmedUpdates.find(u => u.original === name);
            return updatedEntry ? `${updatedEntry.original} → ${updatedEntry.updated}` : name;
          });
          alert("📋 Final player name list:\n\n" + nameList.join("\n"));
        } else {
          throw new Error('Failed to update player names.');
        }
      }
  
      const uploadRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard', {
        method: 'POST',
        body: formData,
      });
  
      const uploadData = await uploadRes.json();
      alert('✅ Uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchScorecards();
  
    } catch (err) {
      console.error(err);
      alert(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };
  
  
  

  const formatResult = (result) => {
    if (!result) return '';
  
    // 1. Remove any 4-digit year-like numbers (2023, 2024, etc.)
    result = result.replace(/\d{4}/g, ' ');
    result = result.replace(/notout/gi, 'not out');
    // 2. Insert spaces where needed (camelCase or glued words)
    result = result
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])(\d+)/g, '$1 $2')
      .replace(/(\d+)([a-zA-Z])/g, '$1 $2')
      .replace(/(won|lost|beat|lostwith|wonwith)(by|with)/g, '$1 $2');
  
    // 3. Trim and normalize whitespace
    result = result.trim().replace(/\s+/g, ' ');
  
    // 4. Fix team name casing: convert uppercase words like TEAMJAYANTH → Team Jayanth
    result = result
      .split(' ')
      .map((word) => {
        if (/^TEAM[A-Z]{3,}$/.test(word)) {
          const namePart = word.replace(/^TEAM/, '');
          return 'Team ' + namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
        } else if (/^[A-Z]{3,}$/.test(word)) {
          return word
            .charAt(0)
            .toUpperCase() + word.slice(1).toLowerCase();
        } else {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      })
      .join(' ');
  
    return result;
  };
  
  const currentMatch = scorecards[currentIndex];

  return (
    <div className="scorecard-display-container">
    <div className="scorecard-display-upload">
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={(e) => setFile(e.target.files[0])}
        disabled={uploading}
      />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? <><span className="score-spinner"></span><p>Validating and Uploading</p></>: 'Upload PDF'}
      </button>
    </div>
  
    <div className="scorecard-display-match-card">
      {scorecards.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          No scorecards available. Please upload a scorecard.
        </p>
      ) : (
        <>
          <h2>{formatResult(currentMatch.matchInfo?.teams?.join(' vs '))}</h2>
          <p><b>Venue:</b> {formatResult(currentMatch.matchInfo?.venue)} | <b>Date:</b> {formatResult(currentMatch.matchInfo?.date)}</p>
          <p><b>Toss:</b> {formatResult(currentMatch.matchInfo?.toss)}</p>
          <p><b>Result:</b> {formatResult(currentMatch.matchInfo?.result)}</p>
          <p><b>Player of the Match:</b> {currentMatch.matchInfo?.playerOfMatch || '-'}</p>
  
          {currentMatch.innings?.map((inn, i) => (
            <div key={i} className="scorecard-display-innings">
              <h3>{inn.team} - {inn.total} ({inn.overs} overs)</h3>
  
              <h4>Batting</h4>
              <table>
                <thead>
                  <tr>
                    <th>Batsman</th>
                    <th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th><th>Dismissal</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.batsmen?.map((p, idx) => (
                    <tr key={idx}>
                      <td>{p.name}</td>
                      <td>{p.runs}</td>
                      <td>{p.balls}</td>
                      <td>{p.fours}</td>
                      <td>{p.sixes}</td>
                      <td>{p.sr}</td>
                      <td>{formatResult(p.outDesc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p> </p>
              {inn.fallOfWickets?.length > 0 && (
                <p><b>Fall of Wickets:</b> {inn.fallOfWickets.join(', ')}</p>
              )}
          <p><b>Run Rate:</b> {inn.runRate || 'N/A'} | <b>Extras:</b> {inn.extras || '0'}</p>
              <h4>Bowling</h4>
              <table>
                <thead>
                  <tr>
                    <th>Bowler</th>
                    <th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th>
                    <th>0s</th><th>4s</th><th>6s</th><th>WD</th><th>NB</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.bowlers?.map((b, idx) => (
                    <tr key={idx}>
                      <td>{b.name}</td>
                      <td>{b.overs}</td>
                      <td>{b.maidens}</td>
                      <td>{b.runs}</td>
                      <td>{b.wickets}</td>
                      <td>{b.eco}</td>
                      <td>{b.dots}</td>
                      <td>{b.fours}</td>
                      <td>{b.sixes}</td>
                      <td>{b.wd}</td>
                      <td>{b.nb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
  
          {scorecards.length > 1 && (
            <div className="scorecard-display-nav">
              <button onClick={() => setCurrentIndex((prev) => (prev + 1) % scorecards.length)}>
                View Previous
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
  );  
}

export default ScoreCardDisplay;

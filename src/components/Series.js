import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TeamCard from "./TeamCard";
import CustomAlert from "./CustomAlert";
import { Link, useNavigate } from "react-router-dom";
import FilterSeries from "./FilterSeries";
import "./Series.css";
import "./ScoreCard.css";
import ScoreCard from './ScoreCard';
import ConfirmModal from "./ConfirmModal";
import NotificationAlert from "./NotificationAlert";
import socket from "./socket";

const API_BASE_URL = "https://wccbackendoffl.onrender.com";


const Series = () => {
  const [teamA, setTeamA] = useState({
    teamId: "team1",
    teamName: "Team A",
    captain: "Unknown",
    points: 0,
    results: [],
    coreTeam: [],
    prevSeries: [],
  });

  const [teamB, setTeamB] = useState({
    teamId: "team2",
    teamName: "Team B",
    captain: "Unknown",
    points: 0,
    results: [],
    coreTeam: [],
    prevSeries: [],
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [lastWinner, setLastWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // New state for disabling buttons
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seriesHistory, setSeriesHistory] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showWinButtons, setShowWinButtons] = useState(false);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filterTableRefreshKey, setFilterTableRefreshKey] = useState(0);
  const [allScorecards, setAllScorecards] = useState([]);
  const [showAllPopup, setShowAllPopup] = useState(false);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scorecards, setScorecards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef(null);

  const [alert, setAlert] = useState({
    message: "",
    type: "",
    persistent: false,
  });
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    action: null,
    message: "",
  });

  useEffect(() => {
    fetchAllSeriesHistory();
    fetchTeams();
    fetchScorecards();
    const adminStatus = sessionStorage.getItem("admin") === "Y";
    const userLoggedIn = sessionStorage.getItem("username") !== null;
    setIsAdmin(adminStatus);
    setIsLoggedIn(userLoggedIn);
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

  const showAlert = (message, type = "success", persistent = false) => {
    setAlert({ message, type});
    if (!persistent) {
      setTimeout(
        () => setAlert({ message: "", type: "", persistent: false }),
        2000
      );
    }
  };

  const fetchScorecards = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/uploadScorecard`);
      setAllScorecards(res.data);
    } catch (err) {
      console.error('Failed to load scorecards', err);
    }
  };

  const fetchAllSeriesHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/team/series-history`);
      const fetchedHistory = response.data.seriesHistory || [];

      const formattedHistory = fetchedHistory.map((series) => ({
        ...series,
        teamA: series.teams?.teamA || "Unknown Team A",
        teamB: series.teams?.teamB || "Unknown Team B",
      }));

      setSeriesHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching series history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      const { team1, team2 } = response.data || {};
      setTeamA({ ...teamA, ...team1 });
      setTeamB({ ...teamB, ...team2 });
      showAlert("Teams updated!");
    } catch (error) {
      console.error("Error fetching teams:", error);
      showAlert("Error fetching teams.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWin = async (team) => {
    if (!isAdmin) return;
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/team/update-points`, { winnerId: team === "A" ? "team1" : "team2" });
      setLastWinner(team === "A" ? "team1" : "team2");
      fetchTeams();
      showAlert(`Team ${team} wins!`);
    } catch (error) {
      console.error("Error updating points:", error);
      showAlert("Error updating points.", "error");
    } finally {
      setActionLoading(false);
    }
  };
  const confirmAction = (actionFn, message) => {
    setConfirmModal({ show: true, action: actionFn, message });
  };

  const handleResetLatestScore = async () => {
    if (!isAdmin || !lastWinner) return;
    confirmAction(async () => {
      setActionLoading(true);
      try {
        const response = await axios.put(`${API_BASE_URL}/api/team/revert`, {
          lastWinnerId: lastWinner,
        });

        if (response.status === 200) {
          setLastWinner(null);
          fetchTeams();
          showAlert("Last result reverted successfully!");
        } else {
          showAlert("Error reverting latest result.", "error");
        }
      } catch (error) {
        console.error("Error reverting score:", error);
        showAlert("Error reverting latest result.", "error");
      } finally {
        setActionLoading(false);
        setConfirmModal({ show: false, action: null, message: "" });
      }
    }, "Are you sure you want to revert the last result?");
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

  const handleEndSeries = async () => {
    if (!isAdmin) return;
    confirmAction(async () => {
      setActionLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/team/end-series`);

        if (response.status === 200) {
          const { winningTeam } = response.data;

          setWinner({
            captain: winningTeam?.captain || "No winner",
            team: winningTeam?.teamName || "Draw",
          });

          showAlert(
            `Series Ended! Winning Team: ${winningTeam?.teamName || "Draw"}, Captain: ${winningTeam?.captain || "None"}`
          );

          fetchTeams();
          fetchAllSeriesHistory();
          setFilterTableRefreshKey((prev) => prev + 1);
        } else {
          showAlert("Error ending series.", "error");
        }
      } catch (error) {
        console.error("Error ending series:", error);
        showAlert("Error ending series.", "error");
      } finally {
        setActionLoading(false);
        setConfirmModal({ show: false, action: null, message: "" });
      }
    }, "Are you sure you want to end the series?");
  };

  const toggleCollapse = () => setIsOpen(!isOpen);
  useEffect(() => {
    if (showAllPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showAllPopup]);

const [alert2, setAlert2] = useState(null);

const displayNotification = (message, type = 'success') => {
  setAlert2({ message, type });
  setTimeout(() => {
    setAlert2(null); // Hide the notification after 4 seconds
  }, 4000);
};


  const handleUpload = async () => {
    if (!file) return displayNotification('Please select a PDF!', 'error');
    if (file.type !== 'application/pdf') return displayNotification('Only PDF files are allowed!', 'error');
  
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
        return displayNotification('❌ This PDF is not a STUMPS match report. Please upload a valid STUMPS report.', 'error');
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
  
        const userConfirmedUpdates = [];
  
        for (const missing of missingPlayers) {
          const selected = window.prompt(
            `Select the correct name for "${missing}" from the player list (copy/paste one):\n\n` +
            allNamesFromDB.join('\n')
          );
  
          if (!selected) {
            displayNotification('Upload cancelled.', 'error');
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
          displayNotification('✅ Player names updated successfully!');
          const nameList = extractedNames.map(name => {
            const updatedEntry = userConfirmedUpdates.find(u => u.original === name);
            return updatedEntry ? `${updatedEntry.original} → ${updatedEntry.updated}` : name;
          });
          displayNotification("📋 Final player name list:\n\n" + nameList.join("\n"));
        } else {
          throw new Error('Failed to update player names.');
        }
      }
  
      const uploadRes = await fetch('https://wccbackendoffl.onrender.com/api/uploadScorecard', {
        method: 'POST',
        body: formData,
      });
  
      const uploadData = await uploadRes.json();
      displayNotification('✅ Uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchScorecards();
  
    } catch (err) {
      console.error(err);
      displayNotification(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };
  


  return (
    <div className="homepage">
      {/* {alert2.message && <NotificationAlert message={alert.message} type={alert.type} onClose={() => setAlert2(null)} />} */}

      {alert.message && (
        <NotificationAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "", persistent: false })}
          persistent={alert.persistent}
        />
      )}
      <h2>Series Information</h2>

      <div className="team-container">
        <TeamCard {...teamA} onUpdate={fetchTeams} />
        <TeamCard {...teamB} onUpdate={fetchTeams} />
      </div>
      {isAdmin && (
        <div className="admin-section">
          <button
            className="admin-toggle-btn"
            onClick={() => setShowAdminControls(prev => !prev)}
          >
            {showAdminControls ? 'Hide Admin Controls' : 'Admin Controls'}
          </button>

          {showAdminControls && (
            <div className="admin-controls">
              {!showWinButtons ? (
                <button
                  className="update-score-btn"
                  onClick={() => setShowWinButtons(true)}
                  disabled={loading || actionLoading}
                >
                  Update Score
                </button>
              ) : (
                <div className="win-btns-container">
                  <button
                    className="match-btn win-btn"
                    onClick={() => handleWin("A")}
                    disabled={actionLoading}
                  >
                    Team A Wins
                  </button>
                  <button
                    className="match-btn loss-btn"
                    onClick={() => handleWin("B")}
                    disabled={actionLoading}
                  >
                    Team B Wins
                  </button>
                  <button
                    className="cancel-cross"
                    onClick={() => setShowWinButtons(false)}
                  >
                    ❌
                  </button>
                </div>
              )}

              {!showWinButtons && (
                <>
                  <button
                    className="reset-btn"
                    onClick={handleResetLatestScore}
                    disabled={!lastWinner || actionLoading}
                  >
                    Revert Last Result
                  </button>
                  <button
                    className="end-btn"
                    onClick={handleEndSeries}
                    disabled={actionLoading}
                  >
                    End-Series
                  </button>
                  <div className="scorecard-display-upload">
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={fileInputRef}
                      onChange={(e) => setFile(e.target.files[0])}
                      disabled={uploading}
                    />
                    <button onClick={handleUpload} disabled={uploading || !file}>
                      {uploading ? (
                        <>
                          <span className="score-spinner"></span>
                          <p>Validating and Uploading</p>
                        </>
                      ) : (
                        'Upload PDF'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="results-section">
        <h2>Match Results</h2>

        <div className="results-grid">
          {allScorecards.slice(0, 3).map((card, index) => (
            <div
              key={index}
              className="result-card"
              onClick={() => setSelectedScorecard(card)}
            >
              <div className="teams">
                <span>{formatResult(card.matchInfo?.teams?.[0])}</span>
                <span className="vs">vs</span>
                <span>{formatResult(card.matchInfo?.teams?.[1])}</span>
              </div>
              <div className="result-summary">{formatResult(card.matchInfo?.result)}</div>
              <div className="match-meta">{card.matchInfo?.venue?.trim() || 'Nidhi'} | {card.matchInfo?.date}</div>
            </div>
          ))}

          {allScorecards.length > 3 && (
            <div className="view-all-wrapper">
              <button className="view-all-button" onClick={() => setShowAllPopup(true)}>
                View All Matches
              </button>
            </div>
          )}

        </div>

        {/* All Results Popup */}
        {showAllPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <button className="close-popup" onClick={() => setShowAllPopup(false)}>✖</button>
              <h2 className="popup-title">All Matches</h2>
              <div className="popup-results-grid">
                {allScorecards.map((card, index) => (
                  <div
                    key={index}
                    className="result-card"
                    onClick={() => {
                      setSelectedScorecard(card);
                      setShowAllPopup(false);
                    }}
                  >
                    <div className="teams">
                      <span>{card.matchInfo?.teams?.[0]}</span>
                      <span className="vs">vs</span>
                      <span>{card.matchInfo?.teams?.[1]}</span>
                    </div>
                    <div className="result-summary">{formatResult(card.matchInfo?.result)}</div>
                    <div className="match-meta">{card.matchInfo?.venue} | {card.matchInfo?.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scorecard Details */}
        {selectedScorecard && (
          <ScoreCard currentMatch={selectedScorecard} onClose={() => setSelectedScorecard(null)} />
        )}
      </div>


      <div className="match-coverage-container">
        {loading && <p>Loading series history...</p>}
        {seriesHistory.length === 0 ? (
          <p>No series history found.</p>
        ) : (
          <>
            <div>
              <button onClick={toggleCollapse} className="collapsible-header">
                Past series Scorelines: {isOpen ? "▲" : "▼"}
              </button>
              <FilterSeries initialData={seriesHistory} isOpen={isOpen} key={filterTableRefreshKey} />
            </div>
          </>
        )}
      </div>
      {confirmModal.show && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal({ show: false, action: null, message: "" })}
        />
      )}

    </div>
  );
};

export default Series;

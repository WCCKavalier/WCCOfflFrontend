import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TeamCard from "./TeamCard";
import { Link, useNavigate } from "react-router-dom";
import FilterSeries from "./FilterSeries";
import "./Series.css";
import "./ScoreCard.css";
import ScoreCard from './ScoreCard';
import ConfirmModal from "./ConfirmModal";
import NotificationAlert from "./NotificationAlert";
import socket from "./socket";
import { showPlayerSelectionModal } from './PlayerSelectModal';
import './selectModal.css';

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
  const [showUploadOptions, setShowUploadOptions] = useState(false);
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
    setAlert({ message, type });
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
      if (team1.isRevert) {
        setLastWinner('team1');
      } else if (team2.isRevert) {
        setLastWinner('team2');
      } else {
        setLastWinner(null);
      }
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

      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      const { team1, team2 } = response.data || {};

      setTeamA((prev) => ({ ...prev, ...team1 }));
      setTeamB((prev) => ({ ...prev, ...team2 }));

      // 🔥 Update lastWinner based on isRevert field
      if (team1.isRevert) setLastWinner("team1");
      else if (team2.isRevert) setLastWinner("team2");
      else setLastWinner(null);

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
          // 🔥 Re-fetch team data and update lastWinner based on isRevert
          const teamsResponse = await axios.get(`${API_BASE_URL}/api/teams`);
          const { team1, team2 } = teamsResponse.data || {};

          setTeamA((prev) => ({ ...prev, ...team1 }));
          setTeamB((prev) => ({ ...prev, ...team2 }));

          if (team1.isRevert) setLastWinner("team1");
          else if (team2.isRevert) setLastWinner("team2");
          else setLastWinner(null);

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

  const handleRevertLastMatch = async () => {
    if (!isAdmin) return;

    confirmAction(async () => {
      setActionLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/uploadScorecard/revertscorecard`);

        if (response.status === 200) {
          // 🔄 Re-fetch team data after revert
          const teamsResponse = await axios.get(`${API_BASE_URL}/api/teams`);
          const { team1, team2 } = teamsResponse.data || {};

          setTeamA((prev) => ({ ...prev, ...team1 }));
          setTeamB((prev) => ({ ...prev, ...team2 }));

          // Clear last winner info since match was deleted
          if (team1.isRevert) setLastWinner("team1");
          else if (team2.isRevert) setLastWinner("team2");
          else setLastWinner(null);

          showAlert("✅ Last match, stats, and points successfully reverted!");
        } else {
          showAlert("❌ Failed to revert last match.", "error");
        }
      } catch (error) {
        console.error("Error reverting last match:", error);
        showAlert("❌ Error reverting last match.", "error");
      } finally {
        setActionLoading(false);
        setConfirmModal({ show: false, action: null, message: "" });
      }
    }, "Are you sure you want to completely revert the last match?");
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

    const fetchJSON = async (url, options = {}) => {
      const res = await fetch(url, options);
      return await res.json();
    };

    try {
      // Step 1: Validate STUMPS report
      const { isValid } = await fetchJSON('https://wccbackendoffl.onrender.com/api/uploadScorecard/validateStumpsReport', {
        method: 'POST',
        body: formData,
      });

      if (!isValid) {
        return displayNotification('❌ This PDF is not a STUMPS match report. Please upload a valid STUMPS report.', 'error');
      }

      // Step 2: Extract player names
      const { playerNames: extractedNames } = await fetchJSON('https://wccbackendoffl.onrender.com/api/uploadScorecard/extractPlayerNames', {
        method: 'POST',
        body: formData,
      });

      // Step 3: Validate player names
      const { missingPlayers = [] } = await fetchJSON('https://wccbackendoffl.onrender.com/api/uploadScorecard/validatePlayerNames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerNames: extractedNames }),
      });

      // Step 4: Handle missing players with dropdown selection
      if (missingPlayers.length > 0) {
        const playerStats = await fetchJSON('https://wccbackendoffl.onrender.com/api/uploadScorecard/playerstat');
        const allNamesFromDB = playerStats.map(p => p.name);

        const userConfirmedUpdates = [];

        for (const missing of missingPlayers) {
          const selected = await new Promise((resolve) => {
            showPlayerSelectionModal(missing, allNamesFromDB, resolve, () => resolve(null));
          });

          if (!selected) {
            displayNotification('Upload cancelled.', 'error');
            return;
          }

          userConfirmedUpdates.push({ original: selected, updated: missing });
        }



        const updateRes = await fetchJSON('https://wccbackendoffl.onrender.com/api/uploadScorecard/updatePlayerNames', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: userConfirmedUpdates }),
        });

        if (updateRes.success) {
          displayNotification('✅ Player names updated successfully!');
          const nameList = extractedNames.map(name => {
            const updated = userConfirmedUpdates.find(u => u.original === name);
            return updated ? `${updated.original} → ${updated.updated}` : name;
          });
          displayNotification("📋 Final player name list:\n\n" + nameList.join("\n"));
        } else {
          throw new Error('Failed to update player names.');
        }
      }

      // Step 5: Final upload
      const uploadData = await fetchJSON('https://wccbackendoffl.onrender.com/api/uploadScorecard', {
        method: 'POST',
        body: formData,
      });

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
              {/* Update Points Without Scorecard */}
              <div>
                <button
                  className="update-score-btn"
                  onClick={() => setShowWinButtons(!showWinButtons)}
                  disabled={loading || actionLoading}
                >
                  Update points without scorecard
                </button>

                {showWinButtons && (
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
                      className="reset-btn"
                      onClick={handleResetLatestScore}
                      disabled={!lastWinner || actionLoading}
                    >
                      Revert Last Result
                    </button>
                    <button
                      className="cancel-cross"
                      onClick={() => setShowWinButtons(false)}
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>

              {/* Update Points With Scorecard */}
              <div>
                <button
                  className="update-score-btn"
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                  disabled={loading || actionLoading}
                >
                  Update points with scorecard
                </button>

                {showUploadOptions && (
                  <div className="scorecard-display-upload">
                    <button
                      className="reset-btn"
                      onClick={handleRevertLastMatch}
                      disabled={!lastWinner || actionLoading}
                    >
                      Revert Last Result Scorecard
                    </button>

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
                    <button
                      onClick={() => {
                        setShowUploadOptions(false);
                        setFile(null);
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* End Series Button */}
              <div>
                <button
                  className="end-btn"
                  onClick={handleEndSeries}
                  disabled={actionLoading}
                >
                  End-Series
                </button>
              </div>
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

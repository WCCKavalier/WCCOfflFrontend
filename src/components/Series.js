import React, { useState, useEffect } from "react";
import axios from "axios";
import TeamCard from "./TeamCard";
import CustomAlert from "./CustomAlert";
import { Link, useNavigate } from "react-router-dom";
import FilterSeries from "./FilterSeries";
import "./Series.css";
import "./ScoreCard.css";
import ScoreCard from './ScoreCard';
import ConfirmModal from "./ConfirmModal";

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
  }, []);

  const showAlert = (message, type = "success", persistent = false) => {
    setAlert({ message, type, persistent });
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

  return (
    <div className="homepage">
      {alert.message && (
        <CustomAlert
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
            </>
          )}
        </div>
      )}
      <div className="series-container">
      <h1>Series Scorecards</h1>

      {/* Preview of Scorecards (up to 3) */}
      <div className="scorecard-preview-container">
        {allScorecards.slice(0, 3).map((card, index) => (
          <div
            key={index}
            className="scorecard-box"
            onClick={() => setSelectedScorecard(card)}
          >
            {card.matchInfo?.teams?.join(" vs ")}<br />
            <small>{formatResult(card.matchInfo?.result)}</small>
            <p>{card.result}</p>
          </div>
        ))}
        {allScorecards.length > 3 && (
          <button className="view-all-btn" onClick={() => setShowAllPopup(true)}>
            View All
          </button>
        )}
      </div>

      {/* Popup to Show All Scorecards */}
      {showAllPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="series-close-btn" onClick={() => setShowAllPopup(false)}>✖</button>
            <h2>All Matches</h2>
            <div className="scorecard-popup-grid">
              {allScorecards.map((card, index) => (
                <div
                  key={index}
                  className="scorecard-box"
                  onClick={() => {
                    setSelectedScorecard(card);
                    setShowAllPopup(false);
                  }}
                >
                  {card.matchInfo?.teams?.join(" vs ")}<br />
                  <small>{formatResult(card.matchInfo?.result)}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popup for Scorecard Details */}
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

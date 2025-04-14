import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TeamCard.css";

const API_BASE_URL = "https://wccbackend.onrender.com";

const TeamCard = ({
  teamId,
  teamName,
  captain,
  points,
  score,
  coreTeam,
  prevSeries,
  onUpdate,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(teamName);
  const [editedCaptain, setEditedCaptain] = useState(captain);
  const [editedCoreTeam, setEditedCoreTeam] = useState(coreTeam.join(", "));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // Reset form values when entering edit mode
  useEffect(() => {
    if (editMode) {
      setEditedName(teamName);
      setEditedCaptain(captain);
      setEditedCoreTeam(coreTeam.join(", "));
    }
  }, [editMode, teamName, captain, coreTeam]);

  useEffect(() => {
      const adminStatus = sessionStorage.getItem("admin") === "Y";
      const userLoggedIn = sessionStorage.getItem("username") !== null;
      setIsAdmin(adminStatus);
      setIsLoggedIn(userLoggedIn);
    }, []);
  

  const validateInputs = () => {
    const teamWords = editedName.trim().split(/\s+/);
    if (teamWords.length !== 2 || teamWords.some(word => word.length > 9)) {
      setErrorMessage("Team Name must have exactly two words, each max 9 characters!");
      return false;
    }
    if (!editedCaptain.trim()) {
      setErrorMessage("Captain Name cannot be empty!");
      return false;
    }
    if (!editedCoreTeam.trim()) {
      setErrorMessage("Core Team cannot be empty!");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return; // Stop saving if validation fails
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/team`, {
        teamId,
        teamName: editedName,
        captain: editedCaptain,
        coreTeam:
          editedCoreTeam.trim() !== ""
            ? editedCoreTeam.split(",").map((member) => member.trim())
            : coreTeam,
      });

      onUpdate(); // Refresh after update
      setEditMode(false);
    } catch (error) {
      console.error("Error updating team:", error);
      setErrorMessage("Failed to update team. Please try again.");
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-card">
      {editMode ? (
        <div className="edit-mode">
          <label>Team Name</label>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <label>Captain</label>
          <input
            type="text"
            value={editedCaptain}
            onChange={(e) => setEditedCaptain(e.target.value)}
          />
          <label>Core Team (comma-separated)</label>
          <textarea
            value={editedCoreTeam}
            onChange={(e) => setEditedCoreTeam(e.target.value)}
          />
          {/* Error Message Display */}
          {errorMessage && <p className="error-msg">{errorMessage}</p>}
          <div className="edit-buttons">
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              💾 Save
            </button>
            <button className="cancel-btn-team" onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2>
          {teamName.split(" ").length > 1 ? (
            <>
              {teamName.split(" ")[0]} <br /> {teamName.split(" ").slice(1).join(" ")}
            </>
            ) : (
            teamName
            )}
            {isAdmin && (<span
              className="edit-icon"
              onClick={() => setEditMode(true)}
              title="Edit Team Info"
            >
              ⚡️
            </span>)}
          </h2>
          <p>
            <strong>Captain:</strong> {captain || "N/A"}
          </p>
          <p>
            <strong>Points:</strong> {points || 0}
          </p>
          <div className="score">
            {(score || []).slice(-4).map((result, index) => (
              <span
                key={index}
                className={`result ${
                  result === "W" ? "win" : result === "L" ? "loss" : "neutral"
                }`}
              >
                {result}
              </span>
            ))}
          </div>
          <h4>Core Team</h4>
          <ul>
            {coreTeam.length > 0
              ? coreTeam.map((member, index) => <li key={index}>{member}</li>)
              : "N/A"}
          </ul>
        </>
      )}
    </div>
  );
};

export default TeamCard;

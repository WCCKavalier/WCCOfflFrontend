import React, { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
    const [teams, setTeams] = useState({
        team1: { teamId: "team1", teamName: "", captain: "", coreTeam: [] },
        team2: { teamId: "team2", teamName: "", captain: "", coreTeam: [] }
    });
    const [activeForm, setActiveForm] = useState(null);
    const [formData, setFormData] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [showWinButtons, setShowWinButtons] = useState(false);
    const [lastWinner, setLastWinner] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [winner, setWinner] = useState(null);
    const API_BASE_URL = "https://wccbackend.onrender.com";

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/teams`);
            setTeams(response.data || {
                team1: { teamId: "team1", teamName: "", captain: "", coreTeam: [], points: 0, score: [] },
                team2: { teamId: "team2", teamName: "", captain: "", coreTeam: [], points: 0, score: [] }
            });
            setErrorMessage("");
        } catch (error) {
            const errorMsg = error.response?.data?.error.errorMessage || "An unexpected error occurred";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    if (!teams) return <h1 style={{ color: 'black' }}>Loading teams...</h1>;

    const handleShowForm = (teamId) => {
        setFormData({
            ...teams[teamId],
            coreTeam: teams[teamId].coreTeam.join(", ")
        });
        setActiveForm(teamId);
    };

    const handleChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleSubmit = async (teamId) => {
        try {
            await axios.post(`${API_BASE_URL}/api/team`, {
                teamId,
                teamName: formData.teamName,
                captain: formData.captain,
                coreTeam: formData.coreTeam.split(",").map((name) => name.trim())
            });
            setErrorMessage("");
            setSuccessMessage(`Team ${teamId.toUpperCase()} updated successfully!`);
            fetchTeams();
            setActiveForm(null);
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.error.errorMessage || "An unexpected error occurred";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const updatePoints = () => setShowWinButtons(true);

    const handleWin = async (winnerId) => {
        try {
            await axios.put(`${API_BASE_URL}/api/team/update-points`, { winnerId });
            setErrorMessage("");
            setLastWinner(winnerId);
            fetchTeams();
        } catch (error) {
            const errorMsg = error.response?.data?.error.errorMessage || "An unexpected error occurred";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleRevert = async () => {
        if (!lastWinner) {
            setErrorMessage("No action to revert");
            setTimeout(() => setErrorMessage(""), 2000);}
        try {
            await axios.put(`${API_BASE_URL}/api/team/revert`, { lastWinnerId: lastWinner });
            setLastWinner(null);
            fetchTeams();
        } catch (error) {
            const errorMsg = error.response?.data?.error.errorMessage || "An unexpected error occurred";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleEndSeries = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/team/end-series`);

            if (response.status === 200) {
                const { captain, team } = response.data.winner;
                setWinner({ captain, team });
                setSuccessMessage(`Series Ended! Winning Captain: ${captain}`);
                fetchTeams();
                setTimeout(() => setSuccessMessage(""), 2000);
            } else {
                setErrorMessage("Error ending series.");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error.errorMessage || "An unexpected error occurred";
            setErrorMessage(errorMsg);
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    return (
        <div className="flex flex-col items-center p-5" style={{ color: 'black' }}>
            <h1 className="text-2xl font-bold">Cricket Team Management</h1>
            {successMessage && (
                <div style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
                {errorMessage}
            </div>
            )}

             {/* Display Data */}
             <div style={{ display: "flex", gap: "20px" }}>
                {["team1", "team2"].map(teamId => (
                    <div key={teamId} style={{ border: "1px solid black", padding: "20px", width: "300px" }}>
                        <h2>{teamId.toUpperCase()}</h2>
                        <p><strong>Team Name:</strong> {teams[teamId].teamName || "--"}</p>
                        <p><strong>Captain:</strong> {teams[teamId]?.captain || "--"}</p>
                        <p><strong>Points:</strong> {teams[teamId]?.points || 0}</p>
                        <p><strong>Core Team:</strong>  {teams[teamId].coreTeam.length > 0 ? (teams[teamId].coreTeam.map((member, index) => (<div key={index}>{member}</div>))) : ("--")}</p>
                        <h3 className="mt-3 font-semibold">Last Scores</h3>
                        <div className="flex gap-2">
                            {teams[teamId]?.score?.slice(-3).map((score, index) => (
                                <span key={index} className="border p-2">{score}</span>
                            ))}
                        </div>
                        <p><strong>Previous Season Winner:</strong>{" "}{teams[teamId]?.prevSeries?.length === 2 && teams[teamId]?.teamName === teams[teamId].prevSeries[1]? `${teams[teamId].prevSeries[0]} (Captain of ${teams[teamId].prevSeries[1]})`: "--"}</p>
                        <button onClick={() => handleShowForm(teamId)} className="bg-blue-500 text-black p-2 mt-3 rounded">Update {teamId.toUpperCase()}</button>
                    </div>
                ))}
            </div>

            {/* Update Form (Only visible for the selected team) */}
            {activeForm && (
                <div style={{ border: "1px solid black", padding: "20px", marginTop: "20px", width: "300px" }}>
                    <h2>Update {activeForm.toUpperCase()}</h2>
                    <div>
                        <label>Team Name:</label>
                        <input 
                            type="text" 
                            value={formData.teamName || ""} 
                            onChange={(e) => handleChange("teamName", e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Captain:</label>
                        <input 
                            type="text" 
                            value={formData.captain || ""} 
                            onChange={(e) => handleChange("captain", e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label>Core Team (comma-separated):</label>
                        <input 
                            type="text" 
                            value={formData.coreTeam || ""} 
                            onChange={(e) => handleChange("coreTeam", e.target.value)} 
                            required 
                        />
                    </div>
                    <button onClick={() => handleSubmit(activeForm)} style={{ marginTop: "10px" }}>
                        Submit {activeForm.toUpperCase()}
                    </button>
                </div>
            )}

            <button onClick={updatePoints} className="bg-blue-500 text-black p-3 mt-5 rounded">Update Points</button>

            {showWinButtons && (
                <div className="flex flex-col items-center mt-3">
                    <div className="flex gap-5">
                        {Object.keys(teams).map((teamId) => (
                            <button key={teamId} onClick={() => handleWin(teamId)} className="bg-green-500 text-black p-3 rounded">{teams[teamId]?.teamName || teamId} Win</button>
                        ))}
                    </div>
                    <button onClick={handleRevert} className="bg-red-500 text-black p-2 mt-3 rounded">Revert Last Win</button>
                </div>
            )}
            <div>
                <button onClick={handleEndSeries}>End-Series</button>
            </div>
        </div>
    );
};

export default Home;
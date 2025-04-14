import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./Home2.css"; // Import CSS

const Home2 = () => {
    const [teams, setTeams] = useState({
        team1: { teamName: "Team A", points: 0, score: ["-", "-", "-", "-", "-"] },
        team2: { teamName: "Team B", points: 0, score: ["-", "-", "-", "-", "-"] }
    });

    const [awardData, setAwardData] = useState({
        img: "/img/loading.jpg",
        winner: "--",
        date: "2025-04-01",
        team: "--"
    });

    const navigate = useNavigate(); // Hook for navigation

    const API_BASE_URL = "https://wccbackend.onrender.com";
    const PICTURE_API = "https://wccbackend.onrender.com/api";

    useEffect(() => {
        fetchTeams();
        fetchAwardData();
    }, []);

    useEffect(() => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            const navbarHeight = navbar.offsetHeight;
            const homeWrapper = document.querySelector('.home2-wrapper');
            if (homeWrapper) {
                homeWrapper.style.marginTop = `${navbarHeight}px`;
            }
        }
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/teams`);
            setTeams(response.data || {
                team1: { teamName: "CSK", points: 20, score: ["-", "-", "-", "-"] },
                team2: { teamName: "MI", points: 15, score: ["-", "-", "-", "-"] }
            });
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    const fetchAwardData = async () => {
        try {
            const response = await axios.get(`${PICTURE_API}/image/get-image`);
            if (response.data?.image) {
                setAwardData({
                    img: response.data.image || "/img/loading.jpg",
                    winner: response.data.history?.[0]?.winner || "--",
                    date: response.data.history?.[0]?.date || formatDate("2025-04-01"),
                    team: response.data.history?.[0]?.team || "--"
                });
            }
        } catch (error) {
            console.error("Error fetching award data:", error);
        }
    };

    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split("-");
        const monthNames = {
            "01": "January", "02": "February", "03": "March", "04": "April",
            "05": "May", "06": "June", "07": "July", "08": "August",
            "09": "September", "10": "October", "11": "November", "12": "December"
        };
        return `${day} ${monthNames[month]} ${year}`;
    };

    const trimScores = (scores) => scores?.slice(-4) || [];

    // Navigation handlers
    const handleTeamClick = () => {
        navigate("/teams"); // Redirect to /teams when clicking anywhere inside home2-teams
    };

    const handleAwardClick = () => {
        navigate("/awards"); // Redirect to /awards when clicking anywhere inside home2-award
    };

    return (
            <div className="home2-scorecard">
                {/* Make home2-teams clickable */}
                <div className="home2-teams" onClick={handleTeamClick} style={{ cursor: "pointer" }}>
                    {/* <div className="home2-team-head">CURRENT SERIES SCORE</div> */}
                    <h2>SERIES STATS</h2>
                    <div className="home2-team-top">
                        <div className="home2-team-header">
                            <span className="home2-team-name">{teams?.team1?.teamName.split(" ").length > 1 ? (
                                <>
                                    {teams?.team1?.teamName.split(" ")[0]} <br /> {teams?.team1?.teamName.split(" ").slice(1).join(" ")}
                                </>
                                ) : (
                                    teams?.team1?.teamName
                                )}</span>
                            <span className="home2-team-points">{teams?.team1?.points || 0}</span>
                        </div>
                        <div className="home2-score-history">
                            {trimScores(teams?.team1?.score).map((result, index) => (
                                <span key={index} className={result === "W" ? "win" : result === "L" ? "loss" : "neutral"}>
                                    {result}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="home2-team-bottom">
                        <div className="home2-team-header">
                            <span className="home2-team-name">{teams?.team2?.teamName.split(" ").length > 1 ? (
                                <>
                                    {teams?.team2?.teamName.split(" ")[0]} <br /> {teams?.team2?.teamName.split(" ").slice(1).join(" ")}
                                </>
                                ) : (
                                    teams?.team2?.teamName
                                )}</span>
                            <span className="home2-team-points">{teams?.team2?.points || 0}</span>
                        </div>
                        <div className="home2-score-history">
                            {trimScores(teams?.team2?.score).map((result, index) => (
                                <span key={index} className={result === "W" ? "win" : result === "L" ? "loss" : "neutral"}>
                                    {result}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Make home2-award clickable */}
                <div className="home2-award" onClick={handleAwardClick} style={{ cursor: "pointer" }}>
                    <p className="home2-award-title">🏆 Kava of the Week</p>
                    <img src={awardData.img} alt="Award" className="home2-award-img" />
                    <div className="home2-award-details">
                        <p><span className="home2-detail-header">Winner:</span> {awardData.winner}</p>
                        <p><span className="home2-detail-header">Date:</span> {formatDate(awardData.date)}</p>
                        {/* <p><span className="home2-detail-header">Team:</span> {awardData.team}</p> */}
                    </div>
                </div>
            </div>
    );
};

export default Home2;

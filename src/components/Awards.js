import React, { useState, useEffect } from "react";
import axios from "axios";
import "./award.css";
import CustomAlert from "./CustomAlert";
import FilterAwards from "./FilterAwards";
import kavaHistoryData from "./data";
import { Link, useNavigate } from "react-router-dom";

const PICTURE_API = "https://wccbackend.onrender.com/api";

const Awards = () => {
    const [showForm, setShowForm] = useState(false);
    const [showTable, setShowTable] = useState(false); // State to toggle table visibility
    const [awardData, setAwardData] = useState({
        img: "/img/loading.jpg",
        winner: "--",
        date: "2025-04-01",
        position: "--",
        team: "--"
    });

    const [newData, setNewData] = useState({
        img: "",
        winner: "",
        date: "",
        position: "",
        team: "",
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [message, setMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [history, setHistory] = useState([]);
    const [latestEntry, setLatestEntry] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const response = await axios.get(`${PICTURE_API}/image/get-image`);
            if (response.data.image) {
                setAwardData({
                    img: response.data.image || "/img/loading.jpg",
                    ...response.data.history?.[0] || "--",
                });
                setHistory(response.data.history || []);
                setLatestEntry(response.data.history?.[0] || null);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setMessage("Error fetching data. Try again later.");
        }
    };

    useEffect(() => {
        fetchData();
        const adminStatus = sessionStorage.getItem("admin") === "Y";
        const userLoggedIn = sessionStorage.getItem("username") !== null;
        setIsAdmin(adminStatus);
        setIsLoggedIn(userLoggedIn);
    }, []);

    const toggleForm = () => {
        setShowForm(!showForm);
        setNewData({
            img: "",
            winner: "",
            date: "",
            position: "",
            team: "",
        });
        setImagePreview(null);
    };

    const toggleTable = () => {
        setShowTable(!showTable);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewData({ ...newData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setNewData({ ...newData, img: imageUrl });
            setImageFile(file);
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

    const updateAward = async (e) => {
        if (!isAdmin) return;
        e.preventDefault();

        if (
            !newData.winner ||
            !newData.date ||
            !newData.position ||
            !newData.team ||
            !imageFile
        ) {
            setMessage("Please fill all fields before updating!");
            return;
        }

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("winner", newData.winner);
        formData.append("date", newData.date);
        formData.append("position", newData.position);
        formData.append("team", newData.team);

        try {
            setLoading(true);
            await axios.post(`${PICTURE_API}/image/upload`, formData);
            setSuccessMessage("Award updated successfully!");
            setShowForm(false);
            fetchData();
        } catch (error) {
            setMessage("Error uploading data. Please try again.");
        } finally {
            setLoading(false);
        }

        setNewData({
            img: "",
            winner: "",
            date: "",
            position: "",
            team: "",
        });
        setImagePreview(null);
    };

    useEffect(() => {
        if (message || successMessage) {
            const timer = setTimeout(() => {
                setMessage("");
                setSuccessMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, successMessage]);

    return (
        <>
            {/* Main Title */}
            <div className="awards-container">
                <h2>Kava Awards</h2>

                {/* Award Section */}
                <div className="award-container">
                    <div className="award-section">
                        <div className="award-content">
                            <img
                                src={awardData.img || "/img/loading.jpg"}
                                alt="Kava Award"
                                className="award-img responsive-img"
                            />
                            <h3 className="sub-title">Kava Award of the Week</h3>
                        </div>

                        <div className="award-details">
                            {latestEntry ? (
                                <>
                                    <p><strong>Winner:</strong> {latestEntry.winner}</p>
                                    <p><strong>Date:</strong> {formatDate(latestEntry.date)}</p>
                                    <p><strong>Position:</strong> {latestEntry.position}</p>
                                    <p><strong>Team:</strong> {latestEntry.team}</p>
                                </>
                            ) : (
                                <p>No recent award data available.</p>
                            )}
                            {isAdmin && (
                                <button className="update-btn" onClick={toggleForm}>
                                    Update Kava of the Week
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form as a Pop-up Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal-content responsive-modal">
                            <h3 className="form-title">📝 Update Kava Award</h3>
                            <form onSubmit={updateAward} className="update-form">
                                <input
                                    type="file"
                                    name="img"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="form-control"
                                    required
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="image-preview responsive-img"
                                    />
                                )}
                                <input
                                    type="text"
                                    name="winner"
                                    placeholder="Enter winner name"
                                    value={newData.winner}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={newData.date}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                                <input
                                    type="text"
                                    name="position"
                                    placeholder="Enter position"
                                    value={newData.position}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                                <input
                                    type="text"
                                    name="team"
                                    placeholder="Enter team name"
                                    value={newData.team}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                                <button disabled={loading} type="submit" className="update-btn">
                                    Update Award
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={toggleForm}
                                >
                                    Cancel Update
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Collapsible Awards Table */}
                <div className="history-section">
                    <h3 onClick={toggleTable} className="collapsible-header">
                        📚 Kava Awards Current Series {showTable ? "▼" : "▶"}
                    </h3>
                    {showTable && <FilterAwards initialData={history} isAdmin={isAdmin} fetchData={fetchData} />}
                    {/* {showTable && (
                        <div className="table-container responsive-table">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Winner</th>
                                        <th>Date</th>
                                        <th>Position</th>
                                        <th>Team</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? (
                                        history.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.winner}</td>
                                                <td>{item.date}</td>
                                                <td>{item.position}</td>
                                                <td>{item.team}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: "center" }}>
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )} */}
                </div>

                {/* Stylish Separator */}
                <div className="separator-line"></div>

                {/* History Section */}
                <div className="kava-history-section">
                    <h3>🏅 History of Kava Awards</h3>

                    <div className="kava-history-table-container">
                        <table className="kava-history-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Winner</th>
                                    <th>Image</th>
                                    <th>Matches</th>
                                    <th>Kavas</th>
                                    <th>Win %</th>
                                    <th>More Stats</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...kavaHistoryData]
                                    .sort((a, b) => b.year - a.year)
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.year}</td>
                                            <td>{item.winner}</td>
                                            <td>
                                                <img
                                                    src={item.img}
                                                    alt={item.winner}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                                    }}
                                                />
                                            </td>

                                            <td>{item.matches}</td>
                                            <td>{item.kavas}</td>
                                            <td>{item.percent}</td>
                                            <td>
                                                {item.excel && (
                                                    <a href={item.excel} download title="Download Excel" style={{ marginRight: "10px" }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#217346">
                                                            <path d="M19 2H8c-1.1 0-2 .9-2 2v3H3v10h3v3c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3.5 14h-1.6l-1-1.9-1 1.9H10l1.5-2.6L10 11h1.6l.9 1.7.9-1.7h1.6l-1.4 2.4L15.5 16z" />
                                                        </svg>
                                                    </a>

                                                )}
                                                {item.ppt && (
                                                    <a
                                                        href={item.ppt}
                                                        download
                                                        title="Download PPT"
                                                        style={{ marginLeft: "10px" }}
                                                    >
                                                        📽️
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Awards;

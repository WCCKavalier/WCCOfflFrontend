import React, { useState } from "react";
import "./Awards.css";

function Awards() {
    const [showForm, setShowForm] = useState(false);
    const [awardData, setAwardData] = useState({
        img: "/img/loading.jpg",
        winner: "--",
        date: "2025-04-01",
        position: "--",
        team: "--"
    });

    const [history, setHistory] = useState([
        {
            winner: "John Doe",
            date: "2025-03-30",
            position: "1st",
            team: "Team Alpha",
        },
    ]);

    const [newData, setNewData] = useState({
        img: "",
        winner: "",
        date: "",
        position: "",
        team: "",
    });

    const [imagePreview, setImagePreview] = useState(null);

    // Show/Hide the form
    const toggleForm = () => {
        setShowForm(!showForm);
    };

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewData({ ...newData, [name]: value });
    };

    // Handle file upload and preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);
            setNewData({ ...newData, img: imageUrl });
        }
    };

    // Update award and add to history
    const updateAward = (e) => {
        e.preventDefault();

        // Check if all fields are filled
        if (
            !newData.winner ||
            !newData.date ||
            !newData.position ||
            !newData.team ||
            !newData.img
        ) {
            alert("Please fill all fields before updating!");
            return;
        }

        const updatedData = {
            img: newData.img || awardData.img,
            winner: newData.winner || awardData.winner,
            date: newData.date || awardData.date,
            position: newData.position || awardData.position,
            team: newData.team || awardData.team,
        };

        setAwardData(updatedData);
        setHistory([updatedData, ...history]);
        setShowForm(false);

        // Clear form after update
        setNewData({
            img: "",
            winner: "",
            date: "",
            position: "",
            team: "",
        });
        setImagePreview(null);
    };

    return (
        <>
            {/* Main Title */}
            <div className="title-container">
            <h1 className="text-3xl font-bold text-center mb-6">🏆 Kava Awards</h1>
            </div>

            {/* Award Section */}
            <div className="container2 award-container">
                <div className="award-section">
                    {/* Award Image */}
                    <div className="award-content">
                        <img src={awardData.img} alt="Kava Award" className="award-img" />
                        <h2 className="sub-title">🎉 Kava Award of the Week</h2>
                    </div>

                    {/* Award Details */}
                    <div className="award-details">
                        <p>
                            <strong>Winner:</strong> {awardData.winner}
                        </p>
                        <p>
                            <strong>Date:</strong> {awardData.date}
                        </p>
                        <p>
                            <strong>Position:</strong> {awardData.position}
                        </p>
                        <p>
                            <strong>Team:</strong> {awardData.team}
                        </p>
                        <button className="update-btn" onClick={toggleForm}>
                            Update Kava of the Week
                        </button>
                    </div>
                </div>

                {/* Form as a Pop-up Modal */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3 className="form-title">📝 Update Kava Award</h3>
                            <form onSubmit={updateAward} className="update-form">
                                <input
                                    type="file"
                                    name="img"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="form-control mb-3"
                                    required
                                />
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="image-preview" />
                                )}
                                <input
                                    type="text"
                                    name="winner"
                                    placeholder="Enter winner name"
                                    value={newData.winner}
                                    onChange={handleChange}
                                    className="form-control mb-3"
                                    required
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={newData.date}
                                    onChange={handleChange}
                                    className="form-control mb-3"
                                    required
                                />
                                <input
                                    type="text"
                                    name="position"
                                    placeholder="Enter position"
                                    value={newData.position}
                                    onChange={handleChange}
                                    className="form-control mb-3"
                                    required
                                />
                                <input
                                    type="text"
                                    name="team"
                                    placeholder="Enter team name"
                                    value={newData.team}
                                    onChange={handleChange}
                                    className="form-control mb-3"
                                    required
                                />
                                <button type="submit" className="update-btn">
                                    Update Award
                                </button>
                                <button type="button" className="cancel-btn" onClick={toggleForm}>
                                    Cancel Update
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* History of Kava Awards */}
                <div className="history-section">
                    <h3>📚 Kava Awards Current Series</h3>
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
                            {history.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.winner}</td>
                                    <td>{item.date}</td>
                                    <td>{item.position}</td>
                                    <td>{item.team}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* History of Kava Winners (2017-2024) with Images */}
            <div className="kava-history-section">
                <h3>🏅 History of Kava Awards (2017-2024)</h3>
                <div className="history-container">
                    {[
                        {
                            year: 2017,
                            winner: "Amit Sharma",
                            matches: 50,
                            kavas: 30,
                            percent: "60%",
                            img: "/img/amit-sharma.png",
                        },
                        {
                            year: 2018,
                            winner: "Rohan Verma",
                            matches: 48,
                            kavas: 28,
                            percent: "58%",
                            img: "/img/rohan-verma.png",
                        },
                        {
                            year: 2019,
                            winner: "Siddharth Rao",
                            matches: 52,
                            kavas: 32,
                            percent: "61.5%",
                            img: "/img/siddharth-rao.png",
                        },
                        {
                            year: 2020,
                            winner: "Priya Kumar",
                            matches: 45,
                            kavas: 27,
                            percent: "60%",
                            img: "/img/priya-kumar.png",
                        },
                        {
                            year: 2021,
                            winner: "Aryan Kapoor",
                            matches: 50,
                            kavas: 31,
                            percent: "62%",
                            img: "/img/aryan-kapoor.png",
                        },
                        {
                            year: 2022,
                            winner: "Neha Patil",
                            matches: 49,
                            kavas: 29,
                            percent: "59%",
                            img: "/img/neha-patil.png",
                        },
                        {
                            year: 2023,
                            winner: "Rajesh Iyer",
                            matches: 51,
                            kavas: 33,
                            percent: "64.7%",
                            img: "/img/rajesh-iyer.png",
                        },
                        {
                            year: 2024,
                            winner: "John Doe",
                            matches: 53,
                            kavas: 34,
                            percent: "64.1%",
                            img: "/img/john-doe.png",
                        },
                    ].map((item, index) => (
                        <div key={index} className="history-card">
                            <img src={item.img} alt={item.winner} className="player-img" />
                            <div className="history-info">
                                <p>
                                    <strong>{item.year}</strong>
                                </p>
                                <p>{item.winner}</p>
                                <p>
                                    Matches: {item.matches} | Kavas: {item.kavas} | Win %:{" "}
                                    {item.percent}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Awards;

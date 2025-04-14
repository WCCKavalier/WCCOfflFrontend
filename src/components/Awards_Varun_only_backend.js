
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./award.css";

const PICTURE_API = "https://wccbackend.onrender.com/api";

const Awards = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [history, setHistory] = useState([]);
    const [savedImage, setSavedImage] = useState(""); // Stores the last saved image
    const [formData, setFormData] = useState({
        winner: "",
        date: "",
        position: "",
        team: ""
    });
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [successmessage, setSuccessMessage] = useState("");
    const [latestEntry, setLatestEntry] = useState(null);

    useEffect(() => {
        fetchImage();
    }, []);

    const fetchImage = async () => {
        try {
            const response = await axios.get(`${PICTURE_API}/image/get-image`);
            if (response.data.image) {
                setPreview(response.data.image);
                setSavedImage(response.data.image); // Save the fetched image
                setHistory(response.data.history || []);
                setLatestEntry(response.data.history?.[0] || null);
            }
        } catch (error) {
            setMessage("No image");
            setTimeout(() => setMessage(""), 2000);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpload = async () => {
        // Ensure all fields are filled
        if (!image || !formData.winner || !formData.date || !formData.position || !formData.team) {
            setMessage("All fields are required");
            setTimeout(() => setMessage(""), 2000);
            return;
        }

        const data = new FormData();
        data.append("image", image);
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        try {
            await axios.post(`${PICTURE_API}/image/upload`, data);
            setSuccessMessage("Image uploaded successfully!");
            setTimeout(() => setSuccessMessage(""), 2000);
            
            // Clear form after successful upload
            setImage(null);
            setFormData({ winner: "", date: "", position: "", team: "" });
            setShowForm(false);

            // Fetch updated data
            fetchImage();
        } catch (error) {
            setMessage("Error uploading image. Please try again.");
            setTimeout(() => setMessage(""), 2000);
        }
    };

    const handleCancelUpload = () => {
        setShowForm(false);
        setPreview(savedImage); // Restore the last saved image
        setImage(null);
        setFormData({ winner: "", date: "", position: "", team: "" });
        setMessage("");
    };

    return (
        <div className="awards-container">
            <h2>Awards</h2>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? <div onClick={handleCancelUpload}>Cancel</div> : "Upload Image"}
            </button>

            {message && <p style={{ color: "red", fontWeight: "bold" }}>{message}</p>}
            {successmessage && <p style={{ color: "green", fontWeight: "bold" }}>{successmessage}</p>}

            {showForm && (
                <div>
                    <button onClick={handleUpload}>Upload</button>
                    <h3>Upload Image</h3>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <input type="text" name="winner" placeholder="Winner" value={formData.winner} onChange={handleInputChange} />
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
                    <input type="text" name="position" placeholder="Position" value={formData.position} onChange={handleInputChange} />
                    <input type="text" name="team" placeholder="Team" value={formData.team} onChange={handleInputChange} />
                </div>
            )}

            <h3>Latest Image</h3>
            {preview && <img src={preview} alt="Uploaded" style={{ width: "300px", height: "auto" }} />}

            {latestEntry && (
                <div className="table-container">
                    <h3>Latest Entry</h3>
                    <p><strong>Winner:</strong> {latestEntry.winner}</p>
                    <p><strong>Date:</strong> {latestEntry.date}</p>
                    <p><strong>Position:</strong> {latestEntry.position}</p>
                    <p><strong>Team:</strong> {latestEntry.team}</p>
                </div>
            )}

            <h3>History</h3>
            <table border="1" style={{ width: "100%", marginTop: "10px" }}>
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
                        history.map((entry, index) => (
                            <tr key={index}>
                                <td>{entry.winner}</td>
                                <td>{entry.date}</td>
                                <td>{entry.position}</td>
                                <td>{entry.team}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>No records found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Awards;

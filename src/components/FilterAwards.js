import React, { useEffect, useState } from "react";
import axios from "axios";
import "./award.css";
import "./filter.css"
import { downloadExcel } from "./Excel";

const FILTER_API = "https://wccbackend.onrender.com/api/image";

const FilterAwards = ({ initialData, isAdmin,fetchData }) => {
    const [filteredData, setFilteredData] = useState(initialData);
    const [dropdownOptions, setDropdownOptions] = useState({});
    const [filters, setFilters] = useState({});
    const [showDone, setShowDone] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [dateFilter, setDateFilter] = useState({ day: "", month: "", year: "" });
    const [loading, setLoading] = useState(false);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [downloadBeforeDelete, setDownloadBeforeDelete] = useState(false);

    useEffect(() => {
        const dates = initialData.map((entry) => entry.date);
        const years = [...new Set(dates.map((d) => d.split("-")[0]))];
        const months = [...new Set(dates.map((d) => d.split("-")[1]))];
        const days = [...new Set(dates.map((d) => d.split("-")[2]))];

        const options = {
            winner: [...new Set(initialData.map((entry) => entry.winner))],
            date: { years, months, days }, // structured for date
            position: [...new Set(initialData.map((entry) => entry.position))],
            team: [...new Set(initialData.map((entry) => entry.team))],
        };

        setDropdownOptions(options);
    }, [initialData]);

    const handleHeaderClick = (column) => {
        setActiveColumn(activeColumn === column ? null : column);
    };

    const handleDeleteAll = async () => {
        try {
            setDeleting(true);
            if (downloadBeforeDelete) {
                try {
                    downloadExcel(filteredData);
                } catch (error) {
                    console.error("Failed to download before deletion:", error);
                }
            }
            await axios.delete(`${FILTER_API}/deleteall`);
            setFilteredData([]);
            fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete data.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDownloadBeforeDelete(false); // reset checkbox
        }
    };

    const handleFilterChange = (column, value) => {
        setFilters((prev) => ({ ...prev, [column]: value }));
        setShowDone(true);
        setActiveColumn(null);
    };

    const handleDateChange = (type, value) => {
        const newDate = { ...dateFilter, [type]: value };
        setDateFilter(newDate);

        const cleaned = {};
        if (newDate.year) cleaned.year = newDate.year;
        if (newDate.month) cleaned.month = newDate.month;
        if (newDate.day) cleaned.day = newDate.day;

        setFilters((prev) => ({
            ...prev,
            date: cleaned
        }));
        setShowDone(true);
    };

    const removeFilter = (column) => {
        const newFilters = { ...filters };
        delete newFilters[column];
        if (column === "date") setDateFilter({ day: "", month: "", year: "" });
        setFilters(newFilters);
        setShowDone(true);
    };

    const applyFilters = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${FILTER_API}/filter`, filters);
            setFilteredData(response.data.history || []);
            setShowDone(false);
        } catch (error) {
            console.error("Error applying filters:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({});
        setDateFilter({ day: "", month: "", year: "" });
        setFilteredData(initialData);
        setShowDone(false);
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

    const handleDownloadClick = () => {
        if (downloading) return;
    
        if (hasDownloaded) {
            const confirmRedownload = window.confirm(
                "The file has already been downloaded. Do you want to download it again?"
            );
            if (!confirmRedownload) return;
        }
    
        setDownloading(true);
        
        try {
            downloadExcel(filteredData);
            setHasDownloaded(true);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setTimeout(() => {
                setDownloading(false);
            }, 500); // short delay to allow download to trigger safely
        }
    };

    const monthNames = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
        "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    };

    return (
        <>
            {/* Table with clickable headers */}
            <div className="table-container responsive-table">
            <h5>Please do click on the table header for filtering</h5>
                <table className="table">
                    <thead>
                        <tr>
                            {["winner", "date", "position", "team"].map((col) => {
                                const isActive = filters[col] || (col === "date" && filters.date);
                                return (
                                    <th
                                        key={col}
                                        onClick={() => handleHeaderClick(col)}
                                        className={isActive ? "active-filter" : ""}
                                    >
                                        {col.charAt(0).toUpperCase() + col.slice(1)}
                                        <span className="filter-icon">🔍</span>
                                    </th>
                                );
                            })}

                        </tr>
                        {activeColumn && (
                            <tr>
                                <td colSpan="4">
                                    {activeColumn === "date" ? (
                                        <div className="date-dropdowns">
                                            <select value={dateFilter.day} onChange={(e) => handleDateChange("day", e.target.value)}>
                                                <option value="">Day</option>
                                                {dropdownOptions.date?.days.map((d, idx) => (
                                                    <option key={idx} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            <select value={dateFilter.month} onChange={(e) => handleDateChange("month", e.target.value)}>
                                                <option value="">Month</option>
                                                {dropdownOptions.date?.months.map((m, idx) => (
                                                    <option key={idx} value={m}>{monthNames[m]}</option>
                                                ))}
                                            </select>
                                            <select value={dateFilter.year} onChange={(e) => handleDateChange("year", e.target.value)}>
                                                <option value="">Year</option>
                                                {dropdownOptions.date?.years.map((y, idx) => (
                                                    <option key={idx} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <select onChange={(e) => handleFilterChange(activeColumn, e.target.value)} defaultValue="">
                                            <option value="" disabled>Select {activeColumn}</option>
                                            {dropdownOptions[activeColumn]?.map((option, idx) => (
                                                <option key={idx} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((entry, idx) => (
                                <tr key={idx}>
                                    <td>{entry.winner}</td>
                                    <td>{formatDate(entry.date)}</td>
                                    <td>{entry.position}</td>
                                    <td>{entry.team}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
            </div>
            {showDeleteModal && (
                <div className="filter-modal-overlay">
                    <div className="filter-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete <strong>all data</strong>?</p>

                        <div style={{ margin: "10px 0" }}>
                            <label style={{ fontSize: "0.9rem" }}>
                                <input
                                    type="checkbox"
                                    checked={downloadBeforeDelete}
                                    onChange={() => setDownloadBeforeDelete(prev => !prev)}
                                    style={{ marginRight: "8px" }}
                                />
                                Download Excel sheet before deletion
                            </label>
                        </div>

                        <div className="filter-modal-buttons">
                            <button onClick={handleDeleteAll} disabled={deleting}>
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button onClick={() => {
                                setShowDeleteModal(false);
                                setDownloadBeforeDelete(false); // reset checkbox if cancel
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected filters as tags */}
            <div className="selected-filters">
                {Object.entries(filters).map(([key, value]) =>
                    key === "date" ? (
                        <span key="date" className="filter-tag">
                            Date: <strong>{value.day || ""}-{value.month || ""}-{value.year || ""}</strong>
                            <button className="remove-tag-btn" onClick={() => removeFilter("date")}>❌</button>
                        </span>
                    ) : (
                        <span key={key} className="filter-tag">
                            {key}: <strong>{value}</strong>
                            <button className="remove-tag-btn" onClick={() => removeFilter(key)}>❌</button>
                        </span>
                    )
                )}
            </div>

            {/* Buttons */}
            <div className="filter-buttons">
                {showDone && (
                    <button className="filter-done-btn" onClick={applyFilters} disabled={loading}>
                        Done
                    </button>
                )}
                {Object.keys(filters).length > 0 && (
                    <button className="filter-clear-btn" onClick={clearFilters}>
                        Clear
                    </button>
                )}
                <div className={`filter-download-container ${isAdmin ? "admin-mode" : ""}`}>
                    {filteredData.length > 0 && (
                    <button
                        className="filter-download-btn"
                        onClick={handleDownloadClick}
                        disabled={downloading}
                    >
                        {downloading ? "Downloading..." : "Download Excel"}
                    </button>
                    )}

                    {isAdmin && filteredData.length > 0 && (
                        <button
                            className="filter-delete-btn"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={deleting}
                        >
                            Delete All Data
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default FilterAwards;

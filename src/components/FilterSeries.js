import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Series.css";
import "./filterseries.css";

const API_BASE_URL = "https://wccbackend.onrender.com";

const FilterSeries = ({ initialData, isOpen, filterTableRefreshKey }) => {
  const [filteredData, setFilteredData] = useState(initialData || []);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [filters, setFilters] = useState({});
  const [showDone, setShowDone] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilteredData(initialData);
    const startDates = [...new Set(initialData.map(entry => entry.startDate?.split("T")[0]))];
    const endDates = [...new Set(initialData.map(entry => entry.endDate?.split("T")[0]))];

    const options = {
      "Captains": [...new Set(initialData.flatMap(entry => [entry?.captain?.teamA, entry?.captain?.teamB]))],
      "Winning captain": [
          ...new Set(initialData
            .filter(entry => entry.points?.teamA !== entry.points?.teamB)
            .map(entry =>
              entry.points?.teamA > entry.points?.teamB
                ? entry?.captain?.teamA
                : entry?.captain?.teamB
            )),
          "Draw"
        ],
      "SeriesDate": {
        startDates,
        endDates
      }
    };

    setDropdownOptions(options);
  }, [initialData]);

  const handleHeaderClick = (column) => {
    if (column !== "Points") {
      setActiveColumn(activeColumn === column ? null : column);
    }
  };

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
    setShowDone(true);
    setActiveColumn(null);
  };

  const handleDateDropdownChange = (field, value) => {
    const newDateFilter = { ...dateFilter, [field]: value };
    setDateFilter(newDateFilter);

    const newFilters = { ...filters, date: {} };
    if (newDateFilter.startDate) newFilters.date.startDate = newDateFilter.startDate;
    if (newDateFilter.endDate) newFilters.date.endDate = newDateFilter.endDate;

    setFilters(newFilters);
    setShowDone(true);
  };

  const removeFilter = (column) => {
    const newFilters = { ...filters };
    if (column === "date") {
      delete newFilters.date;
      setDateFilter({ startDate: "", endDate: "" });
    } else {
      delete newFilters[column];
    }
    setFilters(newFilters);
    setShowDone(true);
  };

  const applyFilters = async () => {
    const isEmpty = Object.values(filters).every(val =>
      val === "" || (Array.isArray(val) && val.length === 0) || (typeof val === "object" && Object.keys(val).length === 0)
    );
  
    if (isEmpty) {
      setFilteredData(initialData);
      setShowDone(false);
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/team/filter-series`, filters);
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
    setDateFilter({ startDate: "", endDate: "" });
    setFilteredData(initialData);
    setShowDone(false);
  };

  const formatSeriesDate = (startDate, endDate) => {
    const options = { month: "short", year: "numeric" };
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = start.toLocaleDateString("en-US", options);
    const endStr = end.toLocaleDateString("en-US", options);

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return startStr;
    }

    return `${start.toLocaleDateString("en-US", { month: "short" })} - ${endStr}`;
  };

  return (
    <>
      <div>
        <div className={`collapsible-content ${isOpen ? "open" : ""}`}>
          <div className="series-table-wrapper">
            <table className="series-table">
              <thead>
                <tr>
                  {["Series Date", "Captains", "Winning captain", "Points"].map((col) => (
                    <th
                      key={col}
                      onClick={() => handleHeaderClick(col)}
                      style={{ cursor: col === "Points" ? "default" : "pointer" }}
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                    </th>
                  ))}
                </tr>
                {activeColumn && (
                  <tr>
                    <td colSpan="5">
                      {activeColumn === "Series Date" ? (
                        <div className="date-dropdowns">
                          <select value={dateFilter.startDate} onChange={(e) => handleDateDropdownChange("startDate", e.target.value)}>
                            <option value="">Start Date</option>
                            {dropdownOptions.SeriesDate?.startDates?.map((d, idx) => (
                              <option key={idx} value={d}>{d}</option>
                            ))}
                          </select>
                          <select value={dateFilter.endDate} onChange={(e) => handleDateDropdownChange("endDate", e.target.value)}>
                            <option value="">End Date</option>
                            {dropdownOptions.SeriesDate?.endDates?.map((d, idx) => (
                              <option key={idx} value={d}>{d}</option>
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
                  filteredData.map((series, index) => (
                    <tr key={index}>
                      <td>
                        {formatSeriesDate(series.startDate, series.endDate)}
                      </td>
                      <td>
                        <span className="team team-a">{series?.captain?.teamA || "Unknown"}</span> vs{" "}
                        <span className="team team-b">{series?.captain?.teamB || "Unknown"}</span>
                      </td>
                      <td>
                      <span className="winner">
                        {series.points.teamA === series.points.teamB
                          ? "Draw"
                          : series.points.teamA > series.points.teamB
                            ? series?.captain?.teamA
                            : series?.captain?.teamB}
                      </span>
                      </td>
                      <td>
                        <span className="team team-a">{series?.points?.teamA}</span>{" "}-{" "}
                        <span className="team team-b">{series?.points?.teamB}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>No data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="selected-filters">
            {Object.entries(filters).map(([key, value]) => (
              key === "date" ? (
                <span key={key} className="filter-tag">
                  {value.startDate && <>Start: <strong>{value.startDate}</strong></>}
                  {" "}
                  {value.endDate && <>End: <strong>{value.endDate}</strong></>}
                  <button className="remove-tag-btn" onClick={() => removeFilter(key)}>❌</button>
                </span>
              ) : (
                <span key={key} className="filter-tag">
                  {key}: <strong>{value}</strong>
                  <button className="remove-tag-btn" onClick={() => removeFilter(key)}>❌</button>
                </span>
              )
            ))}
          </div>

          <div className="filter-buttons">
            {showDone && (
              <button className="filter-done-btn" onClick={applyFilters} disabled={loading}>
                {loading ? "Loading..." : "Done"}
              </button>
            )}
            {Object.keys(filters).length > 0 && (
              <button className="filter-clear-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSeries;

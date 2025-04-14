import React, { useState } from "react";
import "./Profile.css"; 
import "./PlayerSection.css";
import "./Search.css";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        className="w-full p-2 border rounded-lg"
        placeholder="Search for a player..."
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
};

export default SearchBar;

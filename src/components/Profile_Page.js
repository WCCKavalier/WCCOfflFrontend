import React, { useState } from "react";
import PlayerSection from "./PlayerSection_Standalone";
import "./Profile_Page.css"; // Profile Styles with Gradient
import players from "./players"; // Player Data
import "./Search.css"; // Search Styles
import { color } from "framer-motion";

const Profile_Page = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Players Based on Search Query
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="Profile_page pt-20 bg-gray-50 min-h-screen p-4">
      <div className="bg-gray-50 min-h-screen p-4">
        {/* Page Title */}
        <h2>Player Profiles</h2>

 
        {/* Search Bar Section */}
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search for a player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Player Section with Filtered Players */}
        <div className="player-section-wrapper">
          <PlayerSection players={filteredPlayers} />
        </div>
      </div>
    </div>
  );
};

export default Profile_Page;
import React from "react";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="glitch-text">404</h1>
      <p className="subtext">Page Not Found</p>
      <a href="/" className="home-btn">Go Back Home</a>
    </div>
  );
};

export default NotFound;

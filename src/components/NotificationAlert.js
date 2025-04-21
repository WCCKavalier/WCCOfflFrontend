import React from "react";
import "./NotificationAlert.css"; // Assuming you add the CSS for styles

const NotificationAlert = ({ message, type, onClose, persistent }) => {
  return (
    <div className={`notification-box ${type === "error" ? "notification-error" : "notification-success"}`}>
      <div className="notification-message">{message}</div>
      {persistent && (
        <button className="notification-button" onClick={onClose}>OK</button>
      )}
    </div>
  );
};

export default NotificationAlert;

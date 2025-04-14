// ✅ Updated index.js for React 18+
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Create root and render using React 18 syntax
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

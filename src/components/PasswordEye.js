// PasswordEye.js
import React, { useState } from "react";
import "./loginregister1.css";

const PasswordEye = ({ value, onChange, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="password-wrapper">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="login-input"
            />
            <span className="eye-icon" onClick={toggleVisibility}>
            <svg
                className={`eye-svg ${showPassword ? "open" : "closed"}`}
                viewBox="0 0 24 24"
                width="24"
                height="24"
                >
                {/* Open Eye Shape */}
                <path
                    className="eye-open"
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                />

                {/* Closed Eye Shape */}
                <g className="eye-closed" fill="none" stroke="currentColor" strokeWidth="2">
                    {/* Eye outline */}
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    
                    {/* Eyelid line across the eye */}
                    <path d="M4 12 Q12 16 20 12" />
                </g>

                {/* Pupil */}
                <circle
                    className="eye-pupil"
                    cx="12"
                    cy="12"
                    r="3"
                    fill="currentColor"
                />
                </svg>
            </span>
        </div>
    );
};

export default PasswordEye;

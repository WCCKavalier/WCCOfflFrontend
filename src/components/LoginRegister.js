import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./loginregister1.css"
import PasswordEye from "./PasswordEye";

const API_URL = "https://wccbackend.onrender.com/api/auth";

const LoginRegister = ({ onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registrationStep, setRegistrationStep] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const boxRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                boxRef.current &&
                !boxRef.current.contains(e.target)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isExpanded, onClose]);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (token) {
            axios.get(`${API_URL}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                sessionStorage.setItem("username", response.data.username);
                sessionStorage.setItem("admin", response.data.admin);
                setIsAuthenticated(true);
                navigate("/");
            }).catch(() => {
                sessionStorage.clear();
                setIsAuthenticated(false);
            });
        }
    }, [navigate]);

    const sendRegistrationCode = async () => {
        if (!email || !username || !password) {
            return alert("All fields are required");
        }

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_URL}/send-registration-code`, { email });
            alert(data.message);
            setIsCodeSent(true);
            setRegistrationStep(2);
        } catch (err) {
            alert(err.response?.data?.message || "Error sending code");
        } finally {
            setLoading(false);
        }
    };

    const completeRegistration = async () => {
        if (!verificationCode) return alert("Enter the verification code");

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_URL}/register`, {
                username,
                email,
                password,
                code: verificationCode
            });

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("username", data.user.username);
            sessionStorage.setItem("admin", data.user.admin);
            setIsAuthenticated(true);
            onClose();
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) return;

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_URL}/login`, { email, password });

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("username", data.user.username);
            sessionStorage.setItem("admin", data.user.admin);
            setIsAuthenticated(true);
            onClose();
            window.location.reload();
            window.scrollTo(0, 0);
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };
    const requestPasswordReset = async () => {
        if (!email) return alert("Please enter your email");

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
            alert(data.message);
            setIsCodeSent(true);
        } catch (err) {
            alert("Error sending verification code");
        }
        finally {
            setLoading(false);
          }
    };

    const resetPassword = async () => {
        if (!email || !verificationCode || !newPassword) return alert("All fields are required");

        try {
            setLoading(true);
            const { data } = await axios.post(`${API_URL}/reset-password`, {
                email,
                code: verificationCode,
                newPassword
            });

            // Auto-login after password reset
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("username", data.user.username);
            sessionStorage.setItem("admin", data.user.admin);
            setIsAuthenticated(true);
            window.location.reload();
        } catch (err) {
            alert("Invalid verification code");
        }
        finally {
            setLoading(false);
          }
    };
    const handleBackToLogin = () => {
        setShowForgotPassword(false);
        setIsCodeSent(false);
        setVerificationCode("");
        setRegistrationStep(1);
        setNewPassword("");
        setLoading(false);
    };

    return (
        <div className="auth-wrapper">
        <div className={`login-box ${isExpanded ? "expanded" : ""}`} ref={boxRef} onClick={(e) => {
                if (!isExpanded) {
                    setIsExpanded(true);
                } else {
                    if (e.target === e.currentTarget) {
                        setIsExpanded(false); 
                    }
                }
            }}
            >
            {!isExpanded ? (
                <div className="login-label">Login</div>
            ) : (
                <div className="login-content">
                    <span className="close-button" onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                        onClose();
                    }}>&times;</span>
    
                {!showForgotPassword ? (
                    <>
                        <h3 className="login-heading">{isLogin ? "Login" : "Signup"}</h3>
    
                        {!isLogin && registrationStep === 1 && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="login-input"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input"
                                />
                                <PasswordEye
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input"
                                />
                                <button onClick={sendRegistrationCode} className="login-button" disabled={loading}>
                                    Send Verification Code
                                </button>
                            </>
                        )}
    
                        {!isLogin && registrationStep === 2 && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter verification code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="login-input"
                                />
                                <button onClick={completeRegistration} className="login-button" disabled={loading}>
                                    Verify & Signup
                                </button>
                            </>
                        )}
    
                        {isLogin && (
                            <>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input"
                                />
                                <PasswordEye
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input"
                                />
                                <button onClick={handleLogin} className="login-button" disabled={loading}>
                                    Login
                                </button>
                            </>
                        )}
    
                        <div className="login-links">
                            <p onClick={() => {
                                setIsLogin(!isLogin);
                                setRegistrationStep(1);
                            }}>
                                {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
                            </p>
                            <p onClick={() => setShowForgotPassword(true)}>Forgot Password?</p>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="login-heading">Reset Password</h3>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                        />
                        {isCodeSent && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter verification code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="login-input"
                                />
                                <PasswordEye
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="login-input"
                                />
                                <button onClick={resetPassword} className="login-button" disabled={loading}>
                                    Reset & Login
                                </button>
                            </>
                        )}
                        {!isCodeSent && (
                            <button onClick={requestPasswordReset} className="login-button" disabled={loading}>
                                Send Code
                            </button>
                        )}
                        <div className="login-links">
                            <p onClick={handleBackToLogin}>Back to Login</p>
                        </div>
                    </>
                )}
            </div>
            )}
        </div>
        </div>
    );    

};

export default LoginRegister;
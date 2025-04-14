import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Main from "./components/Main";
import Awards from "./components/Awards";
import Chat from "./components/Chat";
import Teams from "./components/Series";
import Profile_Page from "./components/Profile_Page";
import LoginRegister from "./components/LoginRegister";

// ProtectedRoute: redirects to / if user not logged in
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = sessionStorage.getItem("username");
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

// LoginWrapper: handles login inside "/" route
const LoginWrapper = ({ isAuthenticated, setIsAuthenticated }) => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLoginOpen = () => setShowLogin(true);
  const handleLoginClose = () => {
    setShowLogin(false);
    const user = sessionStorage.getItem("username");
    if (user) {
      setIsAuthenticated(true);
      navigate("/chat");
    }
  };

  return (
    <>
      <Main openLogin={handleLoginOpen} isAuthenticated={isAuthenticated} />
      {showLogin && <LoginRegister onClose={handleLoginClose} />}
    </>
  );
};

const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem("username");
    if (user) setIsAuthenticated(true);
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <LoginWrapper
              isAuthenticated={isAuthenticated}
              setIsAuthenticated={setIsAuthenticated}
            />
          }
        />
        <Route path="/teams" element={<Teams />} />
        <Route path="/profile_page" element={<Profile_Page />} />
        <Route path="/awards" element={<Awards />} />
        <Route
          path="/chat"
          element={<ProtectedRoute element={<Chat />} />}
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;

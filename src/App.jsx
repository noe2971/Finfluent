import { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Dashboard from "./Components/dashboard";
import Chatbot from "./Components/chatbot";
import Finances from "./Components/finances";
import Livestocks from "./Components/livestocks";
import Login from "./Components/login";
import Profile from "./Components/profile";
import Sidebar from "./Components/sidebar";
import Home from "./Components/home";
import Lessons from "./Components/lessons";
import Information from "./Components/information";
import Infoetf from "./Components/info(etf)";
import ETF from "./Components/ETF";
import Health from "./Components/health"; // Import the Health component
import ReactGA from "react-ga4"; // Added for Google Analytics

// Initialize GA4 with your Measurement ID
const GA_MEASUREMENT_ID = "G-Z0WVJJHDR7"; // Replace with your GA4 Measurement ID
ReactGA.initialize(GA_MEASUREMENT_ID);

// New component to track page views
function TrackPageView() {
  const location = useLocation();
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);
  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // Logout function
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null); // Reset the user state
      })
      .catch((error) => console.error("Error logging out: ", error));
  };

  return (
    <Router>
      <TrackPageView />
      {user ? (
        // When user is logged in, wrap the sidebar and main content in a flex container.
        <div className="flex">
          <Sidebar handleLogout={handleLogout} />
          <main className="flex-1 p-4">
            <Routes>
              {/* Default route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/livestocks" element={<Livestocks />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/information" element={<Information />} />
              <Route path="/info(etf)" element={<Infoetf />} />
              <Route path="/etfs" element={<ETF />} />
              <Route path="/health" element={<Health />} /> {/* New route for Health */}

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        // When user is not logged in, show public routes.
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;

import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Dashboard from "./Components/dashboard";
import Chatbot from "./Components/chatbot";
import Finances from "./Components/finances";
import Livestocks from "./Components/livestocks";
import Login from "./Components/login";
import Profile from "./Components/profile";
import Sidebar from "./Components/sidebar";
import Home from "./Components/home";
import AboutUs from "./Components/aboutus";
import Features from "./Components/features";
import Lessons from "./Components/lessons";

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
      .then(() => 
      {

        setUser(null); // Reset the user state
      }
      
    )
      .catch((error) => console.error("Error logging out: ", error));
  };

  return (
    <Router>
    {user && <Sidebar handleLogout={handleLogout} />}
  
    <Routes>
      {/* Default route - Redirect to Dashboard if user is logged in */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      
      {/* Redirect to Dashboard for other routes if user is logged in */}
      <Route path="/home" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route path="/aboutus" element={user ? <Navigate to="/dashboard" replace /> : <AboutUs />} />
      <Route path="/features" element={user ? <Navigate to="/dashboard" replace /> : <Features />} />
  
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
  
      {/* Protected routes (accessible only when logged in) */}
      {user && (
        <>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/livestocks" element={<Livestocks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/finances" element={<Finances />} />
          <Route path='/lessons' element={<Lessons/>}/>
        </>
      )}
  
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  </Router>
  );
}

export default App;


import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Dashboard from "./Components/dashboard"
import Chatbot from "./Components/chatbot"
import Finances from "./Components/finances"
import Livestocks from "./Components/livestocks"
import Login from "./Components/login"
import Profile from "./Components/profile"
import Sidebar from "./Components/sidebar"
function App() {

  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null); 
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };


  return (
    <>
   <Router>

{user && <Sidebar handleLogout={handleLogout} />}
<Routes>

  {!user ? (
    <Route path="*" element={<Navigate to="/login" replace />} />
  ) : (
    <>

<Route path="/login" element={<Navigate to="/profile" replace />} />
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/livestocks" element={<Livestocks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/finances" element={<Finances/>}/>

    </>
  )}

  <Route path="/login" element={<Login />} />
</Routes>
</Router>
    </>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Components/Home"
import Chatbot from "./Components/chatbot"
import Finances from "./Components/finances"
import Livestocks from "./Components/livestocks"
import Login from "./Components/login"
import Profile from "./Components/profile"
import Sidebar from "./Components/sidebar"
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <Router>
  <div className='fixed h-screen w-[35vh]'>
             <Sidebar />
           </div>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/finances" element={<Finances />} />
      <Route path="/livestocks" element={<Livestocks />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </Router>
    </>
  )
}

export default App

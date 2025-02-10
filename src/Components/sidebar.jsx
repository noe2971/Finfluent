import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; 
import logo from '../config/Wealthify_logo.png';

export default function Sidebar() {
    const navigate = useNavigate();


    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out successfully");
            navigate("/login"); 
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className='fixed top-0 left-0 h-screen p-6 bg-gradient-to-b from-[#172554] to-[#2563eb] text-white shadow-lg'>
            <h1 className="text-3xl font-sans font-bold mb-8 tracking-wide">Wealthify</h1>
            <div className="flex items-center mb-8">
                <img src={logo} alt="Logo" className="h-40 ml-2" /> 
            </div>
            <div className='space-y-4 text-l'>
                {[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Profile', path: '/profile' },
                    { label: 'Chatbot', path: '/chatbot' },
                    { label: 'Finances', path: '/finances' },
                    { label: 'Investment', path: '/etfs' }, 
                    { label: 'Lessons', path: '/lessons' },
                    { label: 'Health', path: '/health' },
                    { label: 'Logout', path: 'logout' }
                ].map((item) => (
                    <div 
                        key={item.label}
                        className="cursor-pointer p-4 hover:bg-blue-700 rounded-lg shadow transition-shadow ease-in-out duration-300"
                        onClick={() => item.path === "logout" ? handleLogout() : navigate(item.path)}
                    >
                        {item.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

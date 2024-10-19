import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../config/Wealthify_logo.png';

export default function Sidebar() {
    const navigate = useNavigate();

    return (
        <div className='fixed top-0 left-0 h-screen p-6 bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-lg'>
            <h1 className="text-3xl font-bold mb-8 tracking-wide">Wealthify</h1>
            <div className="flex items-center mb-8">
                <img src={logo} alt="Logo" className="h-40 ml-2" /> 
            </div>
            <div className='space-y-4 text-l'>
                {['Dashboard', 'Profile', 'Chatbot', 'Finances', 'Live Stocks', 'Login'].map((item) => (
                    <div 
                        key={item}
                        className="cursor-pointer p-4 hover:bg-blue-700 rounded-lg shadow transition-shadow ease-in-out duration-300"
                        onClick={() => navigate(`/${item.toLowerCase().replace(' ', '')}`)}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
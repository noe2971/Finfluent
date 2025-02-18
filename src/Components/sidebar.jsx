import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  Home,
  User,
  MessageSquare,
  PieChart,
  LineChart,
  BookOpen,
  Heart,
  LogOut,
  Menu,
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
    { icon: PieChart, label: 'Finances', path: '/finances' },
    { icon: LineChart, label: 'Investment', path: '/etfs' },
    { icon: BookOpen, label: 'Lessons', path: '/lessons' },
    { icon: Heart, label: 'Health', path: '/health' },
    { icon: LogOut, label: 'Logout', path: 'logout' },
  ];

  return (
    <>
      {isOpen ? (
        <div className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-[#0A1929] to-[#0041C2] border-r border-blue-900/30 flex flex-col z-50">
          {/* Header with a close toggle */}
          <div className="h-24 flex items-center justify-between border-b border-blue-900/30 px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Wealthify
            </h1>
            <button onClick={toggleSidebar}>
              <Menu className="h-6 w-6 text-blue-300" />
            </button>
          </div>
          {/* Navigation Items */}
          <nav className="px-4 py-6 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.path === 'logout') {
                      handleLogout();
                    } else {
                      navigate(item.path);
                      setIsOpen(false); // auto-close after navigation
                    }
                  }}
                  className={`w-full flex items-center px-4 py-4 mb-3 rounded-lg transition-all duration-200 text-l ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-blue-300 hover:bg-blue-800/30'
                  }`}
                >
                  <item.icon className="h-6 w-6 mr-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      ) : (
        // When closed, only show a small toggle button with a background matching the page
        <div
          className="fixed top-0 left-0 h-12 w-12 flex items-center justify-center cursor-pointer z-50"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6 text-blue-300" />
        </div>
      )}
    </>
  );
}

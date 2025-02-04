import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from '../config/hero-image.png';
import feature1 from "../config/feature1.png";
import feature2 from "../config/feature2.png";
import feature3 from "../config/feature3.png";

const Home = () => {
  const navigate = useNavigate();

  // Dynamic Navigation Links
  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "About Us", path: "/aboutus" },
    { name: "Features", path: "/features" },
    { name: "Login", path: "/login" },
  ];

  // Dynamic Features Section
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setFeatures([
        { title: "Personalized Advice", description: "Tailored financial tips based on your profile and goals.", image: feature1 },
        { title: "Live Stock Tracking", description: "Real-time insights to monitor and optimize investments.", image: feature2 },
        { title: "AI-Powered Chatbot", description: "Get financial advice anytime, anywhere with our AI assistant.", image: feature3 },
      ]);
    }, 1000);
  }, []);

  return (
    <div className="bg-gray-900 text-white w-full min-h-screen m-0">
      {/* Header */}
      <header>
        <nav className="bg-blue-800 flex justify-center py-4 space-x-12 w-full">
          {navLinks.map((link, index) => (
            <motion.button 
              key={index} 
              onClick={() => navigate(link.path)}
              className="hover:underline"
              whileHover={{ scale: 1.1 }}
            >
              {link.name}
            </motion.button>
          ))}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 bg-gray-900 relative">
        <motion.h1 className="text-blue-400 text-6xl font-bold" animate={{ scale: 1.1 }}>
          Wealthify
        </motion.h1>
        <h2 className="text-2xl my-6 text-gray-300">Empowering Financial Freedom</h2>
        <p className="text-lg text-gray-400 mx-auto w-4/5 lg:w-2/3">
          Our mission is to provide everyone with the opportunity to make smart financial decisions. With personalized dashboards, AI-driven investment advice, and real-time stock tracking, achieve financial independence today!
        </p>
        <motion.button
          onClick={() => navigate("/signup")}
          className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-all shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Get Started
        </motion.button>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-800">
        <h2 className="text-center text-4xl text-blue-400 font-bold mb-10">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 lg:px-32">
          {features.length === 0 ? (
            <p className="text-center text-gray-400">Loading features...</p>
          ) : (
            features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-700 text-center p-6 rounded shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <img src={feature.image} alt={feature.title} className="w-20 h-20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-blue-400 mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 py-6 text-center">
        <div className="text-gray-300">
          &copy; {new Date().getFullYear()} Wealthify. All rights reserved.
          <div className="mt-2 flex justify-center space-x-4">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((link, index) => (
              <a key={index} href="#!" className="hover:text-white">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

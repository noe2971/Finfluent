import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white min-h-screen w-[100%]">
      {/* Header */}
      <header>
        <nav className="bg-blue-800 flex justify-center py-4 space-x-12 w-full">
          <button onClick={() => window.location.href = "/home"} className="hover:underline">Home</button>
          <button onClick={() => window.location.href = "/aboutus"} className="hover:underline">About Us</button>
          <button onClick={() => window.location.href = "/features"} className="hover:underline">Features</button>
          <button onClick={() => window.location.href = "/login"} className="hover:underline">Sign Up</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 bg-gray-900">
        <h1 className="text-blue-400 text-6xl font-bold">Wealthify</h1>
        <h2 className="text-2xl my-6 text-gray-300">Empowering Financial Freedom</h2>
        <p className="text-lg text-gray-400 mx-auto w-4/5 lg:w-2/3">
          Our mission is to provide everyone with the opportunity to make smart financial decisions. With personalized dashboards, AI-driven investment advice, and real-time stock tracking, achieve financial independence today!
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-all"
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-800">
        <h2 className="text-center text-4xl text-blue-400 font-bold mb-10">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 lg:px-32">
          {[
            {
              title: "Personalized Advice",
              description: "Tailored financial tips based on your profile and goals.",
            },
            {
              title: "Live Stock Tracking",
              description: "Real-time insights to monitor and optimize investments.",
            },
            {
              title: "AI-Powered Chatbot",
              description: "Get financial advice anytime, anywhere with our AI assistant.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-700 text-center p-6 rounded shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-xl font-bold text-blue-400 mb-4">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-800 py-6 text-center">
        <div className="text-gray-300">
          &copy; 2024 Wealthify. All rights reserved.
          <div className="mt-2 flex justify-center space-x-4">
            <a href="#!" className="hover:text-white">Privacy Policy</a>
            <a href="#!" className="hover:text-white">Terms of Service</a>
            <a href="#!" className="hover:text-white">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

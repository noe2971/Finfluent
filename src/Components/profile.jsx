import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";  // Import Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Import auth state listener
import { ToastContainer, toast } from "react-toastify";  // Import Toastify
import "react-toastify/dist/ReactToastify.css";  // Toastify CSS

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    salary: "",
    bigExpenses: [],
    currentInvestments: [],
    desiredInvestments: [],
    goals: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();

        // Clean up single-character entries in specific fields
        const cleanedData = {
          ...data,
          bigExpenses: cleanArray(data.bigExpenses),
          currentInvestments: cleanArray(data.currentInvestments),
          desiredInvestments: cleanArray(data.desiredInvestments),
        };

        setFormData(cleanedData);
        toast.success("Profile data loaded successfully!");
      } else {
        toast.error("No profile data found.");
      }
    } catch (error) {
      toast.error("Error loading profile data.");
    }
  };

  // Helper function to clean up unintended single-character entries in an array
  const cleanArray = (array) => {
    if (!Array.isArray(array)) return [];
    return array.filter((item) => item.length > 1); // Keeps only items longer than one character
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMultipleChoice = (field, option) => {
    setFormData((prevData) => {
      const updatedChoices = prevData[field].includes(option)
        ? prevData[field].filter((item) => item !== option)
        : [...prevData[field], option];
      return { ...prevData, [field]: updatedChoices };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      try {
        // Clean up single-character entries before saving to prevent extra characters from saving
        const cleanedFormData = {
          ...formData,
          bigExpenses: cleanArray(formData.bigExpenses),
          currentInvestments: cleanArray(formData.currentInvestments),
          desiredInvestments: cleanArray(formData.desiredInvestments),
        };

        await setDoc(doc(db, "users", userId), cleanedFormData);
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile.");
      }
    } else {
      toast.error("No user is logged in.");
    }
  };

  return (
    <div className="flex flex-col ml-[18vh] items-center min-h-screen bg-gradient-to-b from-[#172554] to-[#bae6fd] w-full px-4 sm:px-6 md:px-8 py-8">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-gray-700"
      >
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Profile Builder</h2>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full p-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="block w-full p-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your age"
          />
        </div>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Salary:</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="block w-full p-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your salary"
          />
        </div>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Big Expenses:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["House loan", "Car loan", "Education loan", "Children", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("bigExpenses", option)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ease-in-out ${
                  formData.bigExpenses.includes(option)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Current Investments:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("currentInvestments", option)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ease-in-out ${
                  formData.currentInvestments.includes(option)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Desired Investments:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("desiredInvestments", option)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ease-in-out ${
                  formData.desiredInvestments.includes(option)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
  
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Financial Goals:</label>
          <input
            type="text"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            className="block w-full p-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your goals"
          />
        </div>
  
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
  
};

export default Profile;
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
    costs: "",
    bigExpenses: [],
    liabilities: [],
    currentInvestments: [],
    savings: "",
    emergencyFund: "",
    desiredInvestments: [],
    insurance: [],
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
          costs: cleanArray(data.costs),
          bigExpenses: cleanArray(data.bigExpenses),
          liabilities: cleanArray(data.liabilities),
          currentInvestments: cleanArray(data.currentInvestments),
          desiredInvestments: cleanArray(data.desiredInvestments),
          insurance: cleanArray(data.insurance),
          savings: data.savings || "", 
          emergencyFund: data.emergencyFund || "",
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

  const handleCheckboxChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value, // Only one value at a time (Yes or No)
    }));
  }  

  const handleMultipleChoice = (field, option) => {
    setFormData((prevData) => {
      const updatedChoices = prevData[field].includes(option)
        ? prevData[field].filter((item) => item !== option)
        : [...prevData[field], option];
      return { ...prevData, [field]: updatedChoices };
    });
  };

  const handleLiabilitySelection = (option) => {
    setFormData((prev) => {
      const updatedLiabilities = { ...prev.liabilities };
  
      if (updatedLiabilities[option] !== undefined) {
        // If already selected, remove it
        delete updatedLiabilities[option];
      } else {
        // Otherwise, add it with an empty value
        updatedLiabilities[option] = "";
      }
  
      return { ...prev, liabilities: updatedLiabilities };
    });
  };
  
  const handleLiabilityAmountChange = (option, value) => {
    setFormData((prev) => ({
      ...prev,
      liabilities: {
        ...prev.liabilities,
        [option]: value,
      },
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      try {
        // Clean up single-character entries and empty liabilities before saving
        const cleanedLiabilities = Object.keys(formData.liabilities).reduce((acc, key) => {
          const value = formData.liabilities[key];
          if (value && !isNaN(value)) {  // Make sure the value is not empty and is a valid number
            acc[key] = value;
          }
          return acc;
        }, {});
  
        const cleanedFormData = {
          ...formData,
          bigExpenses: cleanArray(formData.bigExpenses),
          liabilities: cleanedLiabilities, // Use cleaned liabilities
          currentInvestments: cleanArray(formData.currentInvestments),
          desiredInvestments: cleanArray(formData.desiredInvestments),
          insurance: cleanArray(formData.insurance),
          savings: formData.savings,  
          emergencyFund: formData.emergencyFund,
          costs: cleanArray(formData.costs),
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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#172554] to-[#bae6fd] w-full px-4 sm:px-6 md:px-8 py-8">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-gray-700 l-[10vh]"
      >
        <h2 className="text-3xl font-semibold m mb-8 text-center text-gray-800">Profile Builder</h2>
  
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
          <label className="block font-medium text-gray-700 mb-2">Annual Salary:</label>
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
          <label className="block font-medium text-gray-700 mb-2">Monthly Expenses:</label>
          <input
            type="number"
            name="costs"
            value={formData.costs}
            onChange={handleChange}
            className="block w-full p-3 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Approximate monthly costs"
          />
        </div>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Big Expenses:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Education", "Groceries", "Food Delivery", "Clothes", "Transport", "Other"].map((option) => (
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
  <label className="block font-medium text-gray-700 mb-2">Liabilities/Debts:</label>
  <div className="flex flex-wrap gap-2 mt-2">
    {["Car Loan", "House Loan", "Education Loan", "Medical Loan", "Other"].map((option) => (
      <button
        type="button"
        key={option}
        onClick={() => handleLiabilitySelection(option)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ease-in-out ${
          formData.liabilities[option] !== undefined
            ? "bg-blue-600 text-white"
            : "bg-gray-300 text-gray-700 hover:bg-blue-500"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
  
  {/* Display Selected Liabilities with Input Fields */}
  <div className="mt-4">
    {Object.keys(formData.liabilities).map(
      (option) =>
        formData.liabilities[option] !== undefined && (
          <div key={option} className="mt-2">
            <label className="block font-medium text-gray-700">
              {option}:
            </label>
            <input
              type="number"
              placeholder={`Enter amount for ${option}`}
              value={formData.liabilities[option]}
              onChange={(e) => handleLiabilityAmountChange(option, e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
        )
    )}
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
          <label className="block font-medium text-gray-700 mb-2">Insurance:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {["Health Insurance", "Life Insurance"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("insurance", option)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ease-in-out ${
                  formData.insurance.includes(option)
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
  <label className="block font-medium text-gray-700 mb-2">Do you have savings?</label>
  <div className="flex items-center gap-4">
    <label className="flex items-center">
      <input
        type="checkbox"
        name="savings"
        checked={formData.savings === "Yes"}
        onChange={() => handleCheckboxChange("savings", "Yes")}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="ml-2 text-gray-800">Yes</span>
    </label>
    <label className="flex items-center">
      <input
        type="checkbox"
        name="savings"
        checked={formData.savings === "No"}
        onChange={() => handleCheckboxChange("savings", "No")}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="ml-2 text-gray-800">No</span>
    </label>
  </div>
  {formData.savings === "Yes" && (
    <input
      type="number"
      placeholder="Enter savings amount"
      value={formData.savingsAmount}
      onChange={(e) => setFormData({ ...formData, savingsAmount: e.target.value })}
      className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
    />
  )}
</div>

<div className="mb-6">
  <label className="block font-medium text-gray-700 mb-2">Do you have an Emergency Fund?</label>
  <div className="flex items-center gap-4">
    <label className="flex items-center">
      <input
        type="checkbox"
        name="emergencyFund"
        checked={formData.emergencyFund === "Yes"}
        onChange={() => handleCheckboxChange("emergencyFund", "Yes")}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="ml-2 text-gray-800">Yes</span>
    </label>
    <label className="flex items-center">
      <input
        type="checkbox"
        name="emergencyFund"
        checked={formData.emergencyFund === "No"}
        onChange={() => handleCheckboxChange("emergencyFund", "No")}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="ml-2 text-gray-800">No</span>
    </label>
  </div>
  {formData.emergencyFund === "Yes" && (
    <input
      type="number"
      placeholder="Enter emergency fund amount"
      value={formData.emergencyFundAmount}
      onChange={(e) => setFormData({ ...formData, emergencyFundAmount: e.target.value })}
      className="mt-2 p-2 w-full border border-gray-300 rounded-lg"
    />
  )}
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

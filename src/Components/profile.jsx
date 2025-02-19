import React, { useState, useEffect } from "react";
import {
  User,
  LogOut
} from 'lucide-react';
import { db, auth } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [formData, setFormData] = useState({
    // Existing fields
    name: "",
    age: "",
    salary: "",
    costs: "", // monthly expenses as string/number
    bigExpenses: [],
    liabilities: {},
    currentInvestments: [],
    savings: "", // "Yes" or "No"
    savingsAmount: "", // <--- ADDED: store actual numeric savings
    emergencyFund: "", // "Yes" or "No"
    emergencyFundAmount: "", // <--- ADDED: store actual numeric EF
    desiredInvestments: [],
    insurance: [],
    goals: "",

    // NEW optional fields
    mail: "",
    phoneNumber: "",
    profilePhoto: null, // Will store Base64 string
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

        // We only apply cleanArray to fields that are truly arrays (e.g., bigExpenses, currentInvestments, etc.)
        // For monthly expenses, savingsAmount, and emergencyFundAmount, we treat them as strings/numbers
        const cleanedData = {
          ...data,
          bigExpenses: cleanArray(data.bigExpenses),
          liabilities: cleanLiabilities(data.liabilities),
          currentInvestments: cleanArray(data.currentInvestments),
          desiredInvestments: cleanArray(data.desiredInvestments),
          insurance: cleanArray(data.insurance),
        };

        // Safely handle costs, savingsAmount, and emergencyFundAmount
        // If they're missing or not valid, default to empty string
        const costsVal =
          typeof data.costs === "number" || typeof data.costs === "string"
            ? data.costs
            : "";
        const savingsAmountVal =
          typeof data.savingsAmount === "number" || typeof data.savingsAmount === "string"
            ? data.savingsAmount
            : "";
        const emergencyFundAmountVal =
          typeof data.emergencyFundAmount === "number" || typeof data.emergencyFundAmount === "string"
            ? data.emergencyFundAmount
            : "";

        setFormData({
          name: cleanedData.name || "",
          age: cleanedData.age || "",
          salary: cleanedData.salary || "",
          costs: costsVal.toString(),
          bigExpenses: cleanedData.bigExpenses || [],
          liabilities: cleanedData.liabilities || {},
          currentInvestments: cleanedData.currentInvestments || [],
          savings: cleanedData.savings || "",
          savingsAmount: savingsAmountVal.toString(), // <--- store as string
          emergencyFund: cleanedData.emergencyFund || "",
          emergencyFundAmount: emergencyFundAmountVal.toString(), // <--- store as string
          desiredInvestments: cleanedData.desiredInvestments || [],
          insurance: cleanedData.insurance || [],
          goals: cleanedData.goals || "",
          mail: cleanedData.mail || "",
          phoneNumber: cleanedData.phoneNumber || "",
          profilePhoto: cleanedData.profilePhoto || null,
        });

        toast.success("Profile data loaded successfully!");
      } else {
        toast.error("No profile data found.");
      }
    } catch (error) {
      toast.error("Error loading profile data.");
    }
  };

  // Helper to clean up single-character entries in array fields
  const cleanArray = (val) => {
    if (!Array.isArray(val)) return [];
    return val.filter((item) => item && item.length > 1);
  };

  // Helper to clean up liabilities object
  const cleanLiabilities = (liabilities) => {
    if (!liabilities || typeof liabilities !== "object") return {};
    const cleaned = {};
    for (const key in liabilities) {
      const val = liabilities[key];
      if (val && !isNaN(val)) cleaned[key] = val;
    }
    return cleaned;
  };

  // Handle text/number changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Yes/No (checkbox) for single fields
  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle multiple-choice fields
  const handleMultipleChoice = (field, option) => {
    setFormData((prev) => {
      const updatedChoices = prev[field].includes(option)
        ? prev[field].filter((item) => item !== option)
        : [...prev[field], option];
      return { ...prev, [field]: updatedChoices };
    });
  };

  // Liabilities selection
  const handleLiabilitySelection = (option) => {
    setFormData((prev) => {
      const updatedLiabilities = { ...prev.liabilities };
      if (updatedLiabilities[option] !== undefined) {
        delete updatedLiabilities[option];
      } else {
        updatedLiabilities[option] = "";
      }
      return { ...prev, liabilities: updatedLiabilities };
    });
  };

  // Liabilities amounts
  const handleLiabilityAmountChange = (option, value) => {
    setFormData((prev) => ({
      ...prev,
      liabilities: {
        ...prev.liabilities,
        [option]: value,
      },
    }));
  };

  // Profile photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          profilePhoto: reader.result, // store as Base64
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit form to Firestore with merge option
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      try {
        const cleanedLiabilities = cleanLiabilities(formData.liabilities);

        // Build the final object to store in Firestore
        const cleanedFormData = {
          ...formData,
          bigExpenses: cleanArray(formData.bigExpenses),
          liabilities: cleanedLiabilities,
          currentInvestments: cleanArray(formData.currentInvestments),
          desiredInvestments: cleanArray(formData.desiredInvestments),
          insurance: cleanArray(formData.insurance),

          // Ensure costs is stored as a string or number consistently
          costs: formData.costs.toString() || "",

          // Make sure we keep savingsAmount and emergencyFundAmount
          savingsAmount: formData.savingsAmount.toString() || "",
          emergencyFundAmount: formData.emergencyFundAmount.toString() || "",
        };

        await setDoc(doc(db, "users", userId), cleanedFormData, { merge: true });
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile.");
      }
    } else {
      toast.error("No user is logged in.");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-auto bg-gradient-to-b from-[#172554] to-[#bae6fd]">
      <ToastContainer />
      {/* Main Container with left margin for side navbar */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="max-w-5xl mx-auto p-4">
          {/* Page Title with an icon */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <User className="w-10 h-10 text-white" />
            <h2 className="text-4xl font-extrabold text-white tracking-wide">
              Profile
            </h2>
          </div>

          {/* Two-column layout: Left = General Info, Right = Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: General Information */}
            <div className="bg-white shadow-2xl rounded-xl p-6 bg-opacity-90 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                General Information
              </h3>

              {/* Profile Photo */}
              {formData.profilePhoto && (
                <img
                  src={formData.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full mb-6 mx-auto shadow-lg"
                />
              )}

              {/* Display the data in the left column */}
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  <strong>Name:</strong> {formData.name || "—"}
                </p>
                <p>
                  <strong>Email:</strong> {formData.mail || "—"}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.phoneNumber || "—"}
                </p>
                <p>
                  <strong>Age:</strong> {formData.age || "—"}
                </p>
                <p>
                  <strong>Salary:</strong> {formData.salary || "—"}
                </p>
                <p>
                  <strong>Monthly Costs (Expenses):</strong> {formData.costs || "—"}
                </p>
                <p>
                  <strong>Big Expenses:</strong>{" "}
                  {Array.isArray(formData.bigExpenses) && formData.bigExpenses.length > 0
                    ? formData.bigExpenses.join(", ")
                    : "—"}
                </p>
                <p>
                  <strong>Liabilities:</strong>{" "}
                  {formData.liabilities && Object.keys(formData.liabilities).length
                    ? Object.keys(formData.liabilities)
                        .map((key) => `${key} ($${formData.liabilities[key] || "0"})`)
                        .join(", ")
                    : "—"}
                </p>
                <p>
                  <strong>Current Investments:</strong>{" "}
                  {Array.isArray(formData.currentInvestments) &&
                  formData.currentInvestments.length > 0
                    ? formData.currentInvestments.join(", ")
                    : "—"}
                </p>
                <p>
                  <strong>Desired Investments:</strong>{" "}
                  {Array.isArray(formData.desiredInvestments) &&
                  formData.desiredInvestments.length > 0
                    ? formData.desiredInvestments.join(", ")
                    : "—"}
                </p>
                <p>
                  <strong>Insurance:</strong>{" "}
                  {Array.isArray(formData.insurance) && formData.insurance.length > 0
                    ? formData.insurance.join(", ")
                    : "—"}
                </p>
                <p>
                  <strong>Savings:</strong> {formData.savings || "—"}
                </p>
                {/* Display the numeric savingsAmount */}
                {formData.savings === "Yes" && (
                  <p>
                    <strong>Savings Amount:</strong>{" "}
                    {formData.savingsAmount || "—"}
                  </p>
                )}
                <p>
                  <strong>Emergency Fund:</strong> {formData.emergencyFund || "—"}
                </p>
                {/* Display the numeric emergencyFundAmount */}
                {formData.emergencyFund === "Yes" && (
                  <p>
                    <strong>Emergency Fund Amount:</strong>{" "}
                    {formData.emergencyFundAmount || "—"}
                  </p>
                )}
                <p>
                  <strong>Goals:</strong> {formData.goals || "—"}
                </p>
              </div>
            </div>

            {/* Right Column: Profile Builder Form */}
            <div className="bg-white shadow-2xl rounded-xl p-6 bg-opacity-90 backdrop-blur-sm">
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                  Profile Builder
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Every field on this form is optional. Don't share any
                  information you’re not comfortable with. However, the more
                  details you provide, the better our recommendations!
                </p>

                {/* Name */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Age */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Age:
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Profile Photo Upload */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Profile Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-gray-700 text-base"
                  />
                </div>

                {/* Optional Email */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="mail"
                    value={formData.mail}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Optional Phone */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Phone Number:
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Annual Salary */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Annual Salary:
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="Enter your salary"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Monthly Expenses */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Monthly Expenses:
                  </label>
                  <input
                    type="number"
                    name="costs"
                    value={formData.costs}
                    onChange={handleChange}
                    placeholder="Approximate monthly costs"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Big Expenses */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Big Expenses:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Education", "Groceries", "Food Delivery", "Clothes", "Transport", "Other"].map(
                      (option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleMultipleChoice("bigExpenses", option)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            formData.bigExpenses.includes(option)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Liabilities */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Liabilities/Debts:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Car Loan", "House Loan", "Education Loan", "Medical Loan", "Other"].map(
                      (option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleLiabilitySelection(option)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            formData.liabilities[option] !== undefined
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                  <div className="mt-2">
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
                              onChange={(e) =>
                                handleLiabilityAmountChange(option, e.target.value)
                              }
                              className="mt-1 p-2 w-full border border-gray-300 rounded"
                            />
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Current Investments */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Current Investments:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Other"].map(
                      (option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleMultipleChoice("currentInvestments", option)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            formData.currentInvestments.includes(option)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Desired Investments */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Desired Investments:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Other"].map(
                      (option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleMultipleChoice("desiredInvestments", option)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            formData.desiredInvestments.includes(option)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-gray-700 hover:bg-blue-500"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Insurance */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Insurance:
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Health Insurance", "Life Insurance"].map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => handleMultipleChoice("insurance", option)}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
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

                {/* Savings */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Do you have savings?
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="savings"
                        checked={formData.savings === "Yes"}
                        onChange={() => handleCheckboxChange("savings", "Yes")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-800">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="savings"
                        checked={formData.savings === "No"}
                        onChange={() => handleCheckboxChange("savings", "No")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-800">No</span>
                    </label>
                  </div>
                  {/* If user says "Yes", show the numeric field for the amount */}
                  {formData.savings === "Yes" && (
                    <input
                      type="number"
                      placeholder="Enter savings amount"
                      value={formData.savingsAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          savingsAmount: e.target.value,
                        })
                      }
                      className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                  )}
                </div>

                {/* Emergency Fund */}
                <div className="mb-4">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Do you have an Emergency Fund?
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emergencyFund"
                        checked={formData.emergencyFund === "Yes"}
                        onChange={() => handleCheckboxChange("emergencyFund", "Yes")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-800">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emergencyFund"
                        checked={formData.emergencyFund === "No"}
                        onChange={() => handleCheckboxChange("emergencyFund", "No")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-800">No</span>
                    </label>
                  </div>
                  {/* If user says "Yes", show the numeric field for the amount */}
                  {formData.emergencyFund === "Yes" && (
                    <input
                      type="number"
                      placeholder="Enter emergency fund amount"
                      value={formData.emergencyFundAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyFundAmount: e.target.value,
                        })
                      }
                      className="mt-2 p-2 w-full border border-gray-300 rounded"
                    />
                  )}
                </div>

                {/* Goals */}
                <div className="mb-6">
                  <label className="block font-medium text-gray-700 mb-1 text-base">
                    Financial Goals:
                  </label>
                  <input
                    type="text"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="Enter your goals"
                    className="block w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Save Profile Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Save Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

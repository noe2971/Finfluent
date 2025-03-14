import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { PieChart, AlertTriangle } from "lucide-react";

// Safely convert a value to a string.
function safeValue(val) {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "number") return isNaN(val) ? "N/A" : val.toString();
  if (typeof val === "string") return val.trim() ? val : "N/A";
  return "N/A";
}

const FinancialHealth = () => {
  const [profileData, setProfileData] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const isFetchingRef = useRef(false);
  const apiKey = import.meta.env.VITE_GPT_KEY;

  // Helper to extract risk level from GPT text.
  const extractRiskLevel = (text) => {
    const match = text.match(/(?:Current\s+)?Risk\s+Level:\s*(High|Medium|Low)/i);
    return match ? match[1] : "N/A";
  };

  // Compute a simple hash from the profile data to detect changes.
  const computeProfileHash = (data) => {
    try {
      return btoa(JSON.stringify(data));
    } catch (err) {
      console.error("Error computing profile hash:", err);
      return "";
    }
  };

  // On auth state change, fetch user profile and stored recommendations.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setProfileData(userDocSnap.data());
          }
          // Check for stored recommendations.
          const recDocRef = doc(db, "financialRecommendations", user.uid);
          const recDocSnap = await getDoc(recDocRef);
          if (recDocSnap.exists()) {
            const storedData = recDocSnap.data();
            setAiRecommendations(storedData.recommendations);
            setRiskLevel(extractRiskLevel(storedData.recommendations));
          } else if (userDocSnap.exists()) {
            // If none stored, fetch recommendations from the API.
            getFinancialHealthRecommendations();
          }
        } catch (error) {
          console.error("Error fetching user data or recommendations:", error);
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch recommendations from OpenAI and save them to Firestore.
  const getFinancialHealthRecommendations = async (forceRefresh = false) => {
    if (!profileData || !userId) return;
    if (!apiKey) {
      console.error("API key missing or invalid.");
      setAiRecommendations("Error: API key missing or invalid.");
      return;
    }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoadingRec(true);

    const profileHash = computeProfileHash(profileData);

    // If not forcing refresh, check if stored recommendations match the current profile.
    if (!forceRefresh) {
      try {
        const recDocRef = doc(db, "financialRecommendations", userId);
        const recDocSnap = await getDoc(recDocRef);
        if (recDocSnap.exists()) {
          const storedData = recDocSnap.data();
          if (storedData.profileHash === profileHash) {
            setAiRecommendations(storedData.recommendations);
            setRiskLevel(extractRiskLevel(storedData.recommendations));
            isFetchingRef.current = false;
            setLoadingRec(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking stored recommendations:", error);
      }
    }

    // Build a nicely formatted prompt with detailed instructions.
    const prompt = `
User Data:
- Name: ${safeValue(profileData.name)}
- Age: ${safeValue(profileData.age)}
- Salary: ${safeValue(profileData.salary)}
- Budget: ${safeValue(profileData.budget)}
- Expenses: ${safeValue(profileData.costs || profileData.budget)}
- Money Spent: ${safeValue(profileData.moneySpent)}
- Savings: ${safeValue(profileData.savingsAmount)}
- Emergency Fund: ${safeValue(profileData.emergencyFundAmount)}
- Liabilities: ${profileData.liabilities ? JSON.stringify(profileData.liabilities) : "None"}
- Insurance: ${profileData.insurance && Array.isArray(profileData.insurance) ? profileData.insurance.join(", ") : "None"}
- Big Expenses: ${profileData.bigExpenses && Array.isArray(profileData.bigExpenses) ? profileData.bigExpenses.join(", ") : "None"}
- Current Investments: ${profileData.currentInvestments && Array.isArray(profileData.currentInvestments) ? profileData.currentInvestments.join(", ") : "None"}
- Desired Investments: ${profileData.desiredInvestments && Array.isArray(profileData.desiredInvestments) ? profileData.desiredInvestments.join(", ") : "None"}
- Financial Goals: ${safeValue(profileData.goals)}

Instructions:
Please provide a comprehensive and detailed financial health analysis for the user above. Format your response in plain text using bullet points with exactly three bullet points for each of the following categories. Do not include any other bullet points or numbers outside these categories. Never use the word recommendation, recommendations, recommended, suggestion, advice or any such related word. Mention this is for educational purposes.

Categories:
1. Current Risk Level:
   - Provide three bullet points covering risk assessment, influencing factors, and recommendations.
2. Monthly Savings Target:
   - Provide three bullet points covering recommended target, calculation rationale, and additional considerations.
3. Emergency Fund Target:
   - Provide three bullet points covering the recommended emergency fund, reasoning, and steps to build it.
4. Asset Allocation:
   - Provide three bullet points covering recommended percentages for stocks, bonds, and cash/savings, along with explanations.
5. Debt Management:
   - Provide three bullet points covering strategies for reducing debt, actionable steps, and timeline recommendations.
6. Insurance Advice:
   - Provide three bullet points covering health and life insurance considerations and recommendations.
7. Additional Actions & Priorities:
   - Provide three bullet points outlining further recommendations, prioritization, and rationale.
8. Methodology & Conclusion:
   - Provide three bullet points summarizing the analytical approach, rationale behind recommendations, and overall conclusion.

Return your answer in plain text with these exact formatting guidelines and ensure each category contains exactly three bullet points.
    `;
    console.log("GPT Prompt:", prompt);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const botResponse = response.data.choices[0].message.content;
      console.log("GPT Response:", botResponse);
      setAiRecommendations(botResponse);
      setRiskLevel(extractRiskLevel(botResponse));

      // Save the recommendations to Firestore.
      const recDocRef = doc(db, "financialRecommendations", userId);
      await setDoc(recDocRef, {
        recommendations: botResponse,
        profileHash: profileHash,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error fetching AI recommendations:", error?.response || error);
      if (error?.response?.status === 429) {
        setErrorMessage("Rate limit exceeded (429). Try again later.");
      } else {
        setErrorMessage("Sorry, we were unable to fetch recommendations.");
      }
      setAiRecommendations("");
    } finally {
      isFetchingRef.current = false;
      setLoadingRec(false);
    }
  };

  // Refresh button forces a new API call.
  const handleRefresh = () => {
    setErrorMessage("");
    getFinancialHealthRecommendations(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#172554] to-[#bae6fd] p-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            <PieChart className="w-10 h-10 text-white" />
            <h1 className="text-5xl font-extrabold text-white tracking-wide">
              Financial Health
            </h1>
          </div>
        </header>
        {riskLevel && riskLevel !== "N/A" && (
          <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-bold mb-4">Current Risk Level</h2>
            <p className="text-lg">{riskLevel}</p>
          </section>
        )}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Current Financial Status</h2>
            <div className="space-y-3 text-lg">
              <p><strong>Annual Salary:</strong> {profileData?.salary ? `$${profileData.salary}` : "N/A"}</p>
              <p><strong>Savings:</strong> {profileData?.savingsAmount ? `$${profileData.savingsAmount}` : "N/A"}</p>
              <p><strong>Emergency Fund:</strong> {profileData?.emergencyFundAmount ? `$${profileData.emergencyFundAmount}` : "N/A"}</p>
              <p><strong>Total Debts:</strong> {profileData?.liabilities ? `$${Object.values(profileData.liabilities).reduce((acc, val) => acc + Number(val), 0)}` : "N/A"}</p>
              <p><strong>Health Insurance:</strong> {profileData?.insurance?.includes("Health Insurance") ? "Yes" : "No"}</p>
              <p><strong>Life Insurance:</strong> {profileData?.insurance?.includes("Life Insurance") ? "Yes" : "No"}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Monthly Budget & Expenses</h2>
            <div className="space-y-3 text-lg">
              <p><strong>Budget:</strong> {profileData?.budget ? `$${profileData.budget}` : "N/A"}</p>
              <p><strong>Expenses:</strong> {profileData?.costs ? `$${profileData.costs}` : profileData?.budget ? `$${profileData.budget}` : "N/A"}</p>
              <p><strong>Money Spent:</strong> {profileData?.moneySpent ? `$${profileData.moneySpent}` : "N/A"}</p>
            </div>
          </div>
        </section>
        <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Actionable Changes</h2>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              disabled={loadingRec || errorMessage.includes("Rate limit")}
            >
              {loadingRec ? "Loading..." : "Refresh Action Plan"}
            </button>
          </div>
          {errorMessage ? (
            <div className="text-red-600 font-semibold">{errorMessage}</div>
          ) : aiRecommendations ? (
            <div className="text-lg whitespace-pre-wrap">{aiRecommendations}</div>
          ) : (
            <p className="text-lg">Loading plan...</p>
          )}
        </section>
        <footer className="text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Disclaimer:
          </p>
          <p>
            The information provided on this page is generated by AI based on your data.
            Please do your own research and consult a financial advisor before making any changes.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default FinancialHealth;

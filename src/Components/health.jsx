import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { PieChart, AlertTriangle } from "lucide-react";

/**
 * Safely convert a value to a string for the prompt.
 * - Returns "N/A" if the value is nullish, empty, or NaN.
 */
function safeValue(val) {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "number") {
    return isNaN(val) ? "N/A" : val.toString();
  }
  if (typeof val === "string") {
    if (!val.trim()) return "N/A";
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed.toString();
    return val;
  }
  return "N/A";
}

const FinancialHealth = () => {
  const [profileData, setProfileData] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Track if we are currently calling the API
  const isFetchingRef = useRef(false);

  // Make sure you have your GPT key set in .env
  const apiKey = import.meta.env.VITE_GPT_KEY;

  // Listen for auth state and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            console.warn("User document does not exist in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute a hash for caching
  const computeProfileHash = (data) => {
    try {
      return btoa(JSON.stringify(data));
    } catch (err) {
      console.error("Error computing profile hash:", err);
      return "";
    }
  };

  // Extract "High", "Medium", or "Low" from the GPT text
  const extractRiskLevel = (text) => {
    const match = text.match(/(?:Current\s+)?Risk\s+Level:\s*(High|Medium|Low)/i);
    return match ? match[1] : "N/A";
  };

  // Main function to fetch AI recommendations
  const getFinancialHealthRecommendations = async (forceRefresh = false) => {
    if (!profileData) return;
    if (!apiKey) {
      console.error("OpenAI API key is missing or invalid.");
      setAiRecommendations("Error: API key is missing or invalid.");
      return;
    }

    // Prevent multiple calls at once
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const profileHash = computeProfileHash(profileData);

    // Attempt to load from localStorage unless forcing a refresh
    if (!forceRefresh) {
      const storedData = localStorage.getItem("financialHealthRecommendations");
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.profileHash === profileHash) {
            setAiRecommendations(parsed.recommendations);
            setRiskLevel(extractRiskLevel(parsed.recommendations));
            isFetchingRef.current = false;
            return;
          }
        } catch (err) {
          console.error("Error parsing localStorage data:", err);
        }
      }
    }

    // For debugging: see what Firestore data we have
    console.log("Profile Data for GPT Prompt:", profileData);

    // Build the user data string, using safeValue for each field
    const userProfileData = `
User Profile Data:
- Name: ${safeValue(profileData.name)}
- Age: ${safeValue(profileData.age)}
- Annual Salary: ${safeValue(profileData.salary)}
- Monthly Budget: ${safeValue(profileData.budget)}
- Monthly Expenses: ${
      safeValue(profileData.costs) !== "N/A"
        ? safeValue(profileData.costs)
        : safeValue(profileData.budget)
    }
- Money Spent this Month: ${safeValue(profileData.moneySpent)}
- Current Savings: ${safeValue(profileData.savingsAmount)}
- Current Emergency Fund: ${safeValue(profileData.emergencyFundAmount)}
- Liabilities (Debts/Loans): ${
      profileData.liabilities
        ? JSON.stringify(profileData.liabilities)
        : "None"
    }
- Insurance: ${
      profileData.insurance && Array.isArray(profileData.insurance)
        ? profileData.insurance.join(", ")
        : "None"
    }
- Big Expenses: ${
      profileData.bigExpenses && Array.isArray(profileData.bigExpenses)
        ? profileData.bigExpenses.join(", ")
        : "None"
    }
- Current Investments: ${
      profileData.currentInvestments && Array.isArray(profileData.currentInvestments)
        ? profileData.currentInvestments.join(", ")
        : "None"
    }
- Desired Investments: ${
      profileData.desiredInvestments && Array.isArray(profileData.desiredInvestments)
        ? profileData.desiredInvestments.join(", ")
        : "None"
    }
- Financial Goals: ${safeValue(profileData.goals)}
    `;

    const prompt = `
${userProfileData}

Based on the above data, please provide comprehensive financial health recommendations using your AI expertise. Ensure that you include the following clearly labeled sections:

1. Current Risk Level:
   - Clearly state "Current Risk Level:" followed by a determination of High, Medium, or Low risk, and provide a brief explanation.

2. Monthly Savings Target:
   - Recommend a realistic monthly savings target.

3. Emergency Fund Target:
   - Recommend an emergency fund target based on monthly expenses (or budget if expenses are not provided) and explain why a 6-month emergency fund is advisable.

4. Asset Allocation:
   - Provide an asset allocation recommendation, specifying what percentage (and approximate dollar amounts) of current savings should be allocated to stocks/ETFs, bonds, and a savings account. Consider guidelines like the 90-age heuristic if appropriate.

5. Debt Management:
   - Advise on strategies for paying down any loans or debts.

6. Insurance:
   - Advise on whether to obtain Health and/or Life Insurance if not already covered.

7. Additional Actionable Changes & Financial Goals:
   - List any additional changes or financial goals.
   - At the bottom, include an "Order of Priority" section that explains which change should be made first (and why), followed by subsequent priorities with explanations.

8. Methodology:
   - Explain how the calculations and recommendations were derived.

9. Conclusion:
   - Summarize all the recommendations and provide an overall conclusion.

Please return your answer in plain text with clearly labeled sections.
    `;

    // For debugging: log the prompt we are sending
    console.log("GPT Prompt:", prompt);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
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
      console.log("GPT Response:", botResponse); // Debug the entire GPT response

      setAiRecommendations(botResponse);
      setRiskLevel(extractRiskLevel(botResponse));

      // Cache in localStorage
      localStorage.setItem(
        "financialHealthRecommendations",
        JSON.stringify({
          profileHash,
          recommendations: botResponse,
        })
      );
    } catch (error) {
      console.error("Error fetching AI recommendations:", error?.response || error);
      // If it's a 429 (rate limit) from OpenAI, handle gracefully
      if (error?.response?.status === 429) {
        setErrorMessage(
          "Rate limit exceeded (429). You have hit the OpenAI usage limit. Please try again later."
        );
      } else {
        setErrorMessage("Sorry, we were unable to fetch recommendations at this time.");
      }
      setAiRecommendations("");
    } finally {
      // Reset the flag so we can call again if needed
      isFetchingRef.current = false;
    }
  };

  // Call getFinancialHealthRecommendations once profileData is ready
  useEffect(() => {
    if (profileData) {
      getFinancialHealthRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  // Manual refresh
  const handleRefresh = () => {
    setErrorMessage("");
    getFinancialHealthRecommendations(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#172554] to-[#bae6fd] p-8 text-gray-800">
      {/* Main container with left margin for sidebar */}
      <div className="max-w-6xl mx-auto ml-64">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3">
            <PieChart className="w-10 h-10 text-white" />
            <h1 className="text-5xl font-extrabold text-white tracking-wide">
              Financial Health
            </h1>
          </div>
        </header>

        {/* Display Current Risk Level if we have it */}
        {riskLevel && riskLevel !== "N/A" && (
          <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-bold mb-4">Current Risk Level</h2>
            <p className="text-lg">{riskLevel}</p>
          </section>
        )}

        {/* Current Financial Status */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Current Financial Status</h2>
            <div className="space-y-3 text-lg">
              <p>
                <strong>Annual Salary:</strong>{" "}
                {profileData?.salary ? `$${profileData.salary}` : "N/A"}
              </p>
              <p>
                <strong>Current Savings:</strong>{" "}
                {profileData?.savingsAmount ? `$${profileData.savingsAmount}` : "N/A"}
              </p>
              <p>
                <strong>Current Emergency Fund:</strong>{" "}
                {profileData?.emergencyFundAmount ? `$${profileData.emergencyFundAmount}` : "N/A"}
              </p>
              <p>
                <strong>Total Debts:</strong>{" "}
                {profileData?.liabilities
                  ? `$${Object.values(profileData.liabilities).reduce(
                      (acc, val) => acc + Number(val),
                      0
                    )}`
                  : "N/A"}
              </p>
              <p>
                <strong>Health Insurance:</strong>{" "}
                {profileData?.insurance?.includes("Health Insurance") ? "Yes" : "No"}
              </p>
              <p>
                <strong>Life Insurance:</strong>{" "}
                {profileData?.insurance?.includes("Life Insurance") ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Monthly Budget & Expenses</h2>
            <div className="space-y-3 text-lg">
              <p>
                <strong>Monthly Budget:</strong>{" "}
                {profileData?.budget ? `$${profileData.budget}` : "N/A"}
              </p>
              <p>
                <strong>Monthly Expenses:</strong>{" "}
                {profileData?.costs
                  ? `$${profileData.costs}`
                  : profileData?.budget
                  ? `$${profileData.budget}`
                  : "N/A"}
              </p>
              <p>
                <strong>Money Spent:</strong>{" "}
                {profileData?.moneySpent ? `$${profileData.moneySpent}` : "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* Actionable Changes & AI Recommendations */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Actionable Changes & Recommendations</h2>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              disabled={errorMessage.includes("Rate limit")}
            >
              Refresh AI Recommendations
            </button>
          </div>
          {errorMessage ? (
            <div className="text-red-600 font-semibold">{errorMessage}</div>
          ) : aiRecommendations ? (
            <div className="text-lg whitespace-pre-wrap">{aiRecommendations}</div>
          ) : (
            <p className="text-lg">Loading recommendations...</p>
          )}
        </section>

        {/* Disclaimer */}
        <footer className="text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Disclaimer:
          </p>
          <p>
            All recommendations provided on this page are generated by AI based on your provided data.
            Please do your own research and consult with a financial advisor before making any actionable changes.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default FinancialHealth;

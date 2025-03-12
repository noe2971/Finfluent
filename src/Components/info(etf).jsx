import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Information = () => {
  const [searchParams] = useSearchParams();
  const stockSymbol = searchParams.get('stock');
  const gptKey = import.meta.env.VITE_GPT_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const [profileData, setProfileData] = useState(null);
  const [stockInfo, setStockInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [analysisLoaded, setAnalysisLoaded] = useState(false);
  const alphaVantageKey = "TQM04TF5N07U077G";
  
  // Since every asset is assumed to be an ETF, set isETF to true.
  const isETF = true;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setProfileData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Try to fetch cached analysis from Firestore.
  const fetchCachedAnalysis = async () => {
    if (!userId || !stockSymbol) return false;
    try {
      const analysisDocRef = doc(db, "investmentAnalysis", `${userId}_${stockSymbol}`);
      const docSnap = await getDoc(analysisDocRef);
      if (docSnap.exists()) {
        setStockInfo(docSnap.data().analysis);
        setAnalysisLoaded(true);
        return true;
      }
    } catch (error) {
      console.error("Error fetching cached analysis:", error);
    }
    return false;
  };

  // Fetch data from Alpha Vantage using ETF endpoints.
  const fetchAlphaData = async () => {
    if (!stockSymbol) return null;
    
    const overviewUrl = `https://www.alphavantage.co/query?function=ETF_PROFILE&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;
    const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;
    const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;

    try {
      const [overviewRes, dailyRes, monthlyRes] = await Promise.all([
        axios.get(overviewUrl),
        axios.get(dailyUrl),
        axios.get(monthlyUrl)
      ]);
      return {
        isETF,
        overview: overviewRes.data,
        daily: dailyRes.data,
        monthly: monthlyRes.data
      };
    } catch (error) {
      console.error("Error fetching Alpha Vantage data:", error);
      return null;
    }
  };

  // Fetch investment analysis from ChatGPT or use cached analysis if available.
  const fetchStockInfo = async (forceRefresh = false) => {
    if (!stockSymbol) return;
    setLoading(true);

    if (!forceRefresh && userId && analysisLoaded) {
      setLoading(false);
      return;
    } else if (!forceRefresh && userId) {
      const cached = await fetchCachedAnalysis();
      if (cached) {
        setLoading(false);
        return;
      }
    }

    const userProfile = profileData
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments ? profileData.currentInvestments.join(', ') : 'None'}.`
      : "No user profile available.";

    const alphaData = await fetchAlphaData();
    let alphaInfo = "";
    let latestClose = "N/A";
    if (alphaData && alphaData.daily && alphaData.daily["Time Series (Daily)"]) {
      const dailyDates = Object.keys(alphaData.daily["Time Series (Daily)"]);
      const latestDate = dailyDates[0];
      latestClose = alphaData.daily["Time Series (Daily)"][latestDate]["4. close"];
    }

    if (alphaData) {
      const overview = alphaData.overview;
      let overviewStr = overview && overview.ETFName ? `ETF Name: ${overview.ETFName}. ` : "";
      overviewStr += overview && overview.InceptionDate ? `Inception: ${overview.InceptionDate}. ` : "";
      overviewStr += overview && overview.NetAssets ? `Net Assets: ${overview.NetAssets}. ` : "";
      overviewStr += overview && overview.ExpenseRatio ? `Expense Ratio: ${overview.ExpenseRatio}. ` : "";
      alphaInfo = `${overviewStr} Latest Daily Close Price: ${latestClose}.`;
    } else {
      alphaInfo = "No Alpha Vantage data available.";
    }

    const prompt = `${userProfile} Alpha Vantage Data: ${alphaInfo} Provide a concise investment analysis for the asset corresponding to "${stockSymbol}" using its full name (not the ticker). Begin your response with: "Disclaimer: This is AI generated advice and should not be solely relied upon. Please review the details yourself before making any decisions." Then, using the most recent financial data available, present key financial ratios (with explanations), recent trends, market performance, and potential risks. Include both positive and negative factors, and conclude with a definite yes or no as to whether it is a good investment. Keep your response under 200 words. Do not mention that you are getting data from OpenAI or Alpha Vantage.`;
    
    try {
      const result = await axios.post(
        apiUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${gptKey}`,
          },
        }
      );
      const botResponse = result.data.choices[0].message.content;
      setStockInfo(botResponse);
      setAnalysisLoaded(true);
      if (userId) {
        const analysisDocRef = doc(db, "investmentAnalysis", `${userId}_${stockSymbol}`);
        await setDoc(analysisDocRef, {
          analysis: botResponse,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching investment analysis:', error);
      setStockInfo("Sorry, we were unable to fetch the investment analysis. Please try again later or choose another investment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stockSymbol && userId && profileData && !analysisLoaded) {
      fetchStockInfo();
    }
  }, [stockSymbol, userId, profileData, analysisLoaded]);

  const handleRefresh = () => {
    setAnalysisLoaded(false);
    fetchStockInfo(true);
  };

  // Use ETF URL for "Learn More"
  const moreInfoUrl = `https://stockanalysis.com/etf/${stockSymbol}/`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#123456] to-[#0e213a] text-white p-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          {stockSymbol} Investment Analysis
        </h2>
        {loading ? (
          <p className="text-center text-gray-400">
            Fetching investment analysis...
          </p>
        ) : (
          <>
            <p className="text-lg text-gray-200">{stockInfo}</p>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Refresh Information
              </button>
              <a target="_blank" rel="noopener noreferrer" href={moreInfoUrl}>
                <div className="text-blue-500 font-bold text-[3vh] flex items-center justify-center">
                  Learn More
                </div>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Information;

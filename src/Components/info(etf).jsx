import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
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
  // Your Alpha Vantage key
  const alphaVantageKey = "TQM04TF5N07U077G";
  
  // Define a simple ETF check
  const etfSymbols = ["QQQ", "SPY", "DIA", "VTI", "IVV"];
  const isETF = stockSymbol ? etfSymbols.includes(stockSymbol.toUpperCase()) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setProfileData(userDoc.data());
    }
  };

  // Fetch multiple endpoints from Alpha Vantage and aggregate the data.
  const fetchAlphaData = async () => {
    if (!stockSymbol) return null;
    
    // Define endpoint URLs based on asset type.
    let overviewUrl, dailyUrl, monthlyUrl;
    if (isETF) {
      overviewUrl = `https://www.alphavantage.co/query?function=ETF_PROFILE&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;
    } else {
      overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;
    }
    dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;
    monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${stockSymbol}&apikey=${alphaVantageKey}`;

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

  useEffect(() => {
    const fetchStockInfo = async () => {
      setLoading(true);
      
      // Build a string from the user profile.
      const userProfile = profileData
        ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments ? profileData.currentInvestments.join(', ') : 'None'}.`
        : "No user profile available.";

      // Fetch data from Alpha Vantage.
      const alphaData = await fetchAlphaData();
      let alphaInfo = "";
      if (alphaData) {
        // Extract the latest daily close price.
        let latestClose = "N/A";
        if (alphaData.daily && alphaData.daily["Time Series (Daily)"]) {
          const dailyDates = Object.keys(alphaData.daily["Time Series (Daily)"]);
          const latestDate = dailyDates[0];
          latestClose = alphaData.daily["Time Series (Daily)"][latestDate]["4. close"];
        }
        
        if (alphaData.isETF) {
          const overview = alphaData.overview;
          let overviewStr = overview && overview.ETFName ? `ETF Name: ${overview.ETFName}. ` : "";
          overviewStr += overview && overview.InceptionDate ? `Inception: ${overview.InceptionDate}. ` : "";
          overviewStr += overview && overview.NetAssets ? `Net Assets: ${overview.NetAssets}. ` : "";
          overviewStr += overview && overview.ExpenseRatio ? `Expense Ratio: ${overview.ExpenseRatio}. ` : "";
          alphaInfo = `${overviewStr} Latest Daily Close Price: ${latestClose}.`;
        } else {
          const overview = alphaData.overview;
          let overviewStr = overview && overview.Name ? `Company Name: ${overview.Name}. ` : "";
          overviewStr += overview && overview.Sector ? `Sector: ${overview.Sector}. ` : "";
          overviewStr += overview && overview.Industry ? `Industry: ${overview.Industry}. ` : "";
          overviewStr += overview && overview.MarketCapitalization ? `Market Cap: ${overview.MarketCapitalization}. ` : "";
          overviewStr += overview && overview.PERatio ? `PE Ratio: ${overview.PERatio}. ` : "";
          alphaInfo = `${overviewStr} Latest Daily Close Price: ${latestClose}.`;
        }
      } else {
        alphaInfo = "No Alpha Vantage data available.";
      }

      // Build the prompt for ChatGPT.
      const prompt = `${userProfile} Alpha Vantage Data: ${alphaInfo} Provide a concise investment analysis for the asset corresponding to "${stockSymbol}" using its full name (not the ticker). Begin your response with: "Disclaimer: This is AI generated advice and should not be solely relied upon. Please review the details yourself before making any decisions." Then, using the most recent financial data available (ideally from 2025 or the latest possible), present key financial ratios (with explanations), recent trends, market performance, and potential risks. Cite your sources and explain how each piece of data supports your analysis. Keep your response under 200 words, include both positive and negative factors, and conclude by stating whether it is a good or a bad investment. Make it more personal and give a definite yes or no if it is a good investment. Most impoortantly never and i mean never, mention you are getting data from Open Ai or Alpha vantage and never dsay I cant provide real time data, just provide the user with whatever data you have, no need to present historical data also, notthing mroe than 5 years old, just use it to help you make reccomendations. No need to mention sources in the end, only mention it if for example you use na news article or something for your freference. `;

      try {
        const result = await axios.post(
          apiUrl,
          {
            model: "gpt-4",
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
      } catch (error) {
        console.error('Error fetching investment analysis:', error);
        setStockInfo("Sorry, we were unable to fetch the investment analysis. Please try again later or choose another investment.");
      } finally {
        setLoading(false);
      }
    };

    if (stockSymbol) fetchStockInfo();
  }, [stockSymbol, profileData]);

  // Set the "more information" link based on asset type.
  const moreInfoUrl = isETF 
    ? `https://stockanalysis.com/etf/${stockSymbol}/` 
    : `https://stockanalysis.com/stocks/${stockSymbol}/`;

  return (
    <div className="flex flex-col justify-center h-screen bg-gradient-to-b from-[#123456] to-[#0e213a] text-white p-8">
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
            <a target="_blank" rel="noopener noreferrer" href={moreInfoUrl}>
              <div className="text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-[5vh]">
                Learn More
              </div>
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Information;

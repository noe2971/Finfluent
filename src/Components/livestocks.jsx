import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Stocks = () => {
  const gptKey = import.meta.env.VITE_GPT_KEY;
  const alphaVantageKey = import.meta.env.VITE_ALPHAVANTAGE_KEY; // Replace with your actual key
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  // Default list of stock ticker symbols.
  const defaultStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'UNH', 'V',
    'RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICIBANK'
  ];

  // Mapping from ticker symbol to full company name.
  const stockFullNames = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    TSLA: "Tesla, Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms, Inc.",
    JPM: "JPMorgan Chase & Co.",
    UNH: "UnitedHealth Group Inc.",
    V: "Visa Inc.",
    RELIANCE: "Reliance Industries Limited",
    TCS: "Tata Consultancy Services",
    HDFC: "HDFC Bank Limited",
    INFY: "Infosys Limited",
    ICICIBANK: "ICICI Bank Limited"
  };

  // Convert defaultStocks into an array of objects { symbol, name }
  const defaultStockOptions = defaultStocks.map(symbol => ({
    symbol,
    name: stockFullNames[symbol] || symbol
  }));

  // Component state variables.
  const [selectedStock, setSelectedStock] = useState(defaultStockOptions[0].symbol);
  const [stocks, setStocks] = useState(defaultStockOptions);
  const [stockInfo, setStockInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [newStockName, setNewStockName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);
  // This flag ensures we only check Firestore cache once on mount.
  const [hasCheckedFirebase, setHasCheckedFirebase] = useState(false);

  const navigate = useNavigate();

  // Listen for auth changes and load user profile.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // When profile data changes, combine default stocks with saved stocks.
  useEffect(() => {
    const savedStocks = profileData?.savedStocks || [];
    const savedStockOptions = savedStocks.map(symbol => ({
      symbol,
      name: stockFullNames[symbol] || symbol
    }));
    const combined = [...defaultStockOptions, ...savedStockOptions];
    // Remove duplicates by ticker symbol.
    const unique = combined.filter((option, index, self) =>
      index === self.findIndex(o => o.symbol === option.symbol)
    );
    setStocks(unique);
  }, [profileData]);

  // Load saved stock recommendations.
  useEffect(() => {
    if (profileData && profileData.stockRecommendations) {
      setRecommendations(profileData.stockRecommendations);
    }
  }, [profileData]);

  // Generate exactly 5 stock recommendations.
  const fetchStockRecommendations = async () => {
    if (!profileData) {
      setErrorMessage('User profile not loaded yet.');
      return;
    }
    const profileString = `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Expenses: ${profileData.expenses}.`;
    const combinedStocks = stocks.map(s => s.symbol).join(', ');
    const extraInstruction = stocks.length < 10
      ? ` Note: There are only ${stocks.length} stocks provided; please include additional stock suggestions to reach a total of 10 recommendations.`
      : '';
    const prompt = `${profileString} Given the above user profile, return exactly 5 stock recommendations from the following list: ${combinedStocks}.${extraInstruction} Ensure that there are no repeated stocks in your recommendations. For each recommended stock, provide a ticker and one concise sentence (no more than 10 words) of reasoning why it is a good investment right now. Label them from 'Must Buy' to 'Strong Buy' to 'Buy' in that order, with no extra commentary.`;
    
    try {
      const response = await axios.post(
        apiUrl,
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${gptKey}`,
          },
        }
      );
      const recs = response.data.choices[0].message.content
        .trim()
        .split('\n')
        .filter(line => line.trim() !== '');
      const finalRecs = recs.slice(0, 5);
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { stockRecommendations: finalRecs }, { merge: true });
      setRecommendations(finalRecs);
      setProfileData(prev => ({ ...prev, stockRecommendations: finalRecs }));
    } catch (error) {
      console.error('Error fetching stock recommendations:', error);
      setRecommendations([]);
    }
  };

  // Define whether the asset is an ETF.
  const etfSymbols = ["QQQ", "SPY", "DIA", "VTI", "IVV"];
  const isETF = selectedStock ? etfSymbols.includes(selectedStock.toUpperCase()) : false;

  // Try to fetch cached analysis from Firestore.
  const fetchCachedAnalysis = async () => {
    if (!userId || !selectedStock) return false;
    try {
      const analysisDocRef = doc(db, "investmentAnalysis", `${userId}_${selectedStock}`);
      const docSnap = await getDoc(analysisDocRef);
      if (docSnap.exists()) {
        setStockInfo(docSnap.data().analysis);
        return true;
      }
    } catch (error) {
      console.error("Error fetching cached analysis:", error);
    }
    return false;
  };

  // Fetch data from Alpha Vantage.
  const fetchAlphaData = async () => {
    if (!selectedStock) return null;
    
    let overviewUrl, dailyUrl, monthlyUrl, intradayUrl;
    if (isETF) {
      overviewUrl = `https://www.alphavantage.co/query?function=ETF_PROFILE&symbol=${selectedStock}&apikey=${alphaVantageKey}`;
      dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${selectedStock}&apikey=${alphaVantageKey}`;
      monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${selectedStock}&apikey=${alphaVantageKey}`;
    } else {
      overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${selectedStock}&apikey=${alphaVantageKey}`;
      dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${selectedStock}&apikey=${alphaVantageKey}`;
      monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${selectedStock}&apikey=${alphaVantageKey}`;
      intradayUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${selectedStock}&interval=60min&apikey=${alphaVantageKey}`;
    }

    try {
      if (isETF) {
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
      } else {
        const [overviewRes, dailyRes, monthlyRes, intradayRes] = await Promise.all([
          axios.get(overviewUrl),
          axios.get(dailyUrl),
          axios.get(monthlyUrl),
          axios.get(intradayUrl)
        ]);
        return {
          isETF,
          overview: overviewRes.data,
          daily: dailyRes.data,
          monthly: monthlyRes.data,
          intraday: intradayRes.data
        };
      }
    } catch (error) {
      console.error("Error fetching Alpha Vantage data:", error);
      return null;
    }
  };

  // Fetch investment analysis from ChatGPT (or use cached analysis if available).
  const fetchStockInfo = async (forceRefresh = false) => {
    if (!selectedStock) return;
    setLoading(true);

    if (!forceRefresh && userId && !hasCheckedFirebase) {
      const cached = await fetchCachedAnalysis();
      setHasCheckedFirebase(true);
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
      if (alphaData.isETF) {
        const overview = alphaData.overview;
        let overviewStr = overview && overview.ETFName ? `ETF Name: ${overview.ETFName}. ` : "";
        overviewStr += overview && overview.InceptionDate ? `Inception: ${overview.InceptionDate}. ` : "";
        overviewStr += overview && overview.NetAssets ? `Net Assets: ${overview.NetAssets}. ` : "";
        overviewStr += overview && overview.ExpenseRatio ? `Expense Ratio: ${overview.ExpenseRatio}. ` : "";
        alphaInfo = `${overviewStr} Latest Daily Close Price: ${latestClose}.`;
      } else {
        let latestIntradayPrice = "N/A";
        if (alphaData.intraday && alphaData.intraday["Time Series (60min)"]) {
          const intradayDates = Object.keys(alphaData.intraday["Time Series (60min)"]);
          const latestIntradayTime = intradayDates[0];
          latestIntradayPrice = alphaData.intraday["Time Series (60min)"][latestIntradayTime]["4. close"];
        }
        const overview = alphaData.overview;
        let overviewStr = overview && overview.Name ? `Company Name: ${overview.Name}. ` : "";
        overviewStr += overview && overview.Sector ? `Sector: ${overview.Sector}. ` : "";
        overviewStr += overview && overview.Industry ? `Industry: ${overview.Industry}. ` : "";
        overviewStr += overview && overview.MarketCapitalization ? `Market Cap: ${overview.MarketCapitalization}. ` : "";
        overviewStr += overview && overview.PERatio ? `PE Ratio: ${overview.PERatio}. ` : "";
        alphaInfo = `${overviewStr} Latest Daily Close Price: ${latestClose}. Latest Intraday Price (60min): ${latestIntradayPrice}.`;
      }
    } else {
      alphaInfo = "No Alpha Vantage data available.";
    }

    const prompt = `${userProfile} Alpha Vantage Data: ${alphaInfo} Provide a concise investment analysis for the asset corresponding to "${selectedStock}" using its full name (not the ticker). Begin your response with: "Disclaimer: This is AI generated advice and should not be solely relied upon. Please review the details yourself before making any decisions." Then, using the most recent financial data available, present key financial ratios (with explanations), recent trends, market performance, and potential risks. Include both positive and negative factors, and conclude with a definite yes or no as to whether it is a good investment. Keep your response under 200 words. Do not mention that you are getting data from OpenAI or Alpha Vantage.`;
    
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

      if (userId) {
        const analysisDocRef = doc(db, "investmentAnalysis", `${userId}_${selectedStock}`);
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

  // Auto-fetch analysis when dependencies change.
  useEffect(() => {
    if (selectedStock && userId && profileData && !hasCheckedFirebase) {
      fetchStockInfo();
    }
  }, [selectedStock, userId, profileData, hasCheckedFirebase]);

  // Refresh button handler to force a new API call.
  const handleRefresh = () => {
    setHasCheckedFirebase(false);
    fetchStockInfo(true);
  };

  // "Learn More" URL based on asset type.
  const moreInfoUrl = isETF 
    ? `https://stockanalysis.com/etf/${selectedStock}/`
    : `https://stockanalysis.com/stocks/${selectedStock}/`;

  // GPT call to get the ticker symbol for a stock.
  const fetchTickerSymbol = async (stockInput) => {
    const prompt = `Find the ticker symbol for the stock "${stockInput}". Only respond with the ticker symbol if it is listed on https://stockanalysis.com. If not, respond with "INVALID".`;
    try {
      const response = await axios.post(
        apiUrl,
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${gptKey}`,
          },
        }
      );
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error fetching ticker symbol:', error.message);
      return null;
    }
  };

  // Add a new stock.
  const handleAddStock = async () => {
    if (!newStockName.trim()) {
      setErrorMessage('Please enter a stock name.');
      return;
    }
    setErrorMessage('');
    const tickerSymbol = await fetchTickerSymbol(newStockName);
    if (tickerSymbol && tickerSymbol !== 'INVALID') {
      if (stocks.some(s => s.symbol === tickerSymbol)) {
        setErrorMessage('Stock is already in the list.');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', userId);
        const currentStocks = profileData?.savedStocks || [];
        const updatedStocks = [...currentStocks, tickerSymbol];
        await setDoc(userDocRef, { savedStocks: updatedStocks }, { merge: true });
        setProfileData(prev => ({ ...prev, savedStocks: updatedStocks }));
        const newEntry = { symbol: tickerSymbol, name: newStockName };
        setStocks(prev => [...prev, newEntry]);
        setNewStockName('');
      } catch (error) {
        console.error('Error adding stock:', error);
      }
    } else {
      setErrorMessage('The stock is either invalid or not listed on stockanalysis.com.');
    }
  };

  return (
    <div className="flex h-screen w-[82%] bg-gradient-to-b from-[#172554] to-[#bae6fd] text-white mx-auto p-4">
      <div className="flex flex-col md:flex-row w-full gap-4">
        {/* Main container */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl overflow-y-auto">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Top Stocks</h2>
          <div className="flex justify-center items-center gap-6 mb-6">
            <button
              onClick={() => navigate('/etfs')}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transition duration-300"
            >
              ETFs
            </button>
            <button
              onClick={() => navigate('/livestocks')}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transition duration-300"
            >
              Stocks
            </button>
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium text-blue-700 mb-2">Select a Stock</label>
            <select
              value={selectedStock}
              onChange={(e) => { setSelectedStock(e.target.value); setHasCheckedFirebase(false); }}
              className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
            >
              {stocks.map((stock, index) => (
                <option key={index} value={stock.symbol}>
                  {stock.name}
                </option>
              ))}
            </select>
          </div>
          {/* Investment Analysis Section */}
          <div className="mt-8">
            {loading ? (
              <p className="text-center text-blue-900">Fetching investment analysis...</p>
            ) : (
              <div className="text-lg text-gray-800">{stockInfo}</div>
            )}
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
            {/* Add Stock Section */}
            <div className="mt-6">
              <label className="block text-lg font-medium text-blue-700 mb-2">Add a Stock</label>
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  value={newStockName}
                  onChange={(e) => setNewStockName(e.target.value)}
                  className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
                  placeholder="Enter stock name"
                />
                <button
                  onClick={handleAddStock}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Add
                </button>
              </div>
              {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
            </div>
          </div>
        </div>
        {/* Recommendations Panel */}
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-300 w-full md:w-1/3">
          <h3 className="text-xl font-bold mb-2">Recommendations:</h3>
          {recommendations.length > 0 ? (
            <ul className="list-disc pl-4">
              {recommendations.slice(0, 5).map((rec, index) => (
                <li key={index} className="mb-1">{rec}</li>
              ))}
            </ul>
          ) : (
            <p>No recommendations available.</p>
          )}
          <button
            onClick={fetchStockRecommendations}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 mt-4"
          >
            Refresh Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stocks;

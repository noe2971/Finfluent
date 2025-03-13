import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ETF = () => {
  const gptKey = import.meta.env.VITE_GPT_KEY;
  const alphaVantageKey = import.meta.env.VITE_ALPHAVANTAGE_KEY; // Replace with your actual key
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  // Default list of ETFs (full names) and mapping to ticker symbols.
  const defaultETFs = [
    'SPDR S&P 500 ETF Trust',
    'Vanguard S&P 500 ETF',
    'iShares Core S&P 500 ETF',
    'Vanguard Total Stock Market ETF',
    'Invesco QQQ Trust Series I',
    'Vanguard Growth ETF',
    'Vanguard FTSE Developed Markets ETF',
    'Vanguard Value ETF',
    'iShares Core MSCI EAFE ETF',
    'Vanguard Total Bond Market ETF',
    'iShares Core U.S. Aggregate Bond ETF',
    'iShares Russell 1000 Growth ETF',
    'iShares Core S&P Mid-Cap ETF',
    'Vanguard Dividend Appreciation ETF',
    'iShares Core MSCI Emerging Markets ETF',
    'SPDR Gold Shares',
    'Vanguard Total International Stock ETF',
    'Vanguard FTSE Emerging Markets ETF',
    'iShares Core S&P Small Cap ETF',
    'Vanguard Information Technology ETF',
    'Invesco S&P 500 Equal Weight ETF',
    'Vanguard Mid-Cap ETF'
  ];

  const etfMapping = {
    'SPDR S&P 500 ETF Trust': 'SPY',
    'Vanguard S&P 500 ETF': 'VOO',
    'iShares Core S&P 500 ETF': 'IVV',
    'Vanguard Total Stock Market ETF': 'VTI',
    'Invesco QQQ Trust Series I': 'QQQ',
    'Vanguard Growth ETF': 'VUG',
    'Vanguard FTSE Developed Markets ETF': 'VEA',
    'Vanguard Value ETF': 'VTV',
    'iShares Core MSCI EAFE ETF': 'IEFA',
    'Vanguard Total Bond Market ETF': 'BND',
    'iShares Core U.S. Aggregate Bond ETF': 'AGG',
    'iShares Russell 1000 Growth ETF': 'IWF',
    'iShares Core S&P Mid-Cap ETF': 'IJH',
    'Vanguard Dividend Appreciation ETF': 'VIG',
    'iShares Core MSCI Emerging Markets ETF': 'IEMG',
    'SPDR Gold Shares': 'GLD',
    'Vanguard Total International Stock ETF': 'VXUS',
    'Vanguard FTSE Emerging Markets ETF': 'VWO',
    'iShares Core S&P Small Cap ETF': 'IJR',
    'Vanguard Information Technology ETF': 'VGT',
    'Invesco S&P 500 Equal Weight ETF': 'RSP',
    'Vanguard Mid-Cap ETF': 'VO'
  };

  const defaultETFOptions = defaultETFs.map(name => ({
    name,
    symbol: etfMapping[name] || name
  }));

  // Component state variables.
  const [selectedETF, setSelectedETF] = useState(defaultETFOptions[0].symbol);
  const [etfs, setEtfs] = useState(defaultETFOptions);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [newEtfName, setNewEtfName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [analysisLoaded, setAnalysisLoaded] = useState(false);

  const navigate = useNavigate();

  // Compute the "Learn More" URL based on the selected ETF ticker.
  const moreInfoUrl = `https://stockanalysis.com/etf/${selectedETF}/`;

  // Listen for authentication changes and load the user profile.
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
      console.error("Error fetching user profile:", error);
    }
  };

  // Combine default ETFs with the saved ETFs from the user profile.
  useEffect(() => {
    const savedETFs = profileData?.savedETFs || [];
    const savedETFOptions = savedETFs.map(symbol => {
      const fullName = Object.keys(etfMapping).find(key => etfMapping[key] === symbol) || symbol;
      return { name: fullName, symbol };
    });
    const combined = [...defaultETFOptions, ...savedETFOptions];
    // Remove duplicates by ticker symbol.
    const unique = combined.filter((option, index, self) =>
      index === self.findIndex(o => o.symbol === option.symbol)
    );
    setEtfs(unique);
  }, [profileData]);

  // Load saved ETF recommendations from the user profile.
  useEffect(() => {
    if (profileData && profileData.etfRecommendations) {
      setRecommendations(profileData.etfRecommendations);
    }
  }, [profileData]);

  // Refresh ETF recommendations.
  const handleRefreshRecommendations = async () => {
    if (!profileData) {
      setErrorMessage("User profile not loaded yet.");
      return;
    }
    const profileString = profileData 
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Expenses: ${profileData.expenses}.`
      : "No user profile available.";
    const combinedETFs = etfs.map(e => e.symbol).join(", ");
    const extraInstruction = etfs.length < 10 
      ? ` Note: There are only ${etfs.length} ETFs provided; please include additional ETF suggestions to reach a total of 10 recommendations.` 
      : "";
    const prompt = `${profileString} Given the above user profile, recommend the top five ETFs based on this list: ${combinedETFs}.${extraInstruction} Ensure that there are no repeated ETFs in your recommendations. For each recommended ETF, provide one concise sentence of reasoning for its selection, max 10 words. Label them from 'Must Buy' to 'Strong Buy' to 'Buy' in that order, and provide no additional information.`;
    
    try {
      const response = await axios.post(apiUrl, {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gptKey}`,
        },
      });
      if (response.data?.choices?.[0]?.message?.content) {
        const fetchedRecs = response.data.choices[0].message.content
          .trim()
          .split("\n")
          .filter(line => line.trim() !== "");
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, { etfRecommendations: fetchedRecs }, { merge: true });
        setRecommendations(fetchedRecs);
        setProfileData(prev => ({ ...prev, etfRecommendations: fetchedRecs }));
      } else {
        console.error("Unexpected response format:", response.data);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching ETF recommendations:", error);
      setRecommendations([]);
    }
  };

  // GPT call to fetch a ticker symbol for an ETF (used when adding a new ETF).
  const fetchTickerSymbol = async (etfInput) => {
    const prompt = `Given the user input "${etfInput}", if it is a partial or full name of an ETF, return the ticker symbol of the most representative ETF from stockanalysis.com. If the input already appears to be a ticker symbol, verify its existence on the site and return the ticker symbol. Return only the ticker symbol with no additional text. Never return anything else. If no matching ETF is found or it cannot be found on stockanalysis.com, respond with "INVALID".`;
    try {
      const response = await axios.post(apiUrl, {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gptKey}`,
        },
      });
      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      } else {
        console.error("Unexpected response format:", response.data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching ticker symbol:", error.message);
      return null;
    }
  };

  const handleAddEtf = async () => {
    if (!newEtfName.trim()) {
      setErrorMessage('Please enter an ETF name or ticker symbol.');
      return;
    }
    setErrorMessage('');
    const tickerSymbol = await fetchTickerSymbol(newEtfName);
    if (tickerSymbol && tickerSymbol !== 'INVALID') {
      if (etfs.some(e => e.symbol === tickerSymbol)) {
        setErrorMessage('ETF is already in the list.');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', userId);
        const currentETFs = profileData?.savedETFs || [];
        const updatedETFs = [...currentETFs, tickerSymbol];
        await setDoc(userDocRef, { savedETFs: updatedETFs }, { merge: true });
        setProfileData(prev => ({ ...prev, savedETFs: updatedETFs }));
        const newEntry = { name: newEtfName, symbol: tickerSymbol };
        setEtfs(prev => [...prev, newEntry]);
        setNewEtfName('');
      } catch (error) {
        console.error("Error adding ETF:", error);
      }
    } else {
      setErrorMessage('The ETF is either invalid or not listed on stockanalysis.com.');
    }
  };

  // Functions for fetching investment analysis (this replaces the chart).
  const fetchCachedAnalysis = async () => {
    if (!userId || !selectedETF) return false;
    try {
      const analysisDocRef = doc(db, "investmentAnalysis", `${userId}_${selectedETF}`);
      const docSnap = await getDoc(analysisDocRef);
      if (docSnap.exists()) {
        setAnalysis(docSnap.data().analysis);
        setAnalysisLoaded(true);
        return true;
      }
    } catch (error) {
      console.error("Error fetching cached analysis:", error);
    }
    return false;
  };

  const fetchAlphaData = async () => {
    if (!selectedETF) return null;
    const overviewUrl = `https://www.alphavantage.co/query?function=ETF_PROFILE&symbol=${selectedETF}&apikey=${alphaVantageKey}`;
    const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${selectedETF}&apikey=${alphaVantageKey}`;
    const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${selectedETF}&apikey=${alphaVantageKey}`;
    try {
      const [overviewRes, dailyRes, monthlyRes] = await Promise.all([
        axios.get(overviewUrl),
        axios.get(dailyUrl),
        axios.get(monthlyUrl)
      ]);
      return {
        overview: overviewRes.data,
        daily: dailyRes.data,
        monthly: monthlyRes.data
      };
    } catch (error) {
      console.error("Error fetching Alpha Vantage data:", error);
      return null;
    }
  };

  const fetchInvestmentAnalysis = async (forceRefresh = false) => {
    if (!selectedETF) return;
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
    
    const prompt = `${userProfile} Alpha Vantage Data: ${alphaInfo} Provide a concise investment analysis for the asset corresponding to "${selectedETF}" using its full name (not the ticker). Begin your response with: "Disclaimer: This is AI generated advice and should not be solely relied upon. Please review the details yourself before making any decisions." Then, using the most recent financial data available, present key financial ratios (with explanations), recent trends, market performance, and potential risks. Include both positive and negative factors, and conclude with a definite yes or no as to whether it is a good investment. Keep your response under 200 words. Do not mention that you are getting data from OpenAI or Alpha Vantage.`;

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
      setAnalysis(botResponse);
      setAnalysisLoaded(true);
      if (userId) {
        const analysisDocRef = doc(db, "investmentAnalysis", `${userId}_${selectedETF}`);
        await setDoc(analysisDocRef, { analysis: botResponse, timestamp: new Date() });
      }
    } catch (error) {
      console.error('Error fetching investment analysis:', error);
      setAnalysis("Sorry, we were unable to fetch the investment analysis. Please try again later or choose another investment.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch investment analysis when the selected ETF changes and the user/profile is loaded.
  useEffect(() => {
    if (selectedETF && userId && profileData && !analysisLoaded) {
      fetchInvestmentAnalysis();
    }
  }, [selectedETF, userId, profileData, analysisLoaded]);

  const handleRefreshAnalysis = () => {
    setAnalysisLoaded(false);
    fetchInvestmentAnalysis(true);
  };

  // Navigation stubs (modify if you wish to add navigation functionality).
  const handleNavigateToEtfs = () => navigate('/etfs');
  const handleNavigateToStocks = () => navigate('/livestocks');

  return (
    <div className="flex h-screen w-[82%] bg-gradient-to-b from-[#172554] to-[#bae6fd] text-white mx-auto p-4">
      <div className="flex flex-col md:flex-row w-full gap-4 overflow-y-auto">
        {/* Main container */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl overflow-y-auto">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Top ETFs</h2>
          <div className="flex justify-center items-center gap-6 mb-6">
            <button
              onClick={handleNavigateToEtfs}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transition duration-300"
            >
              ETFs
            </button>
            <button
              onClick={handleNavigateToStocks}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transition duration-300"
            >
              Stocks
            </button>
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium text-blue-700 mb-2">Select an ETF</label>
            <select
              value={selectedETF}
              onChange={(e) => { setSelectedETF(e.target.value); setAnalysisLoaded(false); }}
              className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
            >
              {etfs.map((etf, index) => (
                <option key={index} value={etf.symbol}>
                  {etf.name}
                </option>
              ))}
            </select>
          </div>
          {/* Display the investment analysis (replacing the chart) */}
          <div className="mt-8">
            {loading ? (
              <p className="text-center text-blue-900">Loading investment analysis...</p>
            ) : (
              <div className="text-lg text-gray-800">{analysis}</div>
            )}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handleRefreshAnalysis}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Refresh Analysis
              </button>
              <a target="_blank" rel="noopener noreferrer" href={moreInfoUrl}>
                <div className="text-blue-500 font-bold text-[3vh] flex items-center justify-center">
                  Learn More
                </div>
              </a>
            </div>
            {/* Add ETF Section */}
            <div className="mt-6">
              <label className="block text-lg font-medium text-blue-700 mb-2">Add an ETF</label>
              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  value={newEtfName}
                  onChange={(e) => setNewEtfName(e.target.value)}
                  className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
                  placeholder="Enter ETF name or ticker symbol"
                />
                <button
                  onClick={handleAddEtf}
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
        <div className="bg-blue-50 text-blue-900 p-4 rounded-lg border border-blue-300 w-full md:w-1/3">
          <h3 className="text-xl font-bold mb-2">ETF Recommendations</h3>
          {recommendations.length > 0 ? (
            <ul className="list-disc pl-4">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <li key={idx} className="mb-1">{rec}</li>
              ))}
            </ul>
          ) : (
            <p>No recommendations available.</p>
          )}
          <button
            onClick={handleRefreshRecommendations}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 mt-4"
          >
            Refresh Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETF;

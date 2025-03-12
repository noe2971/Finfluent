import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ETF = () => {
  const gptKey = import.meta.env.VITE_GPT_KEY;
  const alphaVantageKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual key
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  // Default list of ETFs (full names)
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

  // Mapping from full ETF name to ticker symbol.
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

  // Convert the defaultETF list into an array of objects { name, symbol }
  const defaultETFOptions = defaultETFs.map(name => ({
    name,
    symbol: etfMapping[name] || name
  }));

  // State: selectedETF holds the ticker symbol.
  const [selectedETF, setSelectedETF] = useState(defaultETFOptions[0].symbol);
  // etfs is an array of { name, symbol } objects.
  const [etfs, setEtfs] = useState(defaultETFOptions);
  const [etfData, setEtfData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEtfName, setNewEtfName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);

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
      console.error("Error fetching user profile:", error);
    }
  };

  // When profile data changes, combine default ETFs with the saved ETFs from profile.
  useEffect(() => {
    const savedETFs = profileData?.savedETFs || [];
    // Convert saved ticker symbols into objects using the mapping (if available).
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

  // Load saved ETF recommendations from profile.
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
    // Use ticker symbols for recommendations.
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
        // Save recommendations to the user's profile.
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

  // Fetch daily ETF data from Alpha Vantage.
  const fetchEtfData = async (etfSymbol) => {
    setLoading(true);
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: etfSymbol,
          apikey: alphaVantageKey,
        },
      });
      const data = response.data['Time Series (Daily)'];
      if (!data) {
        console.warn('No data returned for:', etfSymbol);
        setEtfData([]);
        setLoading(false);
        return;
      }
      const formattedData = Object.keys(data).map(date => ({
        date,
        close: parseFloat(data[date]['4. close']),
      }));
      setEtfData(formattedData.reverse());
    } catch (error) {
      console.error("Error fetching ETF data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedETF) {
      fetchEtfData(selectedETF);
    }
  }, [selectedETF]);

  // GPT call to get the ticker symbol for an ETF.
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

  // Add a new ETF (this part is exactly as in your original working code).
  const handleAddEtf = async () => {
    if (!newEtfName.trim()) {
      setErrorMessage('Please enter an ETF name or ticker symbol.');
      return;
    }
    setErrorMessage('');
    const tickerSymbol = await fetchTickerSymbol(newEtfName);
    if (tickerSymbol && tickerSymbol !== 'INVALID') {
      // Prevent duplicate entries.
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
        // Update etfs list by adding a new entry.
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

  const handleNavigate = () => {
    navigate(`/info(etf)?stock=${selectedETF}`);
  };
  const handleNavigateToEtfs = () => { navigate(`/etfs`); };
  const handleNavigateToStocks = () => { navigate(`/livestocks`); };

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
              onChange={(e) => setSelectedETF(e.target.value)}
              className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
            >
              {etfs.map((etf, index) => (
                <option key={index} value={etf.symbol}>
                  {etf.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNavigate}
            className="text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-4 hover:underline"
          >
            Learn more about {selectedETF}
          </button>
          <div className="mt-8">
            {loading ? (
              <p className="text-center text-blue-900">Loading ETF data...</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={etfData}>
                  <XAxis dataKey="date" tick={{ fill: '#1f2937' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#1f2937' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 51, 102, 0.8)', color: 'white' }} />
                  <CartesianGrid stroke="#111827" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="close" stroke="#111827" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
            {/* Add ETF Section (preserved from your original code) */}
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

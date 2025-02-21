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

  const defaultETFs = [
    'SPY', 'VOO', 'QQQ', 'IVV', 'DIA', 'EFA', 'IEMG', 'VTI', 'SCHB', 'XLF',
    'NIFTYBEES', 'BANKBEES', 'ICICINIFTY', 'SBINIFTY', 'UTINIFTY'
  ];

  const [selectedETF, setSelectedETF] = useState('SPY');
  const [etfData, setEtfData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [etfs, setEtfs] = useState(defaultETFs);
  const [newEtfName, setNewEtfName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  // Listen for auth changes and load user profile
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
        const data = docSnap.data();
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // When profile data changes, combine default ETFs with the saved ETFs from profile
  useEffect(() => {
    const savedETFs = profileData?.savedETFs || [];
    const combined = [...defaultETFs, ...savedETFs];
    const unique = [...new Set(combined)];
    setEtfs(unique);
  }, [profileData]);

  // Load saved ETF recommendations (if any) from profile
  useEffect(() => {
    if (profileData && profileData.etfRecommendations) {
      setRecommendations(profileData.etfRecommendations);
    }
  }, [profileData]);

  // Refresh ETF recommendations based on default ETFs and saved ETFs
  const handleRefreshRecommendations = async () => {
    if (!profileData) {
      setErrorMessage("User profile not loaded yet.");
      return;
    }
    const profileString = profileData 
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Expenses: ${profileData.expenses}.`
      : "No user profile available.";
    const combinedETFs = etfs.join(", ");
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
        // Save recommendations to the user's profile
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

  // Fetch daily ETF data from Alpha Vantage
  const fetchEtfData = async (etfSymbol) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
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
  // The prompt instructs ChatGPT to use the user input (even if partial)
  // to return the ticker symbol of the ETF that best represents that input as listed on stockanalysis.com.
  // If the input appears to be a ticker symbol, validate its existence.
  // If no close match is found, return "INVALID".
  const fetchTickerSymbol = async (etfInput) => {
    const prompt = `Given the user input "${etfInput}", if it is a partial or full name of an ETF, return the ticker symbol of the most representative ETF from stockanalysis.com. If the input already appears to be a ticker symbol, verify its existence on the site and return the ticker symbol. Return only the ticker symbol with no additional text. Never return anything else,If no matching ETF is found or it can not be found on stockanalysis.com, respond with "INVALID".`;
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

  // Add a new ETF only if the validated ticker symbol is not "INVALID" and is not already in the list.
  const handleAddEtf = async () => {
    if (!newEtfName.trim()) {
      setErrorMessage('Please enter an ETF name or ticker symbol.');
      return;
    }
    setErrorMessage('');
    const tickerSymbol = await fetchTickerSymbol(newEtfName);
    if (tickerSymbol && tickerSymbol !== 'INVALID') {
      // Prevent duplicate entries.
      if (etfs.includes(tickerSymbol)) {
        setErrorMessage('ETF is already in the list.');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', userId);
        const currentETFs = profileData?.savedETFs || [];
        const updatedETFs = [...currentETFs, tickerSymbol];
        await setDoc(userDocRef, { savedETFs: updatedETFs }, { merge: true });
        setProfileData(prev => ({ ...prev, savedETFs: updatedETFs }));
        setEtfs([...new Set([...defaultETFs, ...updatedETFs])]);
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
        {/* Main white container with scrolling enabled if needed */}
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
                <option key={index} value={etf}>
                  {etf}
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
        {/* Right Recommendations Container */}
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

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

const Stocks = () => {
  const gptKey = import.meta.env.VITE_GPT_KEY;
  const alphaVantageKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual key
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  // Default list of stocks
  const defaultStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'UNH', 'V',
    'RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICIBANK'
  ];

  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState(defaultStocks);
  const [newStockName, setNewStockName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();

  // Listen for auth changes and load the user’s profile
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

  // When profile data changes, combine default stocks with the user's saved stocks
  useEffect(() => {
    const savedStocks = profileData?.savedStocks || [];
    const combined = [...defaultStocks, ...savedStocks];
    const unique = [...new Set(combined)];
    setStocks(unique);
  }, [profileData]);

  // Load saved stock recommendations from the user's profile
  useEffect(() => {
    if (profileData && profileData.stockRecommendations) {
      setRecommendations(profileData.stockRecommendations);
    }
  }, [profileData]);

  // Removed automatic fetching of recommendations on profileData change.
  // Recommendations now update only when the refresh button is pressed.

  // Generate exactly 5 recommendations and save them in the user's document
  const fetchStockRecommendations = async () => {
    if (!profileData) {
      setErrorMessage('User profile not loaded yet.');
      return;
    }
    const profileString = `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Expenses: ${profileData.expenses}.`;
    const combinedStocks = stocks.join(', ');
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
        .filter((line) => line.trim() !== '');
      const finalRecs = recs.slice(0, 5);
      // Save recommendations to the user's profile under "stockRecommendations"
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { stockRecommendations: finalRecs }, { merge: true });
      setRecommendations(finalRecs);
      setProfileData(prev => ({ ...prev, stockRecommendations: finalRecs }));
    } catch (error) {
      console.error('Error fetching stock recommendations:', error);
      setRecommendations([]);
    }
  };

  // Fetch daily stock data from Alpha Vantage
  const fetchStockData = async (stockSymbol) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: stockSymbol,
          apikey: alphaVantageKey,
        },
      });
      const data = response.data['Time Series (Daily)'];
      if (!data) {
        setStockData([]);
        setLoading(false);
        return;
      }
      const formattedData = Object.keys(data)
        .map((date) => ({
          date,
          close: parseFloat(data[date]['4. close']),
        }))
        .reverse();
      setStockData(formattedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock);
    }
  }, [selectedStock]);

  // GPT call to get the ticker symbol for a stock
  const fetchTickerSymbol = async (stockName) => {
    const prompt = `Find the ticker symbol for the stock "${stockName}". Only respond with the ticker symbol if it is listed on https://stockanalysis.com. If not, respond with "INVALID".`;
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

  // Add a new stock by updating the user's profile ("savedStocks" field)
  const handleAddStock = async () => {
    if (!newStockName.trim()) {
      setErrorMessage('Please enter a stock name.');
      return;
    }
    setErrorMessage('');
    const tickerSymbol = await fetchTickerSymbol(newStockName);
    if (tickerSymbol && tickerSymbol !== 'INVALID') {
      if (stocks.includes(tickerSymbol)) {
        setErrorMessage('Stock is already in the list.');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', userId);
        const currentStocks = profileData?.savedStocks || [];
        const updatedStocks = [...currentStocks, tickerSymbol];
        await setDoc(userDocRef, { savedStocks: updatedStocks }, { merge: true });
        setProfileData(prev => ({ ...prev, savedStocks: updatedStocks }));
        setStocks([...new Set([...defaultStocks, ...updatedStocks])]);
        setNewStockName('');
      } catch (error) {
        console.error('Error adding stock:', error);
      }
    } else {
      setErrorMessage('The stock is either invalid or not listed on stockanalysis.com.');
    }
  };

  const handleNavigate = () => {
    navigate(`/information?stock=${selectedStock}`);
  };
  const handleNavigateToEtfs = () => { navigate(`/etfs`); };
  const handleNavigateToStocks = () => { navigate(`/livestocks`); };

  return (
    <div className="flex h-screen w-[82%] bg-gradient-to-b from-[#172554] to-[#bae6fd] text-white mx-auto p-4">
      <div className="flex flex-col md:flex-row w-full gap-4">
        {/* Main white container with scrolling enabled */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl overflow-y-auto">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Top Stocks</h2>
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
            <label className="block text-lg font-medium text-blue-700 mb-2">Select a Stock</label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
            >
              {stocks.map((stock, index) => (
                <option key={index} value={stock}>
                  {stock}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNavigate}
            className="text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-4 hover:underline"
          >
            Learn more about {selectedStock}
          </button>
          <div className="mt-8">
            {loading ? (
              <p className="text-center text-blue-900">Loading stock data...</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stockData}>
                  <XAxis dataKey="date" tick={{ fill: '#1f2937' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#1f2937' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,51,102,0.8)', color: 'white' }} />
                  <CartesianGrid stroke="#111827" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="close" stroke="#111827" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
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

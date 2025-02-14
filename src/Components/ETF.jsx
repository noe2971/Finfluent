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
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ETF = () => {
  const gptKey = import.meta.env.VITE_GPT_KEY;
  const alphaVantageKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual Alpha Vantage API key
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const [selectedStock, setSelectedStock] = useState('SPY');
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [newStockName, setNewStockName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // Profile data from Firestore
  const [profileData, setProfileData] = useState(null);

  // AI Recommendations
  const [recommendations, setRecommendations] = useState([]);

  const navigate = useNavigate();

  // Default ETFs
  const defaultETFS = [
    'SPY', 'VOO', 'QQQ', 'IVV', 'DIA', 'EFA', 'IEMG', 'VTI', 'SCHB', 'XLF',
    'NIFTYBEES', 'BANKBEES', 'ICICINIFTY', 'SBINIFTY', 'UTINIFTY'
  ];

  // Fetch user data & stocks when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // 1) Fetch user’s profile from Firestore (e.g. from "users" collection)
        await fetchUserProfile(user.uid);
        // 2) Fetch user’s custom ETFs from "stocks" collection
        await fetchStocks(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      } else {
        console.warn('No user profile found in Firestore for this user.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchStocks = async (uid) => {
    try {
      const stocksQuery = query(collection(db, 'stocks'), where('userId', '==', uid));
      const querySnapshot = await getDocs(stocksQuery);
      const fetchedStocks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Combine default ETFs with user-specific ones
      const allStocks = [
        ...defaultETFS,
        ...fetchedStocks.map((stock) => stock.name),
      ];
      // Remove duplicates
      const uniqueStocks = [...new Set(allStocks)];
      setStocks(uniqueStocks);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  // Once we have both profileData and the stocks list, generate AI recommendations
  useEffect(() => {
    if (profileData && stocks.length > 0) {
      fetchStockRecommendations(profileData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData, stocks]);

  // Get daily stock data from Alpha Vantage
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
        console.warn('No data returned from Alpha Vantage for:', stockSymbol);
        setStockData([]);
        setLoading(false);
        return;
      }

      const formattedData = Object.keys(data).map((date) => ({
        date,
        close: parseFloat(data[date]['4. close']),
      }));
      const reversedData = formattedData.reverse();
      setStockData(reversedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use GPT to recommend top 10 ETFs from the user’s list
  const fetchStockRecommendations = async (userProfile) => {
    if (!gptKey) {
      console.error("OpenAI API key (VITE_GPT_KEY) is missing.");
      return;
    }
    // You can add or remove fields from userProfile as needed
    const prompt = `
We have a user with the following profile data:
${JSON.stringify(userProfile)}

They have access to the following ETFs:
${stocks.join(', ')}

Please recommend the top ten ETFs from this list, labeling them from 'Must Buy' to 'Strong Buy' to 'Buy' in that order. Provide no other information or explanation.
    `;

    try {
      const response = await axios.post(
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

      // Process the response
      if (response.data?.choices?.[0]?.message?.content) {
        const lines = response.data.choices[0].message.content.trim().split("\n");
        setRecommendations(lines);
      } else {
        console.error("Unexpected response format:", response.data);
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching stock recommendations:", error);
      setRecommendations([]);
    }
  };

  // GPT call to find ticker symbol
  const fetchTickerSymbol = async (stockName) => {
    const prompt = `Find the ticker symbol of the stock "${stockName}". Only respond with the ticker symbol and nothing else.`;
    try {
      const response = await axios.post(
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

  // Re-fetch data if the selected stock changes
  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStock]);

  // Add new ETF to Firestore
  const handleAddStock = async () => {
    if (!newStockName) {
      setErrorMessage('Please enter a stock name.');
      return;
    }
    setErrorMessage('');

    const tickerSymbol = await fetchTickerSymbol(newStockName);
    if (tickerSymbol) {
      // Avoid duplicates
      if (!stocks.includes(tickerSymbol)) {
        try {
          const stockData = { name: tickerSymbol, userId };
          await addDoc(collection(db, 'stocks'), stockData);
          setStocks((prevStocks) => [...prevStocks, tickerSymbol]);
          setNewStockName('');
        } catch (error) {
          console.error('Error adding stock to Firestore:', error);
        }
      } else {
        setErrorMessage('Stock is already in the list.');
      }
    } else {
      setErrorMessage('Failed to fetch the ticker symbol. Please try again.');
    }
  };

  // Navigation
  const handleNavigate = () => {
    navigate(`/information?stock=${selectedStock}`);
  };
  const handleNavigate2 = () => {
    navigate(`/etfs`);
  };
  const handleNavigate3 = () => {
    navigate(`/livestocks`);
  };

  return (
    <div className="flex flex-col w-[82%] ml-[18%] bg-gradient-to-b from-[#172554] to-[#bae6fd] text-white min-h-screen p-4">
      {/* Heading & Explanation at the Top */}

      <div className="flex flex-col items-center w-full">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Top ETFs</h2>
          <div className="mb-8 bg-white text-blue-900 p-6 rounded shadow-md">
        <h1 className="text-l font-bold mb-4 text-center">We highly recommend ETFs for beginners to investing</h1>
        <p className="text-medium">
          Exchange-Traded Funds (ETFs) are investment funds traded on stock exchanges, much like individual stocks.
          They typically hold a diverse basket of underlying assets, providing you with instant diversification and
          often lower fees compared to actively managed funds. This makes them a great choice for new investors who
          want to build a balanced portfolio without having to pick individual stocks.
        </p>
      </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center gap-6 mb-6">
            <button
              onClick={handleNavigate2}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
            >
              ETFs
            </button>
            <button
              onClick={handleNavigate3}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
            >
              Stocks
            </button>
          </div>

          {/* ETF Selector */}
          <div>
            <label className="block text-lg font-medium text-blue-700 mb-2">Select an ETF</label>
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

          {/* Learn More */}
          <button
            onClick={handleNavigate}
            className="text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-4 hover:underline"
          >
            Learn more about {selectedStock}
          </button>

          {/* Chart + Recommendations side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Left: Chart */}
            <div>
              {loading ? (
                <p className="text-center text-blue-900">Loading ETF data...</p>
              ) : (
                <ResponsiveContainer width={500} height={500}>
                  <LineChart data={stockData}>
                    <XAxis dataKey="date" tick={{ fill: '#1f2937' }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#1f2937' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0, 51, 102, 0.8)', color: 'white' }}
                    />
                    <CartesianGrid stroke="#111827" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#111827"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Add Stock Field */}
              <div className="mt-6">
                <label className="block text-lg font-medium text-blue-700 mb-2">Add an ETF</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStockName}
                    onChange={(e) => setNewStockName(e.target.value)}
                    className="flex-grow p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
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

            {/* Right: Recommendations for You */}
            <div className="bg-blue-50 p-4 rounded-lg text-blue-900 ml-40">
              <h3 className="text-xl font-bold mb-4">Recommendations for You</h3>
              {recommendations.length > 0 ? (
                <ul className="list-disc list-inside space-y-2">
                  {recommendations.slice(0, 10).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-700">No recommendations yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETF;

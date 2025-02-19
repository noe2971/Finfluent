import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Stocks = () => {
    const gptKey = import.meta.env.VITE_GPT_KEY;
    const alphaVantageKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with your actual Alpha Vantage API key
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    const [selectedStock, setSelectedStock] = useState('AAPL');
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [newStockName, setNewStockName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    const defaultStocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'UNH', 'V',
        'RELIANCE', 'TCS', 'HDFC', 'INFY', 'ICICIBANK'
      ];

    // Fetch stocks from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchStocks(user.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchStocks = async (uid) => {
        try {
            const stocksQuery = query(collection(db, 'stocks'), where('userId', '==', uid));
            const querySnapshot = await getDocs(stocksQuery);
            const fetchedStocks = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            // Combine default stocks with fetched ones to ensure they are all present
            const allStocks = [
                ...defaultStocks, // Add default stocks
                ...fetchedStocks.map((stock) => stock.name), // Add user-specific stocks
            ];

            // Remove duplicates
            const uniqueStocks = [...new Set(allStocks)];
            setStocks(uniqueStocks);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };

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

    const fetchStockRecommendations = async (userProfile) => {
        const prompt = `Given the user's profile data: ${JSON.stringify(userProfile)}, recommend the top ten stocks from this list: ${stocks.join(", ")}. Label them from 'Must Buy' to 'Strong Buy' to 'Buy' in that order. Provide no other information.`;
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
    
            // Process the response to display the recommendations
            if (response.data?.choices?.[0]?.message?.content) {
                return response.data.choices[0].message.content.trim().split("\n");
            } else {
                console.error("Unexpected response format:", response.data);
                return [];
            }
        } catch (error) {
            console.error("Error fetching stock recommendations:", error);
            return [];
        }
    };
    
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
                        Authorization: `Bearer ${gptKey}`, // Fixed incorrect string interpolation
                    },
                }
            );
    
            // Validate the response structure and extract the ticker symbol
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
    
    useEffect(() => {
        if (selectedStock) {
            fetchStockData(selectedStock);
        }
    }, [selectedStock]);

    const handleAddStock = async () => {
        if (!newStockName) {
            setErrorMessage('Please enter a stock name.');
            return;
        }

        setErrorMessage('');
        const tickerSymbol = await fetchTickerSymbol(newStockName);

        if (tickerSymbol) {
            if (!stocks.includes(tickerSymbol)) {
                try {
                    const stockData = { name: tickerSymbol, userId };
                    const docRef = await addDoc(collection(db, 'stocks'), stockData);
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
        <div className="flex h-screen w-[82%] bg-gradient-to-b from-[#172554] to-[#bae6fd] text-white max-w-4xl mx-auto space-y-4 p-4">
            <div className="flex flex-col items-center justify-center w-full">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                    <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Top Stocks</h2>

                    <div className="flex justify-center items-center gap-6 mb-6">
                     <button 
                        onClick={handleNavigate2} 
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out">
                     ETFs
                    </button>
                    <button 
                        onClick={handleNavigate3} 
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out">
                    Stocks
                    </button>
                    </div>
                    <div>

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

                    {/* Move the Learn More button above the graph */}
                    <button onClick={handleNavigate} className="text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-4 hover:underline">
                        Learn more about {selectedStock}
                    </button>

                    <div className="mt-8">
                        {loading ? (
                            <p className="text-center text-blue-900">Loading stock data...</p>
                        ) : (
                            <>
                                {/* Graph */}
                                <ResponsiveContainer width="95%" height={400}>
                                    <LineChart data={stockData}>
                                        <XAxis dataKey="date" tick={{ fill: 'gray-800' }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fill: 'gray-800' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 51, 102, 0.8)', color: 'white' }} />
                                        <CartesianGrid stroke="#111827" strokeDasharray="5 5" />
                                        <Line type="monotone" dataKey="close" stroke="#111827" strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>

                                {/* Add Stock Button and Input Field Below Graph */}
                                <div className="mt-6">
                                    <label className="block text-lg font-medium text-blue-700 mb-2">Add a Stock</label>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Stocks;




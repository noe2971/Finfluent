import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Stocks = () => {
    const [stocks] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN']);
    const [selectedStock, setSelectedStock] = useState('AAPL');
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [Recommendations, setRecommendations] = useState();

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
          const data = userDoc.data();
          setProfileData(data);
        }
      };

      const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;


  const handleGemini = async () => {
      const userProfile = profileData
        ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments.join(', ')}.`
        : "No user profile available.";

      console.log(profileData);

      const prompt = `${userProfile} Suggest me stock options based on my profile and the stock performance from the stocks list in the following format and arrange stocks in {stock_name}: {strong buy, buy, sell}, giving each stock one unique parameter and Don't give any extra text: ${stocks}`;

      try {
        const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleApiKey}`,
          {
            "contents": [
              {
                "parts": [
                  {
                    "text": prompt
                  }
                ]
              }
            ]
          }
        );

        const botResponse = response.data.candidates[0].content.parts[0].text;
        setRecommendations(botResponse);
      } catch (error) {
        console.error('Error sending message:', error);
        setRecommendations("Sorry, we were unable to fetch response from Gemini")
      }
    };





    const apiKey = 'SGYOVB61J5NBNEPO';  

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${selectedStock}&apikey=${apiKey}`
                );

                console.log("API Response:", response.data); 

                const timeSeriesData = response.data['Time Series (Daily)'];

                if (!timeSeriesData) {
                    console.error('Time Series Data is undefined. Check the API response structure.');
                    return; 
                }

                const formattedData = Object.keys(timeSeriesData).map(date => ({
                    date,
                    close: parseFloat(timeSeriesData[date]['4. close']),
                })).reverse(); 
                setStockData(formattedData);
            } catch (error) {
                console.error('Error fetching stock data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [selectedStock]);

    return (
      <div className="flex h-screen w-[82%] ml-[18%] bg-gradient-to-b from-[#172554] to-[#bae6fd] text-white">
          <div className="flex flex-col items-center justify-center w-full">
              <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
                  <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Stock Data Visualization</h2>
  
                  <div className="mb-6">
                      <label className="block text-lg font-medium text-blue-700 mb-2">Select a Stock</label>
                      <select
                          value={selectedStock}
                          onChange={(e) => setSelectedStock(e.target.value)}
                          className="w-full p-2 border border-blue-400 rounded-lg bg-blue-100 text-blue-700"
                      >
                          {stocks.map((stock) => (
                              <option key={stock} value={stock}>
                                  {stock}
                              </option>
                          ))}
                      </select>
                    

                  </div>
                  <div className="mt-8">
                      {loading ? (
                          <p className="text-center text-blue-900">Loading stock data...</p>
                      ) : (
                        <>
                          <ResponsiveContainer width="95%" height={400}>
                              <LineChart data={stockData}>
                                  <XAxis dataKey="date" tick={{ fill: 'gray-800' }} />
                                  <YAxis domain={['auto', 'auto']} tick={{ fill: 'gray-800' }} />
                                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 51, 102, 0.8)', color: 'white' }} />
                                  <CartesianGrid stroke="#111827" strokeDasharray="5 5" />
                                  <Line type="monotone" dataKey="close" stroke="#111827 " strokeWidth={3} dot={false} />
                              </LineChart>
                          </ResponsiveContainer>

                          <a target='blank' href={`https://stockanalysis.com/stocks/${selectedStock}/`} >
                         
                          <div className='text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-[5vh]'>{selectedStock}</div>

                          </a>

                          </>
                      )}
                  </div>
              </div>
          </div>
          <div className="w-1/3 p-4 overflow-y-auto sticky bg-gradient-to-b from-[#151E3D] to-[#123456]">
              <h3 className="text-xl font-bold" onClick={handleGemini}>Recent Stock Recommendations</h3>
              <button
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out cursor-pointer mb-6"
                  onClick={handleGemini}
              >
                  Get Them
              </button>
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  {Recommendations}
              </div>
          </div>
      </div>
  );
};

export default Stocks;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Stocks = () => {
    const [stocks] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN']);
    const [selectedStock, setSelectedStock] = useState('AAPL');
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);

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
        <div className="flex h-screen bg-gradient-to-b from-blue-900 to-black text-white ml-60">
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
                            <ResponsiveContainer width="95%" height={400}> 
                                <LineChart data={stockData}>
                                    <XAxis dataKey="date" tick={{ fill: 'gray-800' }} />
                                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'gray-800' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 51, 102, 0.8)', color: 'white' }} />
                                    <CartesianGrid stroke="#111827" strokeDasharray="5 5" />
                                    <Line type="monotone" dataKey="close" stroke="#111827 " strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
      <div className="w-1/3 bg-gray-900 p-4 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Recent Stock Recommendations</h3>
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="font-semibold">AAPL: <span className="text-green-500">Strong Buy</span></p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="font-semibold">MSFT: <span className="text-green-500">Buy</span></p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="font-semibold">GOOGL: <span className="text-yellow-400">Hold</span></p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <p className="font-semibold">AMZN: <span className="text-red-500">Sell</span></p>
        </div>
      </div>
    </div>
  );
};

export default Stocks;
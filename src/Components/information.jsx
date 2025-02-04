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
    const [stockRecommendations, setStockRecommendations] = useState([]);
    
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
        setBudget(data.budget || 0);
        setMoneySpent(data.moneySpent || 0);
        setExpenseList(data.expenses || []);
        setSalary(Number(data.salary) || 0);  // Convert salary to number
    }
};
    
    useEffect(() => {
        const fetchStockInfo = async () => {
            setLoading(true);
            const userProfile = profileData
            ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments.join(', ')}.`
            : "No user profile available.";
            const prompt = `${userProfile}Using data provided and additional research say whether ${stockSymbol} would be a good or a bad investment for them personally, provide reasoning for your decision. It is either a stock or an ETF so make reccomedations accordig to that. Present useful financial ratios that are as updated as possible, it doest have to be real time data, (explaining what they indicate), recent trends, market performance, and a short analysis to support your argument Use simple terms and explain every complex term you use. Link every piece of evidence and every ratio to why it is relevant to user and why due to it they should make a decision. Dont make your response too long, restrict yourself to 200 words. Dont use vague Words like could use is likely to be instead. Dont refer to the stock by its ticker name. Use the company name. Mske sure all the data you give is as up to data as possible, from 2025. Thie financial ratios annd dagta mmust be accurate , cross verify it with many sourcses and ensure also they are all updated to the current day and time of this prompt. Mention sources for this financial data. ever say the followig phrase: but as an artificial intelligence model developed by OpenAI, I do not have real-time access to financial data. If you can't get data for 2025 provide data for as latest as possible. If it is still ot possible for you just say there is a error fetching the investment analysis, pls try again after a while or try another investment analysis. Always at the beginning of your response say that as an AI my advise will not always be 100% accurate. Take the information I give you as a suggestion to help you make a decision. Always conduct your own research before investing in something.`;

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
                console.error('Error fetching stock information:', error);
                setStockInfo("Sorry, we were unable to fetch stock information.");
            } finally {
                setLoading(false);
            }
        };

        if (stockSymbol) fetchStockInfo();
    }, [stockSymbol]);

    return (
        <div className="flex flex-col justify-center h-screen bg-gradient-to-b from-[#123456] to-[#0e213a] text-white p-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-3xl ml-96">
                <h2 className="text-3xl font-bold text-center mb-6">{stockSymbol} Stock Information</h2>
                {loading ? (
                    <p className="text-center text-gray-400">Fetching stock details...</p>
                ) : (
                    <>
                        <p className="text-lg text-gray-200">{stockInfo}</p>
                        <a target="blank" href={`https://stockanalysis.com/stocks/${stockSymbol}/`}>
                            <div className="text-blue-500 font-bold text-[3vh] flex items-center justify-center pt-[5vh]">
                                More Information
                            </div>
                        </a>
                    </>
                )}
            </div>
        </div>
    );
};

export default Information;




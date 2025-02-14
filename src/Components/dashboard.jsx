import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [geminiTips, setGeminiTips] = useState("");
  const [RiskLevel, setRiskLevel] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [budget, setBudget] = useState(0);
  const [moneySpent, setMoneySpent] = useState(0);
  const [expenseList, setExpenseList] = useState([]);
  const [salary, setSalary] = useState(0);

  const apiKey = import.meta.env.VITE_GPT_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

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
      setExpenseList(Array.isArray(data.expenses) ? data.expenses : []);
      setSalary(Number(data.salary) || 0);
    }
  };

  const handleGemini = async () => {
    const userProfile = profileData
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments.join(', ')}.`
      : "No user profile available.";

    const prompt = `${userProfile} User Question: Give me 3 concise financial tips`;

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
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const botResponse = result.data.choices[0].message.content;
      setGeminiTips(botResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setGeminiTips("Sorry, we were unable to fetch response");
    }
  };

  const handleGemini2 = async () => {
    const userProfile = profileData
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments.join(', ')}.`
      : "No user profile available.";

    const prompt = `${userProfile} Can you give the user's risk level and describe it in just one liner`;

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
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const botResponse = result.data.choices[0].message.content;
      setRiskLevel(botResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setRiskLevel("Sorry, we were unable to fetch response");
    }
  };

  const getSavingsBadge = (budget, moneySpent) => {
    const savings = budget - moneySpent;
    const savingsPercentage = (savings / budget) * 100;

    if (savingsPercentage > 50) {
      return "Saver";
    } else if (savingsPercentage > 30) {
      return "Budget King";
    } else {
      return "Money Guru";
    }
  };

  // Default expenses if none are set
  const expenses = Array.isArray(expenseList) && expenseList.length > 0
    ? expenseList
    : [
        { name: 'Home Loan', amount: 5000, date: "19/10/2024" },
        { name: 'Dinner', amount: 100, date: "27/10/2024" },
        { name: 'Trip to Goa', amount: 1000, date: "27/10/2024" },
        { name: 'I bought PS5', amount: 500, date: "27/10/2024" },
        { name: 'Pencil', amount: 3.5, date: "27/10/2024" },
      ];

  const expenseData = {
    labels: expenses.map(exp => exp.name || 'Unnamed'),
    datasets: [{
      data: expenses.map(exp => typeof exp.amount === 'number' ? exp.amount : 0),
      backgroundColor: ["#4169E1", "#000080", "#0047AB", "#0F52BA", "#4682B4", "#6495ED"],
    }]
  };

  const incomeExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Income vs Expenses',
        data: [salary, moneySpent],
        backgroundColor: ['#4169E1', '#000080'],
      },
    ],
  };

  const savingsProgress = (budget, moneySpent) => {
    const savings = budget - moneySpent;
    return (savings / budget) * 100;
  };

  const progress = savingsProgress(budget, moneySpent);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#172554] to-[#bae6fd]">
      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto ml-64 p-6">
        <header className="h-16 bg-white flex items-center justify-between px-6 shadow-md border-b border-gray-200 ml-8">
          <h1 className="text-2xl font-semibold text-blue-900">Main Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="mt-6 space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 ml-8">
            <div className="bg-white p-4 shadow rounded-xl">
              <h2 className="text-sm text-blue-900">Earnings</h2>
              <p className="text-2xl font-bold text-black">${Number(budget).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 shadow rounded-xl">
              <h2 className="text-sm text-blue-900">Spent this month</h2>
              <p className="text-2xl font-bold text-black">${Number(moneySpent).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 shadow rounded-xl">
              <h2 className="text-sm text-blue-900">Salary</h2>
              <p className="text-2xl font-bold text-black">${Number(salary).toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 shadow rounded-xl">
              <h2 className="text-sm text-blue-900">Your Badge</h2>
              <p className="text-2xl font-bold text-black">{getSavingsBadge(budget, moneySpent)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <div className="bg-white p-6 shadow rounded-xl h-[400px] ml-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Expense Breakdown</h3>
              <div className="relative w-full h-[calc(100%-2rem)]">
                <Pie
                  data={expenseData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  className="absolute inset-0"
                />
              </div>
            </div>

            {/* Income vs Expenses */}
            <div className="bg-white p-6 shadow rounded-xl h-[400px]">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Income vs Expenses</h3>
              <div className="relative w-full h-[calc(100%-2rem)]">
                <Bar
                  data={incomeExpenseData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  className="absolute inset-0"
                />
              </div>
            </div>
          </div>

          {/* Bottom Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Level */}
            <div className="bg-white p-6 shadow rounded-xl flex flex-col ml-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-900">Risk Level</h3>
                <button
                  onClick={handleGemini2}
                  className="bg-blue-700 text-white px-4 py-1 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Calculate
                </button>
              </div>
              <div className="text-black mt-4">{RiskLevel}</div>
            </div>

            {/* Savings Progress */}
            <div className="bg-white p-6 shadow rounded-xl flex flex-col">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Savings Progress</h3>
              <progress value={progress} max="100" className="w-full h-4 rounded-lg bg-gray-300" />
              <p className="text-sm text-black mt-2">{Math.round(progress)}% of your budget saved!</p>
            </div>

            {/* GPT Tips */}
            <div className="bg-white p-6 shadow rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-blue-900">Tips for Today</h3>
                <button
                  onClick={handleGemini}
                  className="bg-blue-700 text-white px-4 py-1 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Get Tips
                </button>
              </div>
              {geminiTips && (
                <ul className="list-disc pl-6 mt-4 space-y-1 text-black">
                  {geminiTips.split('\n').filter(line => line.trim() !== "").map((tip, index) => (
                    <li key={index}>{tip.trim()}</li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

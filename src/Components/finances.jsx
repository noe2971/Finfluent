import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ArcElement);

function ExpenseTracker() {
  const [profileData, setProfileData] = useState(null);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [budget, setBudget] = useState(0);
  const [moneySpent, setMoneySpent] = useState(0);
  const [expenseList, setExpenseList] = useState([]);
  const [editBudget, setEditBudget] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Helper function to generate a distinct color for each expense
  const generateColor = (index) => {
    const hue = (index * 137.508) % 360; // golden angle approximation
    return `hsl(${hue}, 70%, 50%)`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      setProfileData(data);
      setBudget(data.budget || 0);
      setMoneySpent(data.moneySpent || 0);
      setExpenseList(Array.isArray(data.expenses) ? data.expenses : []);
    }
  };

  const handleAddExpense = async () => {
    if (newExpenseName.trim() && newExpenseAmount.trim() && !isNaN(newExpenseAmount)) {
      const expenseAmount = parseFloat(newExpenseAmount);
      const newExpense = {
        name: newExpenseName,
        amount: expenseAmount,
        date: new Date().toLocaleDateString(),
      };
      const newMoneySpent = moneySpent + expenseAmount;
      const newExpenses = [...expenseList, newExpense];
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        // Using setDoc with merge ensures data is saved permanently without overwriting the entire document.
        await setDoc(userDocRef, {
          moneySpent: newMoneySpent,
          expenses: newExpenses,
        }, { merge: true });

        setMoneySpent(newMoneySpent);
        setExpenseList(newExpenses);
        setNewExpenseName('');
        setNewExpenseAmount('');
      } catch (error) {
        console.error('Error adding expense:', error);
      }
    }
  };

  const handleRemoveExpense = async (index) => {
    const expenseToRemove = expenseList[index];
    const updatedExpenses = expenseList.filter((_, i) => i !== index);
    const newMoneySpent = moneySpent - expenseToRemove.amount;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        moneySpent: newMoneySpent,
        expenses: updatedExpenses,
      }, { merge: true });
      setExpenseList(updatedExpenses);
      setMoneySpent(newMoneySpent);
    } catch (error) {
      console.error('Error removing expense:', error);
    }
  };

  const handleUpdateBudget = async () => {
    if (editBudget.trim() && !isNaN(editBudget)) {
      const newBudget = parseFloat(editBudget);
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { budget: newBudget }, { merge: true });
        setBudget(newBudget);
        setEditBudget('');
        setIsEditingBudget(false);
      } catch (error) {
        console.error('Error updating budget:', error);
      }
    }
  };

  const chartData = {
    labels: expenseList.map((expense) => expense.name),
    datasets: [
      {
        label: 'Expense Amount ($)',
        data: expenseList.map((expense) => expense.amount),
        backgroundColor: expenseList.map((_, index) => generateColor(index)),
        borderColor: expenseList.map((_, index) => generateColor(index)),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-[82%] ml-[18%] bg-gradient-to-b from-[#172554] to-[#bae6fd] p-8">
      <h1 className="mb-14 text-6xl font-bold font-sans text-white text-center">
        Expense Tracker
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 w-full max-w-4xl">
        <div className="bg-white p-8 shadow-lg rounded-lg flex flex-col">
          <h2 className="font-semibold font-sans text-2xl text-gray-800 mb-6">
            Budget Overview
          </h2>
          <div className="mb-4 flex justify-between text-lg font-medium">
            <span>Monthly Budget:</span>
            <span>${budget}</span>
          </div>
          <div className="mt-4 mb-4 flex justify-between text-lg font-medium">
            <span>Money Spent:</span>
            <span>${moneySpent}</span>
          </div>
          {!isEditingBudget ? (
            <button
              className="bg-blue-600 text-white p-3 rounded-md mt-4 hover:bg-blue-700 transition"
              onClick={() => setIsEditingBudget(true)}
            >
              Edit Budget
            </button>
          ) : (
            <div className="mt-4">
              <input
                type="text"
                className="w-full p-3 border border-blue-300 rounded-md outline-none mb-2 focus:border-blue-500 transition"
                placeholder="Enter new budget"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
              />
              <button
                className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition"
                onClick={handleUpdateBudget}
              >
                Save Budget
              </button>
              <button
                className="w-full mt-2 bg-red-600 text-white p-3 rounded-md hover:bg-red-700 transition"
                onClick={() => setIsEditingBudget(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-8 shadow-lg rounded-lg">
          <h2 className="font-semibold font-sans text-2xl mb-6 text-gray-800">
            Add Expense
          </h2>
          <input
            type="text"
            className="w-full p-3 border border-blue-300 rounded-md outline-none mb-2 focus:border-blue-500 transition"
            placeholder="Expense name..."
            value={newExpenseName}
            onChange={(e) => setNewExpenseName(e.target.value)}
          />
          <input
            type="text"
            className="w-full p-3 border border-blue-300 rounded-md outline-none mb-4 focus:border-blue-500 transition"
            placeholder="Expense amount..."
            value={newExpenseAmount}
            onChange={(e) => setNewExpenseAmount(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
            onClick={handleAddExpense}
          >
            Add Expense
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-6 w-full max-w-4xl">
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <h2 className="font-semibold font-sans text-3xl mb-10 text-gray-800">
            Expense History
          </h2>
          <ul className="overflow-y-auto max-h-48 mb-6">
            {expenseList.map((expense, index) => (
              <li
                key={index}
                className="mb-2 flex justify-between items-center border-b border-gray-300 pb-2"
              >
                <div>
                  <span className="text-lg text-gray-700">{expense.name}</span> -{' '}
                  <span className="text-lg text-gray-700">${expense.amount}</span> -{' '}
                  <span className="text-sm text-gray-500">{expense.date}</span>
                </div>
                <button
                  onClick={() => handleRemoveExpense(index)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-8 shadow-lg rounded-lg">
          <h2 className="font-semibold font-sans text-3xl mb-10 text-gray-800">
            Expense Chart
          </h2>
          <Bar
            data={chartData}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;

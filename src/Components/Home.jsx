import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";  // Import Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Import auth state listener
import { ToastContainer, toast } from "react-toastify";  // Import Toastify
import "react-toastify/dist/ReactToastify.css";  // Toastify CSS


const Home = () => {
  const [goalData, setGoalData] = useState("Loading...");

const [userId, setUserId] = useState(null);  // Store the user ID
  useEffect(
    
    //function
    () => {
    // Listen to auth state changes to get the currently logged-in user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);  // Get the user's unique ID
        fetchGoalData(user.uid);  // Fetch profile data based on user ID
      }
    });

    return () => unsubscribe();  // Clean up the listener on component unmount

    //function is ending
  }, 
  []
);
  // Fetch user data from Firestore
  const fetchGoalData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        setGoalData(userDoc.data().goals);
        toast.success("Dashboard loaded successfully!");  // Success toast
      } else {
        toast.error("No data found.");  // Error toast
      }
    } catch (error) {
      toast.error("Error loading Dashboard.");
    }
  };
  return (
    <div>
      <ToastContainer />
      <h2>Dashboard</h2>
      <div>
        <p>Your Financial Goal:</p>
        <p>{goalData}</p>
      </div>
    </div>
  );
};
export default Home;
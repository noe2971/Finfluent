// LoginSignup.js
import React, { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendEmailVerification, 
  signOut 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isSignUp, setIsSignUp]   = useState(false);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        // ----- SIGN UP FLOW -----
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Send verification email to newly created user
        await sendEmailVerification(userCredential.user);

        // Immediately sign them out so they can't proceed until verifying
        await signOut(auth);

        alert(
          "Account created successfully! A verification email has been sent to your inbox. " +
          "Please verify your email before logging in."
        );
        // Redirect them to login page
        navigate("/login");
      } else {
        // ----- LOGIN FLOW -----
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Check if email is verified
        if (!userCredential.user.emailVerified) {
          alert("Please verify your email before logging in.");
          // Sign out again to prevent partial login
          await signOut(auth);
          return;
        }

        // Email is verified, allow login
        alert("Welcome back! You've successfully logged in.");
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.code) {
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          setError("Account not found. Please sign up first.");
        } else if (err.code === "auth/wrong-password") {
          setError("Incorrect password. Please try again.");
        } else if (err.code === "auth/invalid-email") {
          setError("The email address is invalid. Please check and try again.");
        } else if (err.code === "auth/email-already-in-use") {
          setError("This email is already registered. Please log in or use a different email.");
        } else if (err.code === "auth/weak-password") {
          setError("The password is too weak. It must be at least 6 characters long.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google login successful!");
      if (window.opener) {
        // Close the popup window if it exists
        window.close();
      } else {
        // Otherwise, navigate to the dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during Google login. Please try again.");
    }
  };

  return (
    <>
      {/* Fixed header matching your home page style */}
      <header>
        <nav className="bg-gray-900/80 backdrop-blur-md text-white flex justify-between items-center py-4 px-6 border-b border-blue-900/30 fixed w-full z-50">
          {/* Big "Wealthify" linking to home */}
          <Link to="/home" className="text-xl font-semibold text-blue-400 hover:text-blue-300">
            Finfluent
          </Link>
          <div>
            <Link to="/home" className="mr-4 text-sm hover:text-blue-300 transition-colors">
              Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Full-screen gradient background, account for fixed nav height */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="bg-gray-800 bg-opacity-75 backdrop-blur-lg rounded-xl shadow-xl p-8 w-full max-w-md"
        >
          <h2 className="text-3xl font-bold text-center text-blue-400 mb-6">
            {isSignUp ? "Create Account" : "Login"}
          </h2>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold"
            >
              {isSignUp ? "Sign Up" : "Login"}
            </button>
          </form>

          {/* Toggle between Sign Up and Login */}
          <div className="text-center mt-4">
            <p className="text-gray-300 text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 ml-2 hover:underline"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Separator */}
          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-2 text-gray-400 text-sm">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold flex items-center justify-center"
          >
            {/* Google icon SVG */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.089,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.06,0,5.842,1.154,7.961,3.039l5.657-5.657C34.092,6.26,29.268,4,24,4C13.506,4,5,12.506,5,23 s8.506,19,19,19s19-8.506,19-19C43,22.634,43.5,21.361,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.225,16.087,18.65,13,24,13c3.06,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.092,6.26,29.268,4,24,4C16.318,4,9.655,8.113,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.945-1.977,13.271-5.196l-6.19-5.329C29.211,35.091,26.74,36,24,36 c-4.91,0-9.091-3.317-10.582-7.77l-6.511,5.025C9.96,40.885,16.293,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.492,1.258-1.156,2.447-1.993,3.5H24v8h18.611 C41.327,37.338,43,31.676,43,24C43,22.634,43.5,21.361,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    </>
  );
};

export default Login;

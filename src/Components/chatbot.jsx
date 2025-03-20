import React, { useState, useEffect } from 'react';
import { FaArrowAltCircleUp } from "react-icons/fa";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { db, auth } from '../config/firebase';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [language, setLanguage] = useState('English');

  const apiKey = import.meta.env.VITE_GPT_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const languages = [
    "English", // Approximately 1.5 billion total speakers
    "Mandarin", // Approximately 1.2 billion total speakers
    "Hindi", // Approximately 609 million total speakers
    "Spanish", // Approximately 558 million total speakers
    "French", // Approximately 312 million total speakers
    "Bengali", // Approximately 284 million total speakers
    "Portuguese", // Approximately 267 million total speakers
    "Russian", // Approximately 253 million total speakers
    "Indonesian", // Approximately 252 million total speakers
    "Urdu", // Approximately 246 million total speakers
    "German", // Approximately 134 million total speakers
    "Japanese", // Approximately 126 million total speakers
    "Nigerian Pidgin", // Approximately 121 million total speakers
    "Marathi", // Approximately 99 million total speakers
    "Vietnamese", // Approximately 97 million total speakers
    "Telugu", // Approximately 96 million total speakers
    "Hausa", // Approximately 94 million total speakers
    "Turkish", // Approximately 91 million total speakers
    "Western Punjabi", // Approximately 90 million total speakers
    "Swahili", // Approximately 87 million total speakers
    "Tagalog", // Approximately 87 million total speakers
    "Tamil", // Approximately 86 million total speakers
    "Cantonese", // Approximately 86 million total speakers
    "Shanghainese", // Approximately 83 million total speakers
    "Iranian Persian", // Approximately 83 million total speakers
    "Korean", // Approximately 82 million total speakers
    "Thai", // Approximately 71 million total speakers
    "Javanese", // Approximately 69 million total speakers
    "Italian", // Approximately 66 million total speakers
    "Gujarati", // Approximately 62 million total speakers
    "Levantine Arabic", // Approximately 60 million total speakers
    "Amharic", // Approximately 60 million total speakers
    "Bhojpuri", // Approximately 52 million total speakers
    "Eastern Punjabi", // Approximately 52 million total speakers
    "Hokkien", // Approximately 49 million total speakers
    "Jin Chinese", // Approximately 47 million total speakers
    "Filipino", // Approximately 45 million total speakers
    "Hakka Chinese", // Approximately 44 million total speakers
    "Yoruba", // Approximately 43 million total speakers
    "Burmese", // Approximately 43 million total speakers
    "Sudanese Spoken Arabic", // Approximately 42 million total speakers
    "Polish", // Approximately 41 million total speakers
    "Odia", // Approximately 40 million total speakers
    "Malayalam", // Approximately 37 million total speakers
    "Xiang Chinese", // Approximately 38.1 million total speakers
    "Moroccan Arabic", // Approximately 39.2 million total speakers
    "Lingala", // Approximately 40.3 million total speakers
    // Additional Indian languages
    "Santali", // Approximately 7.6 million total speakers
    "Konkani", // Approximately 7.4 million total speakers
    "Maithili", // Approximately 34 million total speakers
    "Sindhi", // Approximately 25 million total speakers
    "Dogri", // Approximately 5 million total speakers
    "Manipuri", // Approximately 3.3 million total speakers
    "Bodo", // Approximately 1.5 million total speakers
    "Kashmiri", // Approximately 6.8 million total speakers
    "Sanskrit", // Approximately 24,000 total speakers (classical language)
    "Tulu" // Approximately 2 million total speakers
  ];
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchUserProfile(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      setProfileData(userDoc.data());
    }
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput('');

      // Create a concise user profile summary
      const userProfile = profileData
        ? `Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Expenses: ${profileData.bigExpenses}, Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current: ${profileData.currentInvestments.join(', ')}`
        : "No profile";

      // Concise prompt with minimal tokens
      const prompt = `Lang: ${language}. ${userProfile}. Q: ${input}`;
      console.log(prompt);

      try {
        setLoading(true);
        const result = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo", // Using turbo model
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
        setLoading(false);
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
        setMessages([...newMessages, { text: 'Error: Could not get response from AI', user: false }]);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-[82%] bg-gradient-to-b from-[#172554] to-[#bae6fd] max-w-4xl mx-auto space-y-4 p-4 ">
      <div className="flex gap-10 justify-center items-center w-full px-8 mb-8">
        <h1 className="font-bold font-sans text-[3rem] drop-shadow-lg text-white">Finance AI Chatbot</h1>
        <select
          className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {languages.map((lang, index) => (
            <option key={index} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className="bg-white w-[95vh] shadow-lg rounded-lg overflow-hidden">
        <div className="p-8 h-[65vh] overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.user ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`rounded-lg p-3 shadow-md flex flex-wrap font-sans ${msg.user ? 'bg-blue-600 text-white' : 'bg-blue-100'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="wrapper">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="shadow"></div>
              <div className="shadow"></div>
              <div className="shadow"></div>
              <span className="text-blue-500">Loading</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="ml-2 text-white bg-blue-900 hover:bg-gray-800 p-2 rounded-lg transition-all"
            onClick={handleSendMessage}
          >
            <FaArrowAltCircleUp size={25} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

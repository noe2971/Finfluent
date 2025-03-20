import React, { useState } from "react";

const indianLanguages = [
  "English", // Approximately 1.5 billion total speakers
  "Mandarin Chinese", // Approximately 1.2 billion total speakers
  "Hindi", // Approximately 609 million total speakers
  "Spanish", // Approximately 558 million total speakers
  "French", // Approximately 312 million total speakers
  "Bengali", // Approximately 284 million total speakers
  "Portuguese", // Approximately 267 million total speakers
  "Russian", // Approximately 253 million total speakers
  "Indonesian", // Approximately 252 million total speakers
  "Urdu", // Approximately 246 million total speakers
  "Standard German", // Approximately 134 million total speakers
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
  "Yue Chinese (Cantonese)", // Approximately 86 million total speakers
  "Wu Chinese (Shanghainese)", // Approximately 83 million total speakers
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
  "Min Nan Chinese (Hokkien)", // Approximately 49 million total speakers
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


const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  return (
    <div style={{ width: "300px", margin: "20px auto", textAlign: "center" }}>
      <h3>Select Your Language</h3>
      <select
        style={{ padding: "10px", width: "100%", borderRadius: "5px" }}
        onChange={handleLanguageChange}
        defaultValue=""
      >
        <option value="" disabled>
          Choose a language
        </option>
        {indianLanguages.map((language, index) => (
          <option key={index}>{language}</option>
        ))}
      </select>
      {selectedLanguage && (
        <div style={{ marginTop: "10px" }}>
          <strong>You selected:</strong> {selectedLanguage}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

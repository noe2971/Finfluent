import React, { useState } from "react";

const indianLanguages = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Punjabi",
  "Bengali",
  "Odia",
  "Assamese",
  "Urdu",
  "Manipuri",
  "Kashmiri",
  "Sanskrit",
  "Sindhi",
  "Nepali",
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

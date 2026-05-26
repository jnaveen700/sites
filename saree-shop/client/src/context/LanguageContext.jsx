// Language Context - Manages Telugu/English language selection
// Provides language state and functions to all components

import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // 'en' or 'te'
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
    
    // Set HTML lang attribute
    document.documentElement.lang = savedLanguage;
    
    // Set body class for font styles
    document.body.className = `lang-${savedLanguage}`;
    
    setIsLoading(false);
  }, []);

  // Switch language function
  const switchLanguage = (lang) => {
    if (lang === 'en' || lang === 'te') {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      
      // Update HTML attributes
      document.documentElement.lang = lang;
      document.body.className = `lang-${lang}`;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, isLoading }}>
      {!isLoading && children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

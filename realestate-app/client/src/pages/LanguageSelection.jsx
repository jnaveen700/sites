// Language Selection Page - First page users see when entering the app
// Allows choosing between Telugu and English

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import './LanguageSelection.css';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { switchLanguage, t } = useLanguage();

  const handleLanguageSelect = (lang) => {
    switchLanguage(lang);
    // Redirect to home page after language selection
    navigate('/home');
  };

  return (
    <div className="language-selection-page">
      <div className="language-container">
        {/* Header */}
        <div className="language-header">
          <h1 className="app-logo">సరీ దుకాణం | SAREE SHOP</h1>
        </div>

        {/* Main Content */}
        <div className="language-content">
          <h2 className="language-title">భాష ఎంచుకోండి | Select Language</h2>
          <p className="language-subtitle">
            మీ ఆధారిత భాషను ఎంచుకోండి | Choose Your Preferred Language
          </p>

          {/* Language Options */}
          <div className="language-options">
            {/* Telugu Option */}
            <button
              className="language-card telugu-card"
              onClick={() => handleLanguageSelect('te')}
            >
              <div className="language-icon">🇮🇳</div>
              <h3 className="language-name">తెలుగు</h3>
              <p className="language-desc">Telugu</p>
              <span className="select-hint">మీ పસంద ఎంచుకోండి</span>
            </button>

            {/* English Option */}
            <button
              className="language-card english-card"
              onClick={() => handleLanguageSelect('en')}
            >
              <div className="language-icon">🇬🇧</div>
              <h3 className="language-name">English</h3>
              <p className="language-desc">English</p>
              <span className="select-hint">Choose Your Preference</span>
            </button>
          </div>

          {/* Info Section */}
          <div className="language-info">
            <div className="info-box">
              <h4>🌐 మీ ఆరాధనీయ భాష</h4>
              <p>
                సరీ దుకాణం తెలుగు మరియు ఆంగ్లం రెండు భాషల్లో సమర్థ కంటెంట్ అందిస్తుంది. 
                మీ ఆధారిత భాష ఎంచుకోండి మరియు కొనుగోలు చేయండి.
              </p>
            </div>

            <div className="info-box">
              <h4>🛍️ Your Preferred Language</h4>
              <p>
                Saree Shop offers complete content in both Telugu and English. 
                Select your preferred language and start shopping with ease.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="features-section">
            <div className="feature">
              <span className="feature-icon">📱</span>
              <p>మొబైల్ అనుకూల | Mobile Friendly</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <p>సురక్షితమైన | Secure</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💳</span>
              <p>సులభ చెల్లింపు | Easy Payment</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <p>వేగవంతమైన డెలివరీ | Fast Delivery</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="language-footer">
          <p>
            &copy; 2025 సరీ దుకాణం | Saree Shop. అన్ని హక్కులు సংరక్షితం | All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LanguageSelection;

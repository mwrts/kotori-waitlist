
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';

type ThemeType = 'morning' | 'sakura' | 'forest';

const THEME_CONFIG = {
  morning: {
    light: { primary: '#4A90E2', secondary: '#6FCF97', accent: '#FFD700', bg: '#F8FAFB', text: '#2C3E50', card: '#FFFFFF' },
    dark: { primary: '#5C9CE6', secondary: '#56B381', accent: '#D9B935', bg: '#08090A', text: '#E2E2E2', card: '#111317' }
  },
  sakura: {
    light: { primary: '#FF6B9D', secondary: '#4ECDC4', accent: '#FFE66D', bg: '#FFF9F0', text: '#3A3A3A', card: '#FFFFFF' },
    dark: { primary: '#E65A8C', secondary: '#3BB1A9', accent: '#D9C35D', bg: '#0A0809', text: '#E2E2E2', card: '#171113' }
  },
  forest: {
    light: { primary: '#608579', secondary: '#4A6D63', accent: '#F4D03F', bg: '#FDFDFB', text: '#344e41', card: '#FFFFFF' },
    dark: { primary: '#7DA89A', secondary: '#6A9154', accent: '#D9B935', bg: '#080A09', text: '#E2E2E2', card: '#111713' }
  }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>(() => (localStorage.getItem('kotori_theme') as ThemeType) || 'morning');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('kotori_dark_mode') === 'true');

  useEffect(() => {
    localStorage.setItem('kotori_theme', theme);
    localStorage.setItem('kotori_dark_mode', String(isDarkMode));
    
    const root = document.documentElement;
    const mode = isDarkMode ? 'dark' : 'light';
    const colors = THEME_CONFIG[theme][mode];
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--card-bg', colors.card);
    
    document.body.style.backgroundColor = colors.bg;
  }, [theme, isDarkMode]);

  const handleStart = () => {
    const waitlistSection = document.getElementById('waitlist');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <LandingPage 
        onStart={handleStart} 
        theme={theme} 
        setTheme={setTheme} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
      />
    </div>
  );
};

export default App;

import { createContext, useContext, useState, useEffect } from 'react';

const AppearanceContext = createContext();

export function AppearanceProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('#0f4c3a');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedAccentColor = localStorage.getItem('accentColor') || '#0f4c3a';
    setTheme(savedTheme);
    setAccentColor(savedAccentColor);

    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }

    // Apply accent color as CSS variable
    document.documentElement.style.setProperty('--accent-color', savedAccentColor);
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Apply theme to document
    document.documentElement.classList.remove('dark');
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  };

  const updateAccentColor = (newColor) => {
    setAccentColor(newColor);
    localStorage.setItem('accentColor', newColor);
    document.documentElement.style.setProperty('--accent-color', newColor);
  };

  return (
    <AppearanceContext.Provider value={{ theme, accentColor, updateTheme, updateAccentColor }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
}

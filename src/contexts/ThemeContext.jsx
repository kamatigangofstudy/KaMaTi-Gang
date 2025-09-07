"use client";

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const theme = {
    light: {
      background: "#F9FAFB",
      primary: "#00A896",
      secondary: "#4B5563",
      text: "#111827",
      card: "#FFFFFF",
      button: {
        bg: "#00A896",
        text: "#FFFFFF"
      }
    },
    dark: {
      background: "#0D1B2A",
      primary: "#00E0FF",
      secondary: "#E5E7EB",
      text: "#F9FAFB",
      card: "#1E293B",
      button: {
        bg: "linear-gradient(135deg, #0D1B2A, #00E0FF)",
        text: "#FFFFFF"
      }
    }
  };

  const currentTheme = isDark ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme, 
      theme: currentTheme,
      colors: theme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
"use client";

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-8 right-44 z-[1100] w-12 h-12 rounded-full bg-white dark:bg-[#1E293B] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl border border-gray-200 dark:border-gray-600"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "🌞" : "🌙"}
    </button>
  );
}
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    colors: isDark ? {
      // Dark theme (current purple/pink)
      bg: 'bg-black',
      text: 'text-purple-300',
      textSecondary: 'text-purple-400',
      textAccent: 'text-pink-400',
      textHighlight: 'text-pink-300',
      border: 'border-purple-500',
      borderSecondary: 'border-purple-600',
      borderAccent: 'border-pink-400',
      bgGradient: 'bg-gradient-to-b from-purple-950 to-black',
      bgGradientAlt: 'bg-gradient-to-r from-purple-900 to-pink-900',
      bgCard: 'bg-gradient-to-b from-purple-950 to-black',
      bgHover: 'hover:bg-purple-900/30',
      bgSelected: 'bg-pink-900/30',
      bgBox: 'bg-purple-950/50',
      shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.5)]',
      shadowSmall: 'shadow-[0_0_10px_rgba(236,72,153,0.5)]',
      shadowButton: 'shadow-[0_0_20px_rgba(168,85,247,0.7)]',
      glow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]',
      buttonGradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
      buttonHover: 'hover:from-purple-500 hover:to-pink-500',
      pixel: 'bg-purple-500',
      pixelAlt: 'bg-cyan-400'
    } : {
      // Light theme (pastel colors)
      bg: 'bg-pink-50',
      text: 'text-purple-700',
      textSecondary: 'text-purple-600',
      textAccent: 'text-pink-600',
      textHighlight: 'text-pink-700',
      border: 'border-purple-400',
      borderSecondary: 'border-purple-300',
      borderAccent: 'border-pink-500',
      bgGradient: 'bg-gradient-to-b from-purple-100 to-pink-50',
      bgGradientAlt: 'bg-gradient-to-r from-purple-200 to-pink-200',
      bgCard: 'bg-gradient-to-b from-purple-100 to-pink-50',
      bgHover: 'hover:bg-purple-200/50',
      bgSelected: 'bg-pink-200/50',
      bgBox: 'bg-purple-50/50',
      shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
      shadowSmall: 'shadow-[0_0_10px_rgba(236,72,153,0.3)]',
      shadowButton: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      glow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]',
      buttonGradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      buttonHover: 'hover:from-purple-600 hover:to-pink-600',
      pixel: 'bg-purple-400',
      pixelAlt: 'bg-cyan-500'
    }
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
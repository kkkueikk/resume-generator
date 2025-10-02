import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        retro-button px-4 py-3 ${colors.buttonGradient} text-white
        border-4 ${colors.border} text-xs ${colors.buttonHover}
        transition-all leading-relaxed ${colors.shadowButton}
      `}
      aria-label="Toggle theme"
    >
      {isDark ? '☀ LIGHT' : '🌙 DARK'}
    </button>
  );
}
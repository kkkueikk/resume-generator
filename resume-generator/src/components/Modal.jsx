import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Modal({ isOpen, onClose, title, children }) {
  const { colors } = useTheme();
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-80"
        onClick={onClose}
      />

      {/* Modal Content - 8-bit RPG Dialog Box */}
      <div className={`relative dialog-box ${colors.text} ${colors.bg} max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden border-4 ${colors.border}`}>
        {/* Decorative corner pixels */}
        <div className={`absolute top-0 left-0 w-4 h-4 ${colors.pixel}`}></div>
        <div className={`absolute top-0 right-0 w-4 h-4 ${colors.pixel}`}></div>
        <div className={`absolute bottom-0 left-0 w-4 h-4 ${colors.pixelAlt}`}></div>
        <div className={`absolute bottom-0 right-0 w-4 h-4 ${colors.pixelAlt}`}></div>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b-4 ${colors.border} ${colors.bgGradientAlt}`}>
          <h2 className={`text-base md:text-lg ${colors.text} ${colors.glow} leading-relaxed`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`${colors.textAccent} hover:${colors.text} transition-colors text-2xl font-bold ml-4 hover:scale-110 active:scale-95`}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className={`p-6 overflow-y-auto max-h-[calc(90vh-140px)] ${colors.bgCard}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
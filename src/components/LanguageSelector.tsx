// LanguageSelectorModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { X, Check, Languages } from 'lucide-react';
import { setLanguage } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageSelectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { data, defaultLanguage, setDefaultLanguage } = useApp();
  const { theme } = useTheme();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    setDefaultLanguage(langCode);
    setLanguage(langCode as 'en' | 'tr');
    onClose();
  };

  const languages = data ? Object.values(data.languages) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundImage: theme === "dark" ? 'radial-gradient(transparent 1px, #000000 1px)' : 'radial-gradient(transparent 1px, #000000 1px)',

              backdropFilter: `blur(3px)`,
              backgroundColor: 'transparent',

              backgroundSize: '2px 3px',
              transform: "none",
              maskImage: 'linear-gradient(#ffffff calc(100% - 20px), transparent)',
              WebkitMaskImage: 'linear-gradient(#ffffff calc(100% - 20px), transparent)', // Safari için
            }}
            className="fixed inset-0  z-50"
            onClick={onClose}
          />
          
          {/* Bottom Sheet / Modal */}
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center pointer-events-none">
            <motion.div
              initial={isDesktop ? { scale: 0.95, opacity: 0 } : { y: '100%' }}
              animate={isDesktop ? { scale: 1, opacity: 1 } : { y: 0 }}
              exit={isDesktop ? { scale: 0.95, opacity: 0 } : { y: '100%' }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 40,
                mass: 0.8
              }}
              className={`relative w-full lg:w-auto lg:max-w-md lg:max-h-[600px] max-h-[85vh] ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-2xl border-t lg:border lg:rounded-3xl rounded-t-3xl border-white/10' 
                  : 'bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-2xl border-t lg:border lg:rounded-3xl rounded-t-3xl border-black/10'
              } shadow-2xl pointer-events-auto overflow-hidden flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar - Mobile Only */}
              <div className="flex justify-center pt-3 pb-2 lg:hidden">
                <div className={`w-12 h-1.5 rounded-full ${
                  theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
                }`} />
              </div>
              {/* Header */}
              <div className={`relative px-5 lg:px-6 pt-2 lg:pt-4 pb-4 border-b ${
                theme === 'dark' ? 'border-white/10' : 'border-black/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-black/10 text-gray-900'
                    }`}>
                      <Languages className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold tracking-tight ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Select Language
                      </h2>
                      <p className={`text-xs mt-0.5 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Choose your preferred language
                      </p>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                        : 'hover:bg-black/10 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Language Grid - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 lg:px-6 pb-6 lg:pb-6 pt-4 safe-area-inset-bottom">
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang, index) => {
                    const isSelected = defaultLanguage === lang.code;

                    return (
                      <motion.button
                        key={lang.code}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.03,
                          duration: 0.2,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        onClick={() => handleLanguageSelect(lang.code)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative group flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-white text-gray-900 shadow-md shadow-white/20 border border-white'
                              : 'bg-black text-white shadow-md shadow-black/20 border border-black'
                            : theme === 'dark'
                            ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent hover:border-white/20'
                            : 'bg-black/5 text-gray-700 hover:bg-black/10 border border-transparent hover:border-black/20'
                        }`}
                      >
                        {/* Flag */}
                        <div className={`text-2xl leading-none transition-transform duration-200 ${
                          isSelected ? 'scale-110' : 'group-hover:scale-110'
                        }`}>
                          {lang.flag}
                        </div>
                        
                        {/* Language Name */}
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs font-semibold tracking-tight ${
                            isSelected ? '' : theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {lang.name}
                          </span>
                          <span className={`text-[10px] font-medium ${
                            isSelected 
                              ? theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                              : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {lang.code.toUpperCase()}
                          </span>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              type: 'spring',
                              stiffness: 500,
                              damping: 30
                            }}
                            className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-md ${
                              theme === 'dark' 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-white text-black'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </motion.div>
                        )}

                        {/* Hover Glow Effect */}
                        {!isSelected && (
                          <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                            theme === 'dark'
                              ? 'bg-gradient-to-br from-white/5 to-transparent'
                              : 'bg-gradient-to-br from-black/5 to-transparent'
                          }`} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LanguageSelectorModal;
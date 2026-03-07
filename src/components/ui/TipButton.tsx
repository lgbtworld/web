import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Coins, X, Loader2, CheckCircle2, Plus, DollarSign, HandCoins, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface TipButtonProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientUsername?: string;
  onTipSuccess?: (amount: number) => void;
  trigger?: React.ReactNode;
  className?: string;
}

const tipAmounts = [
    { amount: 0.10, label: '0.10' },
    { amount: 0.25, label: '0.25' },
    { amount: 0.50, label: '0.50' },
    { amount: 0.75, label: '0.75' },
    { amount: 1.00, label: '1.00' },
    { amount: 1.25, label: '1.25' },
    { amount: 1.50, label: '1.50' },
    { amount: 1.75, label: '1.75' },
    { amount: 2.00, label: '2.00' },
    { amount: 2.25, label: '2.25' },
    { amount: 2.50, label: '2.50' },
    { amount: 2.75, label: '2.75' },
    { amount: 3.00, label: '3.00' },
    { amount: 3.50, label: '3.50' },
    { amount: 4.00, label: '4.00' },
    { amount: 4.50, label: '4.50' },
    { amount: 5.00, label: '5.00' },
    { amount: 10, label: '10.00' },
    { amount: 20, label: '20.00' },
    { amount: 30, label: '30.00' },
    { amount: 40, label: '40.00' },
    { amount: 50, label: '50.00' },
    { amount: 75, label: '75.00' },
    { amount: 100, label: '100' },
  ];

const rainbowRankStyles: Array<{ background: string; color: string }> = [
  {
    background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B3B 100%)',
    color: '#ffffff',
  },
  {
    background: 'linear-gradient(135deg, #FF9500 0%, #FFD60A 100%)',
    color: '#1f2937',
  },
  {
    background: 'linear-gradient(135deg, #FFD60A 0%, #34C759 100%)',
    color: '#1f2937',
  },
  {
    background: 'linear-gradient(135deg, #34C759 0%, #32D74B 100%)',
    color: '#ffffff',
  },
  {
    background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
    color: '#ffffff',
  },
  {
    background: 'linear-gradient(135deg, #5856D6 0%, #5E5CE6 100%)',
    color: '#ffffff',
  },
  {
    background: 'linear-gradient(135deg, #AF52DE 0%, #FF2D55 100%)',
    color: '#ffffff',
  },
];

const tipBurstPalette = ['#fbbf24', '#f97316', '#fb7185', '#fecdd3', '#fde68a'];
const TIP_CELEBRATION_DURATION = 2600;
const TIP_SUCCESS_DISPLAY_DURATION = 2000;

type TipParticle = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  Icon: typeof DollarSign;
  color: string;
  delay: number;
};

type TipConfetti = {
  id: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  rotate: number;
  duration: number;
  delay: number;
};

type TipStreak = {
  id: number;
  angle: number;
  length: number;
  delay: number;
};

const createTipParticles = (count: number = 16): TipParticle[] =>
  Array.from({ length: count }).map((_, index) => {
    const radius = 180 + Math.random() * 80;
    const angle = (index * 360) / count;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    const color = tipBurstPalette[index % tipBurstPalette.length];

    return {
      id: index,
      x,
      y,
      rotate: Math.random() * 360,
      Icon: DollarSign,
      color,
      delay: index * 0.06,
    };
  });

const createTipConfetti = (count: number = 26): TipConfetti[] =>
  Array.from({ length: count }).map((_, index) => {
    const size = 8 + Math.random() * 8;
    const angle = (index * 360) / count;
    const radius = 60 + Math.random() * 160;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    const shapes: Array<'circle' | 'square' | 'triangle'> = ['circle', 'square', 'triangle'];
    return {
      id: index,
      size,
      color: tipBurstPalette[index % tipBurstPalette.length],
      shape: shapes[index % shapes.length],
      x,
      y,
      driftX: Math.random() * 40 - 20,
      driftY: Math.random() * 80 + 20,
      rotate: Math.random() * 180,
      duration: 1.2 + Math.random() * 0.5,
      delay: index * 0.05,
    };
  });

const createTipStreaks = (count: number = 6): TipStreak[] =>
  Array.from({ length: count }).map((_, index) => ({
    id: index,
    angle: Math.random() * 360,
    length: 110 + Math.random() * 60,
    delay: index * 0.1,
  }));
  
const TipButton: React.FC<TipButtonProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  recipientUsername,
  onTipSuccess,
  trigger,
  className = '',
}) => {
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showTipCelebration, setShowTipCelebration] = useState(false);
  const [tipParticles, setTipParticles] = useState<TipParticle[]>(() => createTipParticles());
  const [tipConfetti, setTipConfetti] = useState<TipConfetti[]>(() => createTipConfetti());
  const [tipStreaks, setTipStreaks] = useState<TipStreak[]>(() => createTipStreaks());
  const [tipOverlayKey, setTipOverlayKey] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingCoinAngles = useMemo(
    () => ['-90deg', '-35deg', '15deg', '80deg', '135deg'],
    []
  );

  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Get user balance (default to 0 if not available, ensure it's a number)
  const userBalance = useMemo(() => {
    const balance = (user as any)?.balance;
    if (balance === null || balance === undefined) return 0;
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : Number(balance);
    return isNaN(numBalance) ? 0 : numBalance;
  }, [user]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (successRevealTimeoutRef.current) {
        clearTimeout(successRevealTimeoutRef.current);
      }
      if (successCloseTimeoutRef.current) {
        clearTimeout(successCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showTipCelebration) {
      setTipOverlayKey(Date.now());
      setTipParticles(createTipParticles());
      setTipConfetti(createTipConfetti());
      setTipStreaks(createTipStreaks());
    }
  }, [showTipCelebration]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTipModal) {
        setShowTipModal(false);
      }
    };

    if (showTipModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showTipModal]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowTipModal(false);
      }
    };

    if (showTipModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTipModal]);

  const handleOpenModal = () => {
    setShowTipModal(true);
    setSelectedAmount(null);
    setCustomAmount('');
    setIsProcessing(false);
    setCustomMode(false);
    setIsSuccess(false);
    setSuccessAmount(0);
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    if (successRevealTimeoutRef.current) {
      clearTimeout(successRevealTimeoutRef.current);
    }
    if (successCloseTimeoutRef.current) {
      clearTimeout(successCloseTimeoutRef.current);
    }
    setShowTipCelebration(false);
  };

  const handleAmountSelect = (amount: number) => {
    // Toggle: If the same amount is clicked, deselect it
    if (selectedAmount === amount) {
      setSelectedAmount(null);
    } else {
      setSelectedAmount(amount);
      setCustomAmount('');
    }
    setCustomMode(false);
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and up to 2 decimal places
    const regex = /^\d*(\.\d{0,2})?$/;
    if (regex.test(value) || value === '') {
      setCustomAmount(value);
      setSelectedAmount(null);
      setCustomMode(true);
    }
  };

  const handleCustomCardSelect = () => {
    if (!customMode) {
      setCustomMode(true);
    }
    setSelectedAmount(null);
    setTimeout(() => customInputRef.current?.focus(), 0);
  };

  const handleCustomRatioSelect = (ratio: number) => {
    if (userBalance <= 0) return;
    const value = (userBalance * ratio).toFixed(2);
    setCustomAmount(value);
    setSelectedAmount(null);
    setCustomMode(true);
    setTimeout(() => customInputRef.current?.focus(), 0);
  };

  const shouldShowCustomInput = customMode || customAmount !== '';

  const getFinalAmount = (): number => {
    if (customAmount) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) || parsed <= 0 ? 0 : Math.max(0, parsed);
    }
    return selectedAmount ? Math.max(0, selectedAmount) : 0;
  };

  const handleTipSubmit = async () => {
    const amount = getFinalAmount();
    if (amount <= 0) return;

    setIsProcessing(true);
    try {
      const response = await api.handleSendTip(recipientId, amount);

      const nextBalance = response?.balance;
      if (typeof nextBalance === 'number' || typeof nextBalance === 'string') {
        const parsedBalance = Number(nextBalance);
        if (!Number.isNaN(parsedBalance)) {
          updateUser({ balance: parsedBalance });
        }
      }

      setSuccessAmount(amount);
      setIsSuccess(false);
      setShowTipModal(false);
      setShowTipCelebration(true);
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowTipCelebration(false);
      }, TIP_CELEBRATION_DURATION);

      if (successRevealTimeoutRef.current) {
        clearTimeout(successRevealTimeoutRef.current);
      }
      successRevealTimeoutRef.current = setTimeout(() => {
        setShowTipModal(true);
        setIsSuccess(true);
        if (successCloseTimeoutRef.current) {
          clearTimeout(successCloseTimeoutRef.current);
        }
        successCloseTimeoutRef.current = setTimeout(() => {
          setShowTipModal(false);
          setIsSuccess(false);
        }, TIP_SUCCESS_DISPLAY_DURATION);
      }, TIP_CELEBRATION_DURATION);

      onTipSuccess?.(amount);
      setSelectedAmount(null);
      setCustomAmount('');
      setCustomMode(false);
    } catch (error) {
      console.error('Error sending tip:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const defaultTrigger = (
    <motion.button
      onClick={handleOpenModal}
      whileTap={{ scale: 0.9 }}
      className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10'}`}
    >
      <HandCoins className="w-5 h-5" />
      <span className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tip</span>
    </motion.button>
  );

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleOpenModal();
  };

  const finalAmount = useMemo(() => {
    const amount = getFinalAmount();
    return isNaN(amount) ? 0 : Math.max(0, amount);
  }, [selectedAmount, customAmount]);
  
  const canSubmit = finalAmount > 0 && !isProcessing && !isSuccess && finalAmount <= userBalance;

  return (
    <>
      {trigger ? (
        <div
          className={className}
          onClick={handleTriggerClick}
          style={{ pointerEvents: 'auto' }}
        >
          {React.isValidElement(trigger)
            ? React.cloneElement(trigger as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleOpenModal();
                },
                style: { pointerEvents: 'auto' as const, ...((trigger as any).props?.style || {}) }
              })
            : trigger
          }
        </div>
      ) : (
        defaultTrigger
      )}

      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showTipModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]  flex items-end sm:items-center justify-center p-0 sm:p-2 md:p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowTipModal(false);
                }
              }}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <motion.div
                ref={modalRef}
                initial={{ 
                  opacity: 0, 
                  y: isMobile ? '100%' : 20,
                  scale: isMobile ? 1 : 0.95
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: 1
                }}
                exit={{ 
                  opacity: 0, 
                  y: isMobile ? '100%' : 20,
                  scale: isMobile ? 1 : 0.95
                }}
                transition={{ 
                  duration: isMobile ? 0.3 : 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full sm:w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto scrollbar-hide rounded-t-3xl sm:rounded-2xl shadow-2xl ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-t border-l border-r border-gray-800 sm:border'
                    : 'bg-white border-t border-l border-r border-gray-200 sm:border'
                }`}
              >
                {/* Mobile Drag Handle */}
                {isMobile && (
                  <div className="flex justify-center pt-3 pb-2">
                    <div className={`w-12 h-1.5 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                  </div>
                )}
                
                {/* Success State */}
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-6 py-12 sm:py-16 flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50'
                      }`}
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      Tip Sent!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      ${successAmount.toFixed(2)} sent to {recipientName}
                    </motion.p>
                  </motion.div>
                ) : (
                  <>
                    {/* Modal Header - Compact Design */}
                    <div className={`px-4 py-3 sm:px-6 sm:py-5 border-b ${
                      theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            theme === 'dark'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-yellow-50 text-yellow-600'
                          }`}>
                            <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className={`text-base sm:text-lg font-semibold truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              Send Tip
                            </h3>
                            <p className={`text-xs sm:text-sm mt-0.5 truncate ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Support {recipientName}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTipModal(false);
                          }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-1.5 sm:p-2 rounded-full transition-colors duration-200 flex-shrink-0 ${
                            theme === 'dark'
                              ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Recipient Info & Balance */}
                    <div className={`px-4 py-4 sm:px-6 sm:py-5 border-b ${
                      theme === 'dark' ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50/60'
                    }`}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={`p-3 rounded-2xl border ${
                          theme === 'dark'
                            ? 'border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-800/60'
                            : 'border-gray-200 bg-white'
                        } flex items-center gap-3`}>
                          {recipientAvatar ? (
                            <img
                              src={recipientAvatar}
                              alt={recipientName}
                              className="w-11 h-11 rounded-full object-cover shadow-sm"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold ${
                              theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'
                            }`}>
                              {recipientName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {recipientName}
                            </p>
                            {recipientUsername && (
                              <p className={`text-xs truncate ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                @{recipientUsername}
                              </p>
                            )}
                            <span className={`text-[11px] uppercase tracking-wide ${
                              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              Recipient
                            </span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                          theme === 'dark'
                            ? 'border-gray-800 bg-gradient-to-br from-amber-500/10 to-yellow-500/5'
                            : 'border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50'
                        }`}>
                          <div>
                            <p className={`text-xs uppercase tracking-wide font-medium ${
                              theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
                            }`}>
                              Your Balance
                            </p>
                            {(() => {
                              const [integerPart, decimalPart] = userBalance.toFixed(2).split('.');
                              return (
                                <p className={`text-xl font-bold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  ${integerPart}
                                  <span className="text-base align-top">.{decimalPart}</span>
                                </p>
                              );
                            })()}
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            theme === 'dark'
                              ? 'bg-amber-500/10 text-amber-300'
                              : 'bg-amber-100 text-amber-600'
                          }`}>
                            <Coins className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="px-4 py-4 sm:px-6 sm:py-5">
                      {/* Quick Amount Selection */}
                      <div className="mb-4">
                        <label className={`block text-xs font-semibold mb-1.5 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Select Amount
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                          {tipAmounts.map((tip, index) => {
                            const isSelected = selectedAmount === tip.amount;
                            const gradientStyle = rainbowRankStyles[index % rainbowRankStyles.length];
                            return (
                              <motion.button
                                key={tip.amount}
                                onClick={() => handleAmountSelect(tip.amount)}
                                whileTap={{ scale: 0.96 }}
                                whileHover={{ scale: 1.01 }}
                                className={`relative cursor-pointer w-full px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 ${
                                  isSelected
                                    ? theme === 'dark'
                                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/50 shadow-md shadow-yellow-500/25'
                                      : 'bg-gradient-to-r from-yellow-50 to-yellow-100/70 border border-yellow-500 shadow-md shadow-yellow-500/30'
                                    : theme === 'dark'
                                      ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/70'
                                      : 'bg-white/90 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isSelected ? 'scale-110' : ''}`}
                                  style={{
                                    background: gradientStyle.background,
                                    color: gradientStyle.color,
                                    opacity: isSelected ? 1 : 0.85
                                  }}
                                >
                                  <DollarSign
                                    className={`w-3 h-3 transition-all duration-200 ${isSelected ? 'scale-105' : ''}`}
                                    style={{ color: gradientStyle.color }}
                                  />
                                </div>
                                <span className={`text-[13px] font-semibold leading-tight truncate ${
                                  isSelected
                                    ? theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                                    : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                  {tip.label}
                                </span>
                              </motion.button>
                            );
                          })}
                          <motion.button
                            onClick={handleCustomCardSelect}
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.01 }}
                            className={`relative cursor-pointer w-full px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200 ${
                              customMode
                                ? theme === 'dark'
                                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/50 shadow-md shadow-yellow-500/25'
                                  : 'bg-gradient-to-r from-yellow-50 to-yellow-100/70 border border-yellow-500 shadow-md shadow-yellow-500/30'
                                : theme === 'dark'
                                  ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/70'
                                  : 'bg-white/90 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${customMode ? 'scale-110' : ''}`}
                              style={{
                                backgroundColor: customMode ? '#F59E0B33' : '#F59E0B1F'
                              }}
                            >
                              <Plus className="w-3 h-3 text-yellow-600" />
                            </div>
                            <span className={`text-[11px] font-semibold leading-tight ${
                              customMode
                                ? theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'
                                : theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              Custom
                            </span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Divider & Custom Amount Input - Only show when no predefined amount is selected */}
                      <AnimatePresence>
                        {shouldShowCustomInput && (
                          <>
                            {/* Divider */}
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3 my-6 overflow-hidden"
                            >
                              <div className={`flex-1 h-px ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                              }`} />
                              <span className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                OR
                              </span>
                              <div className={`flex-1 h-px ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                              }`} />
                            </motion.div>

                            {/* Custom Amount Input */}
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mb-6 overflow-hidden"
                            >
                              <label className={`block text-sm font-semibold mb-2.5 ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                              }`}>
                                Custom Amount
                              </label>
                              <div className="space-y-2">
                                <div className="relative group">
                                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    <span className="text-xl font-bold">$</span>
                                  </div>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={customAmount}
                                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                                    placeholder="Enter amount"
                                    ref={customInputRef}
                                    className={`w-full pl-10 pr-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                                      theme === 'dark'
                                        ? 'bg-gray-800/70 border border-gray-700/50 text-white placeholder-gray-500 focus:border-yellow-500/60 focus:bg-gray-800 focus:ring-2 focus:ring-yellow-500/20'
                                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-yellow-500 focus:bg-white focus:ring-2 focus:ring-yellow-500/10'
                                    } focus:outline-none`}
                                  />
                                  {customAmount && (
                                    <motion.div
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                      }`}
                                    >
                                      {parseFloat(customAmount) > 0 && `$${parseFloat(customAmount).toFixed(2)}`}
                                    </motion.div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {[0.25, 0.5, 0.75, 1].map((ratio) => (
                                    <button
                                      key={ratio}
                                      type="button"
                                      onClick={() => handleCustomRatioSelect(ratio)}
                                      className={`flex-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        theme === 'dark'
                                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {Math.round(ratio * 100)}%
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>

                      {/* Insufficient Balance Warning */}
                      <AnimatePresence>
                        {finalAmount > userBalance && finalAmount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-4 space-y-3"
                          >
                            <div className={`p-3 rounded-xl flex items-center gap-2 ${
                              theme === 'dark'
                                ? 'bg-red-500/20 border border-red-500/30'
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <X className={`w-4 h-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                              <span className={`text-sm font-medium ${
                                theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              }`}>
                                Insufficient balance. You need ${(finalAmount - userBalance).toFixed(2)} more.
                              </span>
                            </div>
                            <motion.button
                              onClick={() => {
                                setShowTipModal(false);
                                navigate('/wallet');
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                theme === 'dark'
                                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/50 text-amber-300 hover:from-amber-500/30 hover:to-yellow-500/20 hover:border-amber-500/70'
                                  : 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-700 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300'
                              }`}
                            >
                              <Coins className="w-4 h-4" />
                              <span>Go to Deposit</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <motion.button
                        onClick={handleTipSubmit}
                        disabled={!canSubmit}
                        whileTap={canSubmit ? { scale: 0.98 } : undefined}
                        className={`w-full py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                          canSubmit
                            ? theme === 'dark'
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30'
                              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30'
                            : theme === 'dark'
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-5 h-5" />
                            <span>Send ${finalAmount.toFixed(2)}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showTipCelebration && (
            <motion.div
              key={tipOverlayKey}
              className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: theme === 'dark' ? 0.8 : 0.6 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(67,3,7,0.98) 0%, rgba(127,29,29,0.95) 40%, rgba(220,38,38,0.9) 75%, rgba(248,113,113,0.85) 100%)',
                }}
              />
    
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0.1, 0.35] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                style={{
                  background: 'radial-gradient(circle at 70% 40%, rgba(220,38,38,0.5), rgba(0,0,0,0) 60%)',
                  mixBlendMode: 'screen',
                }}
              />
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.4, 0], scale: [0.6, 1, 1.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)',
                }}
              />
              <motion.div
                className="absolute"
                style={{ width: 260, height: 260 }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.2, 1.4], opacity: [0.35, 0.1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut', repeat: Infinity, repeatType: 'loop' }}
              >
                <div className="w-full h-full rounded-full border border-white/15" />
              </motion.div>

              {tipStreaks.map((streak) => (
                <motion.span
                  key={`tip-streak-${streak.id}`}
                  className="absolute origin-center"
                  style={{
                    width: streak.length,
                    height: 2,
                    rotate: `${streak.angle}deg`,
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.1) 100%)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.05, 0.8], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: streak.delay, repeat: Infinity, repeatType: 'loop' }}
                />
              ))}

              {floatingCoinAngles.map((angle, index) => (
                <motion.div
                  key={`floating-coin-${index}`}
                  className="absolute text-white/70"
                  style={{ rotate: angle }}
                  initial={{ opacity: 0, scale: 0.4, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.4, 0.95, 1.15],
                    y: [-10, -40, -65],
                  }}
                  transition={{
                    duration: 1.6 + index * 0.1,
                    delay: 0.15 * index,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeOut',
                  }}
                >
                  <DollarSign className="h-7 w-7 text-white/80" />
                </motion.div>
              ))}

              <div className="relative z-[1] flex flex-col items-center gap-4 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                  className="relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="rounded-full drop-shadow-[0_0_65px_rgba(248,113,113,0.45)]"
                  >
                    <div className="w-28 h-28 rounded-full flex items-center justify-center bg-red-500/30">
                      <Coins className="w-14 h-14 text-white" />
                    </div>
                  </motion.div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="text-3xl font-bold tracking-tight text-white"
                >
                  Tip sent to {recipientName}!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                  className="text-lg font-semibold text-white"
                >
                  +${successAmount.toFixed(2)}
                </motion.p>
              </div>

              {tipParticles.map((particle) => (
                <motion.div
                  key={`tip-particle-${particle.id}`}
                  className="absolute drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    scale: [0, 1.3, 0.9],
                    opacity: [0, 1, 0],
                    rotate: particle.rotate + 120,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.3, ease: 'easeOut', delay: particle.delay }}
                >
                  <particle.Icon className="w-10 h-10" style={{ color: particle.color }} />
                </motion.div>
              ))}

              {tipConfetti.map((confetti) => (
                <motion.span
                  key={`tip-confetti-${confetti.id}`}
                  className="absolute left-1/2 top-1/2"
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0.8, 0],
                    scale: [0.4, 1, 0.9, 0.5],
                    x: [0, confetti.x * 0.6, confetti.x + confetti.driftX],
                    y: [0, confetti.y * 0.6, confetti.y + confetti.driftY],
                    rotate: [0, confetti.rotate * 0.6, confetti.rotate * 1.2],
                  }}
                  exit={{ opacity: 0, scale: 0.3, x: confetti.x * 1.1, y: confetti.y * 1.1 }}
                  transition={{
                    duration: confetti.duration,
                    ease: 'easeOut',
                    delay: confetti.delay,
                    repeat: Infinity,
                    repeatType: 'mirror',
                  }}
                  style={{
                    width: confetti.size,
                    height: confetti.size,
                    backgroundColor: confetti.color,
                    borderRadius: confetti.shape === 'circle' ? '9999px' : confetti.shape === 'square' ? '4px' : undefined,
                    clipPath:
                      confetti.shape === 'triangle'
                        ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                        : undefined,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default TipButton;

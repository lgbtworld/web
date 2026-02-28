import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Calendar, Heart, X, ChevronLeft, ChevronRight, ChevronDown, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api.tsx';
import { useTranslation } from 'react-i18next';
import { applicationName, RECAPTCHA_SITE_KEY } from '../appSettings';
import ReCAPTCHA from 'react-google-recaptcha';

interface AuthWizardProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'inline';
}

const AuthWizard: React.FC<AuthWizardProps> = ({ isOpen, onClose, mode = 'modal' }): React.ReactElement | null => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { data: _data, defaultLanguage: _defaultLanguage } = useApp();
  const { t } = useTranslation('common');

  // Track notification permission
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);


  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        console.log('Permission result:', perm);
      } else {
        setNotificationPermission(Notification.permission);
        console.log('Existing permission:', Notification.permission);
      }
    }
  };


  const [formData, setFormData] = useState<{
    name: string;
    nickname: string;
    password: string;
    confirmPassword: string;
    birthDate: string;
    day: string;
    month: string;
    year: string;
    referralCode: string;
  }>({
    name: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    day: '',
    month: '',
    year: '',
    referralCode: typeof window !== 'undefined' ? localStorage.getItem('referralCode') || '' : ''
  });

  // Date picker state
  const [selectedDate, setSelectedDate] = useState({
    day: 0,
    month: 0,
    year: 0
  });

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear() - 25);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const [decadeStart, setDecadeStart] = useState(Math.floor((new Date().getFullYear() - 25) / 20) * 20);
  const months = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december')
  ];

  const steps = [
    {
      id: 'auth-mode',
      title: t('auth.welcome_title', { appName: applicationName }),
      subtitle: t('auth.welcome_subtitle'),
      icon: Heart,
      field: 'authMode',
      placeholder: '',
      type: 'auth-mode'
    },
    {
      id: 'login-form',
      title: t('auth.sign_in'),
      subtitle: t('auth.sign_in_subtitle'),
      icon: User,
      field: 'loginForm',
      placeholder: '',
      type: 'login-form'
    },
    {
      id: 'nickname',
      title: t('auth.create_account'),
      subtitle: t('auth.welcome_subtitle'),
      icon: User,
      field: 'nickname',
      placeholder: 'nickname',
      type: 'text'
    },
    {
      id: 'captcha',
      title: t('auth.verify_human', { defaultValue: 'Verify you are human' }),
      subtitle: t('auth.verify_human_subtitle', { defaultValue: 'Please complete the security check' }),
      icon: Shield,
      field: 'captcha',
      placeholder: '',
      type: 'captcha'
    },

  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate({ day, month: currentMonth + 1, year: currentYear });
    updateFormData('day', day.toString());
    updateFormData('month', (currentMonth + 1).toString());
    updateFormData('year', currentYear.toString());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: React.ReactNode[] = [];
    const today = new Date();
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10 sm:w-10 sm:h-10" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.day === day &&
        selectedDate.month === currentMonth + 1 &&
        selectedDate.year === currentYear;
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      days.push(
        <motion.button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`relative w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-sm font-medium transition-all
            ${isSelected
              ? (theme === 'dark'
                ? 'bg-white text-gray-900 ring-2 sm:ring-2 ring-black/50'
                : 'bg-gray-900 text-white ring-2 sm:ring-2 ring-black/50')
              : (theme === 'dark'
                ? 'text-white hover:bg-gray-700'
                : 'text-gray-900 hover:bg-gray-100')
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative justify-center flex flex-col items-center w-full h-full">
            <span>{day}</span>
            {isToday && (
              <span
                className={`mt-0.5 w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-black/80' : 'bg-black/80'
                  }`}
              />
            )}
          </span>
        </motion.button>
      );
    }
    return days;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (authMode === 'login') {
        setCurrentStep(1); // login-form
      } else {
        setCurrentStep(2); // nickname (register için)
      }
    } else if (currentStep === 1 && authMode === 'login') {
      setIsLoading(true);
      setError('');
      const loginData: any = {
        nickname: formData.nickname,
        password: formData.password
      };

      api.handleLogin(loginData)
        .then(response => {
          login(response.data.token, response.data.user);
          onClose();
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Login failed. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (currentStep === 2 && authMode === 'register') {
      setCurrentStep(3); // captcha step
    } else if (currentStep === 3 && authMode === 'register') {
      if (!recaptchaToken) {
        setError(t('auth.captcha_required', { defaultValue: 'Please complete the reCAPTCHA verification' }));
        return;
      }

      const user = {
        name: formData.nickname,
        nickname: formData.nickname,
        password: formData.password,
        referralCode: formData.referralCode,
        recaptchaToken: recaptchaToken,
        domain: "coolvibes.lgbt",
      };

      setIsLoading(true);
      setError('');
      api.handleRegister(user)
        .then(response => {
          login(response.token, response.user);
          onClose();
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Registration failed. Please try again.');
          // Reset captcha on error
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
          }
          setRecaptchaToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // If on auth-mode step, close wizard
      onClose();
    } else {
      // Clear error when going back
      setError('');

      // Handle register flow
      if (authMode === 'register' && currentStep === 2) {
        setCurrentStep(0); // Go back to auth-mode
      } else if (authMode === 'register' && currentStep === 3) {
        setCurrentStep(2); // Go back to nickname
        // Reset captcha when going back
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
      } else if (authMode === 'login' && currentStep === 1) {
        setCurrentStep(0); // Go back to auth-mode
      } else {
        // Otherwise go to previous step
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const updateFormData = <T extends keyof typeof formData>(field: T, value: typeof formData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNicknameChange = (nickname: string) => {
    const normalized = nickname.toLowerCase().replace(/\s+/g, '');
    updateFormData('nickname', normalized);
  };

  const currentStepData = steps[currentStep];

  // Progress bar mapping
  const getTotalSteps = () => {
    if (authMode === 'login') {
      return 2; // auth-mode, login-form
    } else if (authMode === 'register') {
      return 3; // auth-mode, nickname, captcha
    }
    return steps.length;
  };

  const getCurrentStepIndex = () => {
    if (authMode === 'login') {
      if (currentStep === 0) return 0; // auth-mode
      if (currentStep === 1) return 1; // login-form
    } else if (authMode === 'register') {
      if (currentStep === 0) return 0; // auth-mode
      if (currentStep === 2) return 1; // nickname
      if (currentStep === 3) return 2; // captcha
    }
    return currentStep;
  };

  const canProceed = () => {
    switch (currentStepData.field) {
      case 'authMode':
        return authMode !== null;
      case 'loginForm':
        return formData.nickname.trim() !== '' && formData.password.trim() !== '';
      case 'nickname':
        return formData.nickname.trim() !== '' &&
          formData.password.trim() !== '' &&
          formData.confirmPassword.trim() !== '' &&
          formData.password === formData.confirmPassword;
      case 'captcha':
        return !!recaptchaToken;
      default:
        return false;
    }
  };

  const renderFormField = () => {
    switch (currentStepData.type) {
      case 'auth-mode':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <motion.button
                onClick={() => setAuthMode('login')}
                className={`p-4 sm:p-6 rounded-2xl border-2 text-center transition-all w-full ${authMode === 'login'
                  ? theme === 'dark'
                    ? 'bg-white text-gray-900 border-white shadow-md'
                    : 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600'
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('auth.have_account')}</h3>
                <p className="text-xs sm:text-sm opacity-80">{t('auth.sign_in_subtitle')}</p>
              </motion.button>

              <motion.button
                onClick={() => setAuthMode('register')}
                className={`p-4 sm:p-6 rounded-2xl border-2 text-center transition-all w-full ${authMode === 'register'
                  ? theme === 'dark'
                    ? 'bg-white text-gray-900 border-white shadow-md'
                    : 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600'
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('auth.create_account')}</h3>
                <p className="text-xs sm:text-sm opacity-80">{t('auth.create_account_subtitle')}</p>
              </motion.button>
            </div>
          </div>
        );

      case 'login-form':
        return (
          <div className="space-y-2 sm:space-y-4">
            <div>
              <label className={`block text-sm sm:text-sm font-medium mb-2 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.nickname')}
              </label>
              <input
                type="text"
                placeholder={t('auth.placeholder_nickname')}
                value={formData.nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                className={`w-full px-4 sm:px-4 py-4 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-base sm:text-base ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-900'
                  }`}
                autoFocus
              />
            </div>
            <div>
              <label className={`block text-sm sm:text-sm font-medium mb-2 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                placeholder={t('auth.placeholder_password')}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className={`w-full px-4 sm:px-4 py-4 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-base sm:text-base ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-900'
                  }`}
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2 sm:space-y-4">
            <div>
              <label className={`block text-sm sm:text-sm font-medium mb-2 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.nickname')}
              </label>
              <input
                type="text"
                placeholder={t('auth.placeholder_nickname')}
                value={formData.nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                className={`w-full px-4 sm:px-4 py-4 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-base sm:text-base ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-900'
                  }`}
                autoFocus
              />
            </div>
            <div>
              <label className={`block text-sm sm:text-sm font-medium mb-2 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                placeholder={t('auth.placeholder_password')}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className={`w-full px-4 sm:px-4 py-4 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-base sm:text-base ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-900'
                  }`}
              />
            </div>
            <div>
              <label className={`block text-sm sm:text-sm font-medium mb-2 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.confirm_password')}
              </label>
              <input
                type="password"
                placeholder={t('auth.placeholder_confirm_password')}
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                className={`w-full px-4 sm:px-4 py-4 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-base sm:text-base ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-900'
                  }`}
              />
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  {t('auth.passwords_not_match')}
                </p>
              )}
              {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  {t('auth.passwords_match')}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm sm:text-sm font-medium mb-2 sm:mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('auth.referral_code', { defaultValue: 'Referral Code (Optional)' })}
              </label>
              <input
                type="text"
                placeholder={t('auth.placeholder_referral_code', { defaultValue: 'Enter referral code' })}
                value={formData.referralCode}
                onChange={(e) => updateFormData('referralCode', e.target.value)}
                className={`w-full px-4 sm:px-4 py-4 sm:py-4 rounded-xl sm:rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all text-base sm:text-base ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-900'
                  }`}
              />
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {t('auth.referral_hint', { defaultValue: 'Earn 50 LGBT tokens if you have an invite code.' })}
              </p>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t('auth.current_status')}: {notificationPermission ?? 'unknown'}</p>
            </div>
            <motion.button
              onClick={() => {
                requestNotificationPermission()
              }}
              className={`w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${theme === 'dark'
                ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                : 'bg-yellow-500 text-black hover:bg-yellow-600'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('auth.enable_notifications')}
            </motion.button>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t('auth.change_later')}</p>
          </div>
        );
      case 'captcha':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                <Shield className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('auth.captcha_instructions', { defaultValue: 'Please verify that you are not a robot' })}
              </p>
            </div>
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => {
                  setRecaptchaToken(token);
                  setError(''); // Clear error when captcha is completed
                }}
                onExpired={() => {
                  setRecaptchaToken(null);
                }}
                onError={() => {
                  setRecaptchaToken(null);
                  setError(t('auth.captcha_error', { defaultValue: 'reCAPTCHA verification failed. Please try again.' }));
                }}
                theme={theme === 'dark' ? 'dark' : 'light'}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      {/* Header - Only show in modal mode */}
      {mode === 'modal' && (
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-800">
          {/* Progress Bar */}
          <div className="flex-1 flex space-x-1 sm:space-x-2 mr-3 sm:mr-6">
            {Array.from({ length: getTotalSteps() }, (_, index) => (
              <div
                key={index}
                className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 ${index <= getCurrentStepIndex()
                  ? theme === 'dark' ? 'bg-white shadow-sm' : 'bg-gray-900 shadow-sm'
                  : theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>

          {/* X Button */}
          <button
            onClick={onClose}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${theme === 'dark'
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center px-4 sm:px-8 py-2 sm:py-6"
      >
        <div className={`w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-6 rounded-xl sm:rounded-2xl flex items-center justify-center ${theme === 'dark'
          ? 'bg-gray-800'
          : 'bg-gray-100'
          }`}>
          <currentStepData.icon className={`w-5 h-5 sm:w-8 sm:h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} />
        </div>
        <h2 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
          {currentStepData.title}
        </h2>
        <p className={`text-xs sm:text-base leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
          {currentStepData.subtitle}
        </p>
      </motion.div>

      {/* Form */}
      <div className="px-4 sm:px-8 pb-20 sm:pb-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3 sm:mb-8"
        >
          {renderFormField()}
        </motion.div>

        {/* Error Message - Show for all steps if error exists */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-6 p-4 rounded-2xl border ${theme === 'dark'
              ? 'bg-red-900/20 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
              }`}
          >
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-row flex-nowrap gap-2 sm:gap-4 items-stretch">
          {currentStep > 0 ? (
            <motion.button
              onClick={handleBack}
              className={`flex-shrink-0 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-base transition-all duration-200 whitespace-nowrap ${theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 mr-2 sm:mr-2" />
              <span>{t('auth.back')}</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={onClose}
              className={`flex-shrink-0 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-base transition-all duration-200 whitespace-nowrap ${theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5 mr-2 sm:mr-2" />
              <span>{t('auth.back')}</span>
            </motion.button>
          )}

          <motion.button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className={`flex-1 flex items-center justify-center px-4 sm:px-8 py-4 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 min-w-0 ${canProceed() && !isLoading
              ? theme === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-white/25'
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-gray-900/25'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            whileHover={canProceed() && !isLoading ? { scale: 1.02 } : {}}
            whileTap={canProceed() && !isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2`} />
                <span className="text-sm sm:text-base">{authMode === 'login' ? t('auth.signing_in') : t('auth.creating_account')}</span>
              </div>
            ) : (
              <>
                <span className="text-base sm:text-base whitespace-nowrap">{currentStep === (authMode === 'login' ? 1 : 3) ? (authMode === 'login' ? t('auth.sign_in') : t('auth.complete_registration')) : t('auth.continue')}</span>
                <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 ml-2 flex-shrink-0" />
              </>
            )}
          </motion.button>

        </div>
      </div>
    </>
  );

  if (mode === 'inline') {
    return (
      <div className={`w-full rounded-3xl overflow-hidden ${theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-white'
        }`}>
        {content}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border ${theme === 'dark'
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
            }`}
        >
          {content}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthWizard;

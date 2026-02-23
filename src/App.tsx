import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './components/Footer';
import MatchScreen from './components/MatchScreen';
import NearbyScreen from './components/NearbyScreen';
import ProfileScreen from './components/ProfileScreen';
import ProfileEngagementsScreen from './components/ProfileEngagementsScreen';
import SearchScreen from './components/SearchScreen';
import MessagesScreen from './components/MessagesScreen';
import NotificationsScreen from './components/NotificationsScreen';
import SplashScreen from './components/SplashScreen';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext.tsx';
import { useSettings } from './contexts/SettingsContext';
import AuthWizard from './components/AuthWizard';
import { Search, MapPin, Heart, MessageCircle, User, Menu, X, Sun, Moon, Languages, MoreHorizontal, Bell, ChevronRight, LogOut, HandFist, TrendingUp, Filter, ArrowUpRight, Building2, Wallet } from 'lucide-react';
import TrendsPanel, { NormalizedTrend } from './components/TrendsPanel';
import PopularUsersPanel from './components/PopularUsersPanel';
import PlacesScreen from './components/PlacesScreen';
import HomeScreen from './components/HomeScreen';
import LanguageSelector from './components/LanguageSelector.tsx';
import ClassifiedsScreen from './components/ClassifiedsScreen';
import './i18n';
import { useTranslation } from 'react-i18next';
import { applicationName } from './appSettings.tsx';
import LandingPage from './components/LandingPage.tsx';
import { getSafeImageURL, getSafeImageURLEx } from './helpers/helpers.tsx';
import TestPage from './components/TestPage.tsx';
import PwaInstallPrompt, { PwaInstallProvider, usePwaInstall } from './components/PwaInstallPrompt';
import PremiumScreen from './components/PremiumScreen.tsx';
import PostDetails from './components/PostDetails.tsx';
import WalletScreen from './components/WalletScreen.tsx';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState('pride');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthWizardOpen, setIsAuthWizardOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { showBottomBar, setShowBottomBar } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const { canInstall } = usePwaInstall();
  const previousCanInstallRef = React.useRef(false);
  const showSidebarInstallCard = canInstall && !showInstallBanner;
  const handleBannerDismiss = React.useCallback(() => {
    setShowInstallBanner(false);
  }, []);
  const languageDisplay = React.useMemo(() => {
    const lang = i18n?.language || 'en';
    const base = lang.split('-')[0] || lang;
    return base.toUpperCase();
  }, [i18n?.language]);

  // Update activeScreen based on current URL
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/pride') {
      setActiveScreen('pride');
    } else if (path === '/search') {
      setActiveScreen('search');
    } else if (path === '/nearby') {
      setActiveScreen('nearby');
    } else if (path === '/match') {
      setActiveScreen('match');
    } else if (path === '/messages') {
      setActiveScreen('messages');
      // Don't set bottom bar here - MessagesScreen manages it based on selectedChat
    } else if (path === '/notifications') {
      setActiveScreen('notifications');
    } else if (path === '/places') {
      setActiveScreen('places');
          } else if (path === '/wallet') {
      setActiveScreen('wallet');
    } else if (path === '/classifieds') {
      setActiveScreen('classifieds');
    } else if (path.startsWith('/') && path.split('/').length === 2) {
      // Profile route like /username
      setActiveScreen('profile');
    }

    // Hide bottom bar on post detail screen (/:username/status/:postId)
    if (path.includes('/status/')) {
      setShowBottomBar(false);
    }
    // Show bottom bar if not on messages screen
    // Note: MessagesScreen manages its own bottom bar visibility based on selectedChat
    // Only set bottom bar for other screens, not for /messages
    else if (path !== '/messages') {
      setShowBottomBar(true);
    }
    // For /messages, MessagesScreen will handle bottom bar visibility internally
  }, [location.pathname, setShowBottomBar]);

  React.useEffect(() => {
    if (canInstall && !previousCanInstallRef.current) {
      setShowInstallBanner(true);
    }

    if (!canInstall) {
      setShowInstallBanner(false);
    }

    previousCanInstallRef.current = canInstall;
  }, [canInstall]);

  const sidebarNavItems = React.useMemo(() => [
    {
      id: 'pride',
      label: 'Pride',
      path: '/',
      icon: HandFist,
      accent: 'from-rose-500/90 via-fuchsia-500/80 to-purple-500/70',
      helper: t('app.nav.discover', 'Trending')
    },
    {
      id: 'nearby',
      label: t('app.nav.nearby'),
      path: '/nearby',
      icon: MapPin,
      accent: 'from-amber-400/80 to-orange-500/80',
      helper: t('app.nav.nearby_helper', 'IRL vibes')
    },
    {
      id: 'match',
      label: t('app.nav.matches'),
      path: '/match',
      icon: Heart,
      accent: 'from-rose-400/80 to-red-500/80',
      helper: t('app.nav.matches_helper', 'Curated pairs')
    },
    {
      id: 'messages',
      label: t('app.nav.messages'),
      path: '/messages',
      icon: MessageCircle,
      accent: 'from-sky-400/80 to-indigo-500/80',
      helper: t('app.nav.messages_helper', 'Keep chatting')
    },
    {
      id: 'notifications',
      label: t('app.nav.notifications'),
      path: '/notifications',
      icon: Bell,
      accent: 'from-emerald-400/80 to-teal-500/80',
      helper: t('app.nav.notifications_helper', 'Fresh alerts')
    },
    {
      id: 'wallet',
      label: t('wallet.title'),
      path: '/wallet',
      icon: Wallet,
      accent: 'from-cyan-400/80 to-blue-500/80',
      helper: t('wallet.sidebar_helper', 'Boost status')
    },
    {
      id: 'profile',
      label: t('app.nav.profile'),
      path: `/${user?.username || 'profile'}`,
      icon: User,
      accent: 'from-gray-900/80 to-gray-700/80',
      helper: t('app.nav.profile_helper', 'View identity')
    }
  ], [t, user?.username]);

  const sidebarNavSections = React.useMemo(() => {
    const primaryOrder = ['pride', 'nearby', 'match', 'messages'];
    const secondaryOrder = ['notifications', 'wallet', 'profile'];

    const sortByOrder = (ids: string[]) =>
      ids
        .map((id) => sidebarNavItems.find((item) => item.id === id))
        .filter(Boolean) as typeof sidebarNavItems;

    return [
      {
        id: 'primary',
        title: t('app.sidebar.primary', 'Discover'),
        items: sortByOrder(primaryOrder)
      },
      {
        id: 'secondary',
        title: t('app.sidebar.secondary', 'Manage'),
        items: sortByOrder(secondaryOrder)
      }
    ];
  }, [sidebarNavItems, t]);

  const orderedSidebarNavItems = React.useMemo(
    () => sidebarNavSections.flatMap((section) => section.items),
    [sidebarNavSections]
  );

  const sidebarGridItems = React.useMemo(() => orderedSidebarNavItems, [orderedSidebarNavItems]);

  const mobileNavItems = [
    { id: 'pride', label: "Pride", icon: "/icons/pride.webp" },
    // { id: 'search', label: t('app.nav.search'), icon: Search },
    { id: 'nearby', label: t('app.nav.nearby'), icon: "/icons/nearby.webp" },
    { id: 'match', label: t('app.nav.match'), icon: "/icons/matches.webp" },
   //  { id: 'places', label: t('app.nav.places'), icon: Building2 },
    { id: 'messages', label: t('app.nav.messages'), icon: "/icons/chat.webp" },
    //{ id: 'notifications', label: t('app.nav.notifications'), icon: Bell },
    //{ id: 'classifieds', label: t('app.nav.classifieds'), icon: FileText },
    { id: 'profile', label: t('app.nav.profile'), icon: "/icons/profile.webp" },
  ];

  const handleTrendSelect = React.useCallback((trend: NormalizedTrend) => {
    if (trend?.url) {
      window.open(trend.url, '_blank', 'noopener,noreferrer');
      return;
    }

    const query = trend?.query || trend?.label;
    if (query && query.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  }, [navigate]);



  return (
    <div className={`w-screen dark:bg-gray-950 bg-white h-screen select-none`}>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Twitter Style Layout - 3 Columns */}
      {!showSplash && (
        <div className={`max-h-[100dvh] w-full  flex mx-auto  max-w-7xl min-h-[100dvh] overflow-y-hidden overflow-x-hidden scrollbar-hide `}>

          {/* Mobile Header - Top Navigation */}
          <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-950 backdrop-blur-xl border-b border-gray-800/50' : 'bg-white/95 backdrop-blur-xl border-b border-gray-100/50'}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
              >
                <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
              </button>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark'
                  ? 'bg-gradient-to-br from-white to-gray-300 text-black'
                  : 'bg-gradient-to-br from-black to-gray-700 text-white'
                  }`}>
                  <span className="text-sm font-bold">C</span>
                </div>
                <h1 className={`text-lg font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {applicationName}
                </h1>
              </div>
              <button
                onClick={() => setIsAuthWizardOpen(true)}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
              >
                <User className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
              </button>
            </div>
          </header>

          {/* Left Sidebar - Fixed */}
          <aside className={`hidden    scrollbar-hide lg:flex flex-col w-[280px]`}>
            <div className="p-4 sticky top-0 h-screen overflow-y-auto scrollbar-hide flex flex-col">
              {/* Logo */}
              <div className="flex items-center justify-center mb-4 pt-2">
                <button className="flex items-center space-x-3 p-3 rounded-full hover:bg-opacity-10 transition-colors group">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${theme === 'dark'
                    ? 'bg-gradient-to-br from-white to-gray-300 text-black'
                    : 'bg-gradient-to-br from-black to-gray-700 text-white'
                    }`}>
                    <span className="text-xl font-bold">C</span>
                  </div>
                  <h1 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {applicationName}
                  </h1>
                </button>
              </div>

              <div className="flex flex-col gap-5 flex-1">
                {isAuthenticated ? (
                  <div className={`rounded-[22px] border px-4 py-4 ${theme === 'dark'
                      ? 'border-white/10 bg-white/[0.02]'
                      : 'border-black/[0.08] bg-white'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-[16px] overflow-hidden ring-2 ${theme === 'dark' ? 'ring-white/10' : 'ring-black/10'}`}>
                          <img
                            src={getSafeImageURLEx((user as any)?.public_id,(user as any)?.avatar, "icon") || undefined}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ${theme === 'dark' ? 'ring-black' : 'ring-white'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user?.displayname || user?.username || 'User'}
                        </p>
                        <p className={`text-xs text-gray-500 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          @{user?.username || 'username'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileMenuOpen(!isProfileMenuOpen);
                        }}
                        className={`p-2 rounded-xl transition ${theme === 'dark'
                            ? 'text-white/70 hover:bg-white/10'
                            : 'text-gray-600 hover:bg-gray-100'
                          } ${isProfileMenuOpen ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900') : ''}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute bottom-full left-0 right-0 mb-3 rounded-2xl overflow-hidden border ${theme === 'dark'
                                ? 'bg-gray-900 border-gray-800'
                                : 'bg-white border-gray-200 shadow-lg'
                              }`}
                          >
                            <button
                              onClick={() => {
                                navigate(`/${user?.username || 'profile'}`);
                                setIsProfileMenuOpen(false);
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-3 text-left ${theme === 'dark'
                                  ? 'text-white hover:bg-white/10'
                                  : 'text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                              <User className="w-4 h-4" />
                              <span className="text-sm font-semibold">{t('app.nav.profile')}</span>
                            </button>
                            <div className={`h-px ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            <button
                              onClick={() => {
                                if (window.confirm(t('app.logout_confirmation'))) {
                                  logout();
                                  navigate('/');
                                  setIsProfileMenuOpen(false);
                                }
                              }}
                              className={`w-full px-4 py-3 flex items-center gap-3 text-left ${theme === 'dark'
                                  ? 'text-red-400 hover:bg-red-500/10'
                                  : 'text-red-600 hover:bg-red-50'
                                }`}
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm font-semibold">{t('app.logout')}</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/${user?.username || 'profile'}`)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold ${theme === 'dark'
                            ? 'bg-white text-black'
                            : 'bg-gray-900 text-white'
                          }`}
                      >
                        {t('app.view_profile', 'Profile')}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('app.logout_confirmation'))) {
                            logout();
                            navigate('/');
                          }
                        }}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold ${theme === 'dark'
                            ? 'bg-white/5 text-white hover:bg-white/10'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                      >
                        {t('app.logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-[24px] border px-4 py-4 ${theme === 'dark'
                      ? 'bg-white/[0.02] border-white/10'
                      : 'bg-white border-black/[0.06]'
                    }`}>
                    <p className="text-xs uppercase tracking-[0.3em] opacity-60">
                      {t('app.join_title', 'Welcome')}
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {t('app.join_subtitle', 'Create your profile')}
                    </p>
                    <button
                      onClick={() => setIsAuthWizardOpen(true)}
                      className={`mt-4 w-full px-4 py-3 rounded-2xl font-semibold transition-all ${theme === 'dark'
                          ? 'bg-white text-black hover:bg-white/90'
                          : 'bg-black text-white hover:bg-black/90'
                        }`}
                    >
                      {t('app.join_now')}
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1">
                  <div className="grid grid-cols-2 gap-1.5">
                    {sidebarGridItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeScreen === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => navigate(item.path || '/')}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className={`relative rounded-2xl px-2.5 py-2 min-h-[88px] flex flex-col justify-between border ${theme === 'dark'
                              ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                              : 'border-black/[0.05] bg-white hover:shadow-sm'
                            } ${isActive ? (theme === 'dark' ? 'ring-1 ring-white/40' : 'ring-1 ring-black/20 shadow') : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.accent} text-white shadow-lg shadow-black/15`}>
                              <Icon className="w-[15px] h-[15px]" />
                            </div>
                            <ArrowUpRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.label}
                            </p>
                          </div>
                          {isActive && (
                            <div
                              className="absolute inset-0 rounded-2xl pointer-events-none"
                              style={{
                                background: theme === 'dark'
                                  ? 'linear-gradient(140deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
                                  : 'linear-gradient(140deg, rgba(0,0,0,0.04), rgba(0,0,0,0))'
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </nav>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${theme === 'dark'
                        ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white'
                        : 'border-black/[0.06] bg-white hover:shadow-sm text-gray-900'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4 text-amber-300" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-500" />
                        )}
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] opacity-70">
                            {t('app.theme', 'Theme')}
                          </p>
                          <p className="text-sm font-semibold">
                            {theme === 'dark' ? t('app.light_mode') : t('app.dark_mode')}
                          </p>
                        </div>
                      </div>
                      <div className={`w-11 h-5 rounded-full flex items-center px-1 ${theme === 'dark' ? 'bg-white/15' : 'bg-black/10'}`}>
                        <span
                          aria-hidden="true"
                          className={`block h-4 w-4 rounded-full transition-transform duration-200 ease-out ${theme === 'dark'
                              ? 'translate-x-[1.25rem] bg-white'
                              : 'translate-x-0 bg-black'
                            }`}
                        />
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => setIsLanguageSelectorOpen(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${theme === 'dark'
                        ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white'
                        : 'border-black/[0.06] bg-white hover:shadow-sm text-gray-900'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] opacity-70">
                          {t('app.language')}
                        </p>
                        <p className="text-sm font-semibold">{languageDisplay}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`} />
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </aside>


          {/* Middle Section - Scrollable */}
          <main className={`max-h-[100dvh]  min-h-[100dvh] overflow-y-hidden overflow-x-hidden scrollbar-hide flex-1 min-w-0 lg:border-l lg:border-r  ${theme === 'dark' ? 'lg:border-gray-900/70' : 'lg:border-gray-100'} pt-[56px] lg:pt-0  lg:pb-0`}>
            {!isAuthenticated ? (
              /* Show AuthWizard in inline mode when not authenticated */
              <div className={`h-full w-full flex items-start lg:items-center justify-center overflow-y-auto ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
                <div className="w-full max-w-lg px-0 lg:px-4 py-4 lg:py-0">
                  <AuthWizard
                    isOpen={true}
                    onClose={() => {
                      // Prevent closing - user must authenticate
                    }}
                    mode="inline"
                  />
                </div>
              </div>
            ) : (
              <Routes>
                {/* Home Routes */}
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/" element={<HomeScreen />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/pride" element={<HomeScreen />} />
                <Route path="/testpage" element={<TestPage />} />
                <Route path="/premium" element={<PremiumScreen />} />
                <Route path="/wallet" element={<WalletScreen />} />

                <Route
                  path="/:username/:engagementType"
                  element={<ProfileEngagementsScreen />}
                />
                <Route path="/:username/status/:postId" element={<PostDetails />} />
                <Route path="/status/:postId" element={<PostDetails />} />
                <Route path="/:username" element={<ProfileScreen />} />
                {/* Other Routes */}
                <Route path="/search" element={<SearchScreen />} />
                <Route path="/match" element={<MatchScreen />} />
                <Route path="/nearby" element={<NearbyScreen />} />
                <Route path="/places" element={<PlacesScreen />} />
                <Route path="/wallet" element={<WalletScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />

                <Route path="/messages" element={<MessagesScreen />} />
                <Route path="/notifications" element={<NotificationsScreen />} />
                <Route path="/classifieds" element={<ClassifiedsScreen />} />

                {/* Fallback */}
                <Route path="*" element={<HomeScreen />} />
              </Routes>
            )}
          </main>

          {/* Right Sidebar - Fixed */}
          {/* Hide right sidebar on messages and notifications routes for better UX */}
          {location.pathname !== '/messages' && location.pathname !== '/landing' && location.pathname !== '/classifieds' && location.pathname !== '/places' && location.pathname !== '/match' && location.pathname !== '/nearby' && (
            <aside className={`hidden xl:flex scrollbar-hide flex-col w-[380px]`}>
              <div className="p-5 sticky top-0 h-screen scrollbar-hide overflow-y-auto space-y-4">
                {showSidebarInstallCard && (
                  <PwaInstallPrompt variant="card" />
                )}
              

                <PopularUsersPanel limit={12} />

                <TrendsPanel limit={20} onTrendSelect={handleTrendSelect} />
 

              </div>
            </aside>
          )}

          {/* Clean Professional Bottom Bar */}
          {showBottomBar && (
            <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 ${theme === 'dark'
                ? 'bg-gray-950 border-t border-gray-900'
                : 'bg-white/95 border-t border-black/[0.08]'
              } backdrop-blur-xl safe-area-inset-bottom`}>
              <div className="flex items-center justify-around px-4 py-3">
                {[
                  { id: 'pride', icon: "/icons/pride.webp", label: "Pride" },
                  { id: 'nearby', icon: "/icons/nearby.webp", label: t('app.nav.nearby') },
                  { id: 'match', icon: "/icons/matches.webp", label: t('app.nav.match') },
                  { id: 'messages', icon: "/icons/chat.webp", label: t('app.nav.messages') },
                  { id: 'profile', icon: "/icons/profile.webp", label: t('app.nav.profile') },
                ].map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'pride') {
                          navigate('/');
                        } else if (item.id === 'pride') {
                          navigate(`/pride'}`);
                        }
                        else if (item.id === 'profile') {
                          navigate(`/${user?.username || 'profile'}`);
                        } else {
                          navigate(`/${item.id}`);
                        }
                      }}
                      className="relative flex flex-col items-center justify-center flex-1 py-2 px-1 min-w-0"
                    >
                      {/* Active Background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavBg"
                          style={{
                            zIndex: -1,
                          }}
                          className={`absolute inset-0 rounded-2xl ${theme === 'dark'
                              ? 'bg-gray-50/[0.08]'
                              : 'bg-gray-950/[0.06]'
                            }`}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      <img className='w-8 h-8' src={item.icon} />

                      {/* Label */}
                      <span
                        className={`relative z-10 text-[10px] font-medium tracking-tight mt-1 transition-all duration-200 `}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Premium Mobile Menu - Enhanced Design */}
          <AnimatePresence
            mode="wait"
            onExitComplete={() => {
              document.body.style.overflow = '';
            }}
          >
            {isMobileMenuOpen && (
              <>
                {/* Backdrop with Blur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`fixed inset-0 z-[100] backdrop-blur-md ${theme === 'dark' ? 'bg-black/60' : 'bg-black/40'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ willChange: 'opacity' }}
                />

                {/* Mobile Menu Panel - Premium Design */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                    mass: 0.7
                  }}
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                  className={`fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] z-[101] ${theme === 'dark'
                      ? 'bg-gradient-to-br from-gray-900/98 to-black/98 backdrop-blur-2xl border-r border-white/[0.08]'
                      : 'bg-gradient-to-br from-white via-gray-50 to-white backdrop-blur-2xl border-r border-black/[0.08]'
                    } flex flex-col shadow-2xl`}
                  onAnimationStart={() => {
                    if (isMobileMenuOpen) {
                      document.body.style.overflow = 'hidden';
                    }
                  }}
                >
                  {/* Close Button - Floating */}
                  <motion.button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${theme === 'dark'
                        ? 'bg-white/[0.08] hover:bg-white/[0.15] text-white'
                        : 'bg-black/[0.08] hover:bg-black/[0.15] text-black'
                      }`}
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{ willChange: 'transform' }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  {/* Profile Section - Enhanced */}
                  <div className={`relative px-6 py-8 ${theme === 'dark' ? 'border-b border-white/[0.08]' : 'border-b border-black/[0.08]'
                    }`}>
                    <motion.div
                      className="flex items-center space-x-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {/* Avatar with Gradient Ring */}
                      <div className="relative">
                        <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${theme === 'dark'
                            ? 'from-white/20 to-white/5'
                            : 'from-black/20 to-black/5'
                          } blur-sm`} />
                        <div className="relative">
                          <img
                            src={getSafeImageURLEx((user as any)?.public_id,(user as any)?.avatar, "icon") || undefined}
                            alt="Profile"
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10"
                          />
                          {/* Online Status */}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 ${theme === 'dark' ? 'border-gray-900' : 'border-white'
                            }`} />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-[15px] font-bold tracking-[-0.011em] truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {user?.displayname || user?.username || t('app.guest_user')}
                        </h3>
                        <p className={`text-[13px] truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          @{user?.username || 'username'}
                        </p>
                        {/* Stats */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                            <span className={theme === 'dark' ? 'text-white' : 'text-black'}>{(user as any)?.engagements?.counts?.follower_count ? (user as any)?.engagements?.counts?.follower_count : "0"}</span> {t('app.following')}
                          </span>
                          <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            <span className={theme === 'dark' ? 'text-white' : 'text-black'}>
                            {(user as any)?.engagements?.counts?.following_count ? (user as any)?.engagements?.counts?.following_count : "0" }  
                            </span> {t('app.followers')}
                          </span>
                        </div>
                      </div>

                      {/* More Options Button */}
                      {isAuthenticated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileProfileMenuOpen(!isMobileProfileMenuOpen);
                          }}
                          className={`p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${theme === 'dark'
                              ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                              : 'hover:bg-black/10 text-gray-600 hover:text-black'
                            } ${isMobileProfileMenuOpen ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black') : ''}`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>

                    {/* Mobile Profile Dropdown Menu */}
                    {isAuthenticated && (
                      <AnimatePresence>
                        {isMobileProfileMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`mt-4 rounded-2xl overflow-hidden ${theme === 'dark'
                                ? 'bg-gray-900/50 border border-gray-800'
                                : 'bg-white/50 border border-gray-200'
                              }`}
                          >
                            <button
                              onClick={() => {
                                navigate(`/${user?.username || 'profile'}`);
                                setIsMobileProfileMenuOpen(false);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full px-4 py-3.5 text-left flex items-center gap-3 transition-colors ${theme === 'dark'
                                  ? 'hover:bg-white/10 text-white'
                                  : 'hover:bg-black/5 text-gray-900'
                                }`}
                            >
                              <User className="w-5 h-5" />
                              <span className="font-semibold text-[15px]">{t('app.nav.profile')}</span>
                            </button>
                            <div className={`h-px ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            <button
                              onClick={() => {
                                if (window.confirm(t('app.logout_confirmation'))) {
                                  logout();
                                  navigate('/');
                                  setIsMobileProfileMenuOpen(false);
                                  setIsMobileMenuOpen(false);
                                }
                              }}
                              className={`w-full px-4 py-3.5 text-left flex items-center gap-3 transition-colors ${theme === 'dark'
                                  ? 'hover:bg-red-500/10 text-red-400'
                                  : 'hover:bg-red-50 text-red-600'
                                }`}
                            >
                              <LogOut className="w-5 h-5" />
                              <span className="font-semibold text-[15px]">{t('app.logout')}</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Navigation - Modern Grid Layout */}
                  <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
                    <div className="grid grid-cols-3 gap-3">
                      {mobileNavItems.map((item, index) => {
                        const isActive = activeScreen === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            className="relative"
                            onClick={() => {
                              if (item.id === 'pride') {
                                navigate('/');
                              } else if (item.id === 'profile') {
                                navigate(`/${user?.username || 'profile'}`);
                              } else {
                                navigate(`/${item.id}`);
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.15 + index * 0.04,
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1]
                            }}
                            whileTap={{ scale: 0.95 }}
                            style={{ willChange: 'transform, opacity' }}
                          >
                            {/* Card Container */}
                            <div className={`relative flex flex-col items-center justify-center p-4 rounded-[20px] transition-all duration-200 ${isActive
                                ? theme === 'dark'
                                  ? 'bg-white/[0.15]'
                                  : 'bg-black/[0.12]'
                                : theme === 'dark'
                                  ? 'bg-white/[0.06] hover:bg-white/[0.10]'
                                  : 'bg-black/[0.04] hover:bg-black/[0.08]'
                              }`}>
                              {/* Icon */}
                              <div className={`mb-2.5 ${isActive ? 'scale-110' : ''
                                } transition-transform duration-200`}>
                                {
                                  <img src={item.icon} />
                                }


                              </div>

                              {/* Label */}
                              <span className={`text-xs font-semibold tracking-tight text-center transition-colors duration-200 ${isActive
                                  ? theme === 'dark'
                                    ? 'text-white'
                                    : 'text-black'
                                  : theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-600'
                                }`}>
                                {item.label}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </nav>

                  {/* Footer - Enhanced */}
                  <div className={`px-4 py-4 border-t ${theme === 'dark' ? 'border-white/[0.08]' : 'border-black/[0.08]'
                    }`}>
                    <div className="space-y-2">
                      {/* Theme Toggle */}
                      <motion.button
                        onClick={toggleTheme}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] font-semibold text-[15px] tracking-[-0.011em] transition-all duration-200 ${theme === 'dark'
                            ? 'bg-white/[0.08] hover:bg-white/[0.12] text-white'
                            : 'bg-black/[0.08] hover:bg-black/[0.12] text-black'
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ willChange: 'transform' }}
                      >
                        <div className="flex items-center space-x-3">
                          {theme === 'dark' ? (
                            <Sun className="w-5 h-5" />
                          ) : (
                            <Moon className="w-5 h-5" />
                          )}
                          <span>{theme === 'dark' ? t('app.light_mode') : t('app.dark_mode')}</span>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
                          }`}>
                          <motion.div
                            className={`absolute top-0.5 w-5 h-5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'
                              }`}
                            animate={{ x: theme === 'dark' ? 22 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </motion.button>

                      {/* Language Selector */}
                      <motion.button
                        onClick={() => {
                          setIsLanguageSelectorOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] font-semibold text-[15px] tracking-[-0.011em] transition-all duration-200 ${theme === 'dark'
                            ? 'bg-white/[0.08] hover:bg-white/[0.12] text-white'
                            : 'bg-black/[0.08] hover:bg-black/[0.12] text-black'
                          }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ willChange: 'transform' }}
                      >
                        <div className="flex items-center space-x-3">
                          <Languages className="w-5 h-5" />
                          <span>{t('app.language')}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer - Only show on home screen */}
      {!showSplash && activeScreen === 'xxhome' && <Footer />}

      {/* Auth Wizard */}
      {!showSplash && (
        <AuthWizard
          isOpen={isAuthWizardOpen}
          onClose={() => setIsAuthWizardOpen(false)}
        />
      )}

      {showInstallBanner && (
        <PwaInstallPrompt
          variant="floating"
          position="bottom-right"
          onDismiss={handleBannerDismiss}
          onInstalled={handleBannerDismiss}
        />
      )}

      {/* LanguageSelector */}
      {!showSplash && (
        <LanguageSelector isOpen={isLanguageSelectorOpen} onClose={() => setIsLanguageSelectorOpen(false)} />
      )}

    </div>
  );
}

function App() {
  return (
    <PwaInstallProvider>
      <AppContent />
    </PwaInstallProvider>
  );
}

export default App;

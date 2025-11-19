import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  UserPlus, 
  UserMinus,
  Heart, 
  MessageCircle, 
  MoreVertical,
  Settings,
  CheckCheck,
  Gift,
  Sparkles,
  Eye,
  Users,
  AlertCircle
} from 'lucide-react';
import Container from './Container';
import { api } from '../services/api';
import { useAtom } from 'jotai';
import { globalState } from '../state/nearby';

interface Notification {
  id: string;
  sender_id: string;
  sender: {
    public_id: string;
    id: string;
    username: string;
    displayname: string;
    [key: string]: any;
  };
  user_id: string;
  type: string;
  title: string;
  message: string;
  payload: {
    title: string;
    body: string;
    [key: string]: any;
  };
  is_read: boolean;
  is_shown: boolean;
  created_at: string;
}

const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'messages' | 'matches' | 'likes' | 'follows' | 'gifts' | 'other'>('all');
  const [state, setState] = useAtom(globalState);
  const notifications: Notification[] = state.notifications || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_message':
        return MessageCircle;
      case 'new_match':
        return Heart;
      case 'profile_visit':
        return Eye;
      case 'friend_request':
        return UserPlus;
      case 'event_reminder':
        return Bell;
      case 'system_alert':
        return AlertCircle;
      case 'like':
        return Heart;
      case 'gift':
        return Gift;
      case 'follow':
        return UserPlus;
      case 'unfollow':
        return UserMinus;
      case 'super_like':
        return Sparkles;
      case 'message_read':
        return CheckCheck;
      case 'match_unmatch':
        return Users;
      default:
        return Bell;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const messageCount = notifications.filter(n => n.type === 'chat_message' || n.type === 'message_read').length;
  const matchCount = notifications.filter(n => n.type === 'new_match' || n.type === 'match_unmatch').length;
  const likeCount = notifications.filter(n => n.type === 'like' || n.type === 'super_like').length;
  const followCount = notifications.filter(n => n.type === 'follow' || n.type === 'unfollow').length;
  const giftCount = notifications.filter(n => n.type === 'gift').length;
  const otherCount = notifications.filter(n => 
    n.type === 'profile_visit' || 
    n.type === 'friend_request' || 
    n.type === 'event_reminder' || 
    n.type === 'system_alert'
  ).length;

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : activeTab === 'messages'
    ? notifications.filter(n => n.type === 'chat_message' || n.type === 'message_read')
    : activeTab === 'matches'
    ? notifications.filter(n => n.type === 'new_match' || n.type === 'match_unmatch')
    : activeTab === 'likes'
    ? notifications.filter(n => n.type === 'like' || n.type === 'super_like')
    : activeTab === 'follows'
    ? notifications.filter(n => n.type === 'follow' || n.type === 'unfollow')
    : activeTab === 'gifts'
    ? notifications.filter(n => n.type === 'gift')
    : notifications.filter(n => 
        n.type === 'profile_visit' || 
        n.type === 'friend_request' || 
        n.type === 'event_reminder' || 
        n.type === 'system_alert'
      );

  const formatTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return created.toLocaleDateString();
    }
  };



  const fetchNotifications = async(reset: boolean = false) => {
    const res = await api.checkNewNotifications(
      20,
      reset ? null : state.notificationNextCursor // ilerleme için kullanıyoruz
    );
    setState(prev => ({
      ...prev,
      notifications: reset 
        ? (res.notifications ?? [])
        : [
            ...prev.notifications,
            ...(res.notifications ?? [])
          ],
      notificationNextCursor: res.next_cursor,
      notificationPrevCursor: res.prev_cursor
    }));
  }

  useEffect(() => {
    fetchNotifications(true); // İlk yüklemede sıfırla
  }, []);

  return (
    <Container>
      {/* Header - Sticky */}
      <div className={`sticky top-0 z-50 border-b ${
        theme === 'dark' 
          ? 'border-gray-800/50 bg-black/95 backdrop-blur-xl' 
          : 'border-gray-100/50 bg-white/95 backdrop-blur-xl'
      }`}>
        <div className="w-full px-4 lg:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {unreadCount} unread
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-500 hover:text-gray-900'
                }`}
                title="Mark all as read"
              >
                <CheckCheck className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-500 hover:text-gray-900'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 -mb-px overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('all')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'all'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
              {activeTab === 'all' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'messages'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Messages
              {messageCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-black'
                }`}>
                  {messageCount}
                </span>
              )}
              {activeTab === 'messages' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'matches'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Matches
              {matchCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-black'
                }`}>
                  {matchCount}
                </span>
              )}
              {activeTab === 'matches' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'likes'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Likes
              {likeCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-black'
                }`}>
                  {likeCount}
                </span>
              )}
              {activeTab === 'likes' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('follows')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'follows'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Follows
              {followCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-black'
                }`}>
                  {followCount}
                </span>
              )}
              {activeTab === 'follows' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('gifts')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'gifts'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gifts
              {giftCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-black'
                }`}>
                  {giftCount}
                </span>
              )}
              {activeTab === 'gifts' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('other')}
              className={`relative px-4 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'other'
                  ? theme === 'dark'
                    ? 'text-white'
                    : 'text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Other
              {otherCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-black'
                }`}>
                  {otherCount}
                </span>
              )}
              {activeTab === 'other' && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    theme === 'dark' ? 'bg-white' : 'bg-black'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 px-4"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
              }`}>
                <Bell className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'all' 
                  ? 'No notifications' 
                  : `No ${activeTab === 'messages' ? 'messages' : activeTab === 'matches' ? 'matches' : activeTab === 'likes' ? 'likes' : activeTab === 'follows' ? 'follows' : activeTab === 'gifts' ? 'gifts' : 'other notifications'} yet`}
              </h3>
              <p className={`text-sm text-center max-w-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {activeTab === 'all' 
                  ? "You're all caught up! When you get notifications, they'll show up here."
                  : activeTab === 'messages'
                  ? "When you receive messages, they'll show up here."
                  : activeTab === 'matches'
                  ? "When you get a new match, you'll see it here."
                  : activeTab === 'likes'
                  ? "When someone likes your profile, you'll see it here."
                  : activeTab === 'follows'
                  ? "When someone follows you, you'll see it here."
                  : activeTab === 'gifts'
                  ? "When you receive a gift, you'll see it here."
                  : "Other notifications will show up here."
                }
              </p>
            </motion.div>
          ) : (
            <div>
              {filteredNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const isLast = index === filteredNotifications.length - 1;
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                    onClick={() => {
                      if (notification.type === 'chat_message') {
                        navigate('/messages');
                      } else if (notification.type === 'new_match' || notification.type === 'match_unmatch') {
                        navigate('/matches');
                      } else if (notification.sender?.username) {
                        navigate(`/${notification.sender.username}`);
                      }
                    }}
                    className={`group relative px-4 lg:px-6 py-5 cursor-pointer transition-all duration-200 ${
                      !isLast ? `border-b ${theme === 'dark' ? 'border-gray-900/30' : 'border-gray-100/50'}` : ''
                    } ${
                      !notification.is_read 
                        ? theme === 'dark' 
                          ? 'bg-white/[0.03] hover:bg-white/[0.05]' 
                          : 'bg-black/[0.02] hover:bg-black/[0.04]'
                        : theme === 'dark'
                          ? 'hover:bg-white/[0.02]'
                          : 'hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon Container */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-gray-950 group-hover:bg-gray-900'
                          : 'bg-gray-50 group-hover:bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`} strokeWidth={2} />
                      </div>

                      {/* User Avatar */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${
                            theme === 'dark' ? 'ring-gray-800' : 'ring-gray-200'
                          }`}>
                            {notification.sender?.avatar ? (
                              <img
                                src={notification.sender.avatar}
                                alt={notification.sender.displayname || notification.sender.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
                              }`}>
                                <span className={`text-lg font-bold ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {(notification.sender?.displayname || notification.sender?.username || 'U')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5 mb-1 flex-wrap">
                              <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {notification.sender?.displayname || notification.sender?.username || 'Unknown User'}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <span className={`text-xs mt-2 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {!notification.is_read && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`w-2 h-2 rounded-full ${
                                  theme === 'dark' ? 'bg-white' : 'bg-black'
                                }`}
                              />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                                theme === 'dark' 
                                  ? 'hover:bg-white/10 text-gray-500 hover:text-white' 
                                  : 'hover:bg-black/10 text-gray-400 hover:text-gray-900'
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
      </Container>
  );
};

export default NotificationsScreen;

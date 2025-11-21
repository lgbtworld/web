import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

export interface Notification {
  id: string;
  sender_id: string;
  sender: {
    public_id: string;
    id: string;
    username: string;
    displayname: string;
    avatar?: string;
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

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (id: string) => void;
  onClick: () => void;
  theme: string;
  getNotificationIcon: (type: string) => React.ComponentType<any>;
  formatTime: (createdAt: string) => string;
  index: number;
  isLast: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  markAsRead,
  onClick,
  theme,
  getNotificationIcon,
  formatTime,
  index,
  isLast
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = getNotificationIcon(notification.type);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !notification.is_read) {
          markAsRead(notification.id);
        }
      },
      { threshold: 0.5 } // %50 görünürlükte tetikle
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [notification, markAsRead]);

  return (
    <motion.div
      key={notification.id}
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      onClick={onClick}
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
};

export default NotificationItem;
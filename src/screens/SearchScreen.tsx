import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar, Heart, MessageCircle, Share2, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Container from '../components/ui/Container';

interface SearchResult {
  id: number;
  type: string;
  name?: string;
  username?: string;
  avatar?: string;
  verified?: boolean;
  bio?: string;
  followers?: string;
  mutual?: number;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  attendees?: string;
  image?: string;
  author?: {
    name: string;
    username: string;
    avatar: string;
  };
  content?: string;
  likes?: number;
  comments?: number;
  timestamp?: string;
  address?: string;
  rating?: number;
  reviews?: number;
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'people', label: 'People', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'posts', label: 'Posts', icon: MessageCircle },
    { id: 'locations', label: 'Places', icon: MapPin },
  ];

  const searchResults: SearchResult[] = [
    {
      id: 1,
      type: 'people',
      name: 'Alex Rivera',
      username: 'alexr_pride',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      verified: true,
      bio: 'LGBTQ+ activist and community organizer',
      followers: '2.4K',
      mutual: 12,
    },
    {
      id: 52,
      type: 'events',
      title: 'Pride Parade 2025',
      date: 'June 15, 2025',
      time: '10:00 AM',
      location: 'Downtown City Center',
      attendees: '1.2K',
      image: 'https://images.pexels.com/photos/1601131/pexels-photo-1601131.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    },
    {
      id: 43,
      type: 'posts',
      author: {
        name: 'Jordan Kim',
        username: 'jordankim',
        avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      content: 'Celebrating my 6-month anniversary with my amazing partner today! Feeling grateful for all the love and support from this incredible community.',
      likes: 156,
      comments: 28,
      timestamp: '4h',
    },
    {
      id: 42,
      type: 'locations',
      name: 'Rainbow Community Center',
      address: '123 Pride Street, Downtown',
      rating: 4.8,
      reviews: 127,
      image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    },
    {
      id: 112,
      type: 'people',
      name: 'Alex Rivera',
      username: 'alexr_pride',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      verified: true,
      bio: 'LGBTQ+ activist and community organizer',
      followers: '2.4K',
      mutual: 12,
    },
    {
      id: 523,
      type: 'events',
      title: 'Pride Parade 2025',
      date: 'June 15, 2025',
      time: '10:00 AM',
      location: 'Downtown City Center',
      attendees: '1.2K',
      image: 'https://images.pexels.com/photos/1601131/pexels-photo-1601131.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    },
    {
      id: 435,
      type: 'posts',
      author: {
        name: 'Jordan Kim',
        username: 'jordankim',
        avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      content: 'Celebrating my 6-month anniversary with my amazing partner today! Feeling grateful for all the love and support from this incredible community.',
      likes: 156,
      comments: 28,
      timestamp: '4h',
    },
    {
      id: 423,
      type: 'locations',
      name: 'Rainbow Community Center',
      address: '123 Pride Street, Downtown',
      rating: 4.8,
      reviews: 127,
      image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    },
    {
      id: 11,
      type: 'people',
      name: 'Alex Rivera',
      username: 'alexr_pride',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      verified: true,
      bio: 'LGBTQ+ activist and community organizer',
      followers: '2.4K',
      mutual: 12,
    },
    {
      id: 23,
      type: 'events',
      title: 'Pride Parade 2025',
      date: 'June 15, 2025',
      time: '10:00 AM',
      location: 'Downtown City Center',
      attendees: '1.2K',
      image: 'https://images.pexels.com/photos/1601131/pexels-photo-1601131.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    },
    {
      id: 34,
      type: 'posts',
      author: {
        name: 'Jordan Kim',
        username: 'jordankim',
        avatar: 'https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      content: 'Celebrating my 6-month anniversary with my amazing partner today! Feeling grateful for all the love and support from this incredible community.',
      likes: 156,
      comments: 28,
      timestamp: '4h',
    },
    {
      id: 420,
      type: 'locations',
      name: 'Rainbow Community Center',
      address: '123 Pride Street, Downtown',
      rating: 4.8,
      reviews: 127,
      image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    },
  ];

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 1000);
  };

  const filteredResults = searchResults.filter(result => {
    if (activeFilter !== 'all' && result.type !== activeFilter) return false;
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    switch (result.type) {
      case 'people':
        return (result.name?.toLowerCase().includes(query) ||
          result.username?.toLowerCase().includes(query) ||
          result.bio?.toLowerCase().includes(query)) ?? false;
      case 'events':
        return (result.title?.toLowerCase().includes(query) ||
          result.location?.toLowerCase().includes(query)) ?? false;
      case 'posts':
        return (result.content?.toLowerCase().includes(query) ||
          result.author?.name?.toLowerCase().includes(query)) ?? false;
      case 'locations':
        return (result.name?.toLowerCase().includes(query) ||
          result.address?.toLowerCase().includes(query)) ?? false;
      default:
        return true;
    }
  });

  return (
    <Container>
      <div className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b backdrop-blur-xl bg-opacity-80`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search people, events, posts, places..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${theme === 'dark'
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:ring-gray-400'
                }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${activeFilter === filter.id
                  ? (theme === 'dark' ? 'bg-white text-black' : 'bg-gray-900 text-white')
                  : (theme === 'dark' ? 'bg-gray-900 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900')
                  }`}
              >
                <filter.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Searching vibes...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-6 rounded-3xl transition-all duration-200 cursor-pointer ${theme === 'dark'
                    ? 'bg-gray-900/50 hover:bg-gray-900 border border-gray-800'
                    : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md'
                    }`}
                >
                  {result.type === 'people' && (
                    <div className="flex items-center space-x-4">
                      <img
                        src={result.avatar}
                        alt={result.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {result.name}
                          </h3>
                          {result.verified && (
                            <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          @{result.username} • {result.followers} followers
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {result.bio}
                        </p>
                      </div>
                      <button className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${theme === 'dark'
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}>
                        Follow
                      </button>
                    </div>
                  )}

                  {result.type === 'events' && (
                    <div className="flex space-x-4">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-32 h-24 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {result.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm mb-3">
                          <span className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}>{result.date}</span>
                          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>•</span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{result.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {result.attendees} attending
                          </span>
                          <button className={`px-4 py-1 rounded-full text-sm font-medium ${theme === 'dark'
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}>
                            Join
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.type === 'posts' && (
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={result.author?.avatar}
                          alt={result.author?.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {result.author?.name}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            @{result.author?.username} • {result.timestamp}
                          </p>
                        </div>
                      </div>
                      <p className={`mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        {result.content}
                      </p>
                      <div className="flex items-center space-x-6">
                        <button className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}>
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{result.likes}</span>
                        </button>
                        <button className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}>
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{result.comments}</span>
                        </button>
                        <button className={`flex items-center space-x-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}>
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {result.type === 'locations' && (
                    <div className="flex space-x-4">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          {result.name}
                        </h3>
                        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {result.address}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(result.rating || 0)
                                    ? 'text-yellow-400'
                                    : theme === 'dark'
                                      ? 'text-gray-600'
                                      : 'text-gray-300'
                                    }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>({result.reviews})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className={`w-16 h-16 mb-6 ${theme === 'dark' ? 'text-gray-800' : 'text-gray-200'}`} />
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No results found</h3>
                <p className={theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}>Try searching for something else or adjusting your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default SearchScreen;
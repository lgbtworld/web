import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import CreatePost from './CreatePost';
import Post, { type ApiPost as PostComponentApiPost } from './Post';
import { api } from '../services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

type ApiPost = PostComponentApiPost;

interface TimelineResponse {
  posts: ApiPost[];
  next_cursor?: number | string | null;
}

interface FlowsProps {
  onPostClick: (postId: string, username: string) => void;
  onProfileClick: (username: string) => void;
}

const Flows: React.FC<FlowsProps> = ({ onPostClick, onProfileClick }) => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string>('');

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: TimelineResponse = await api.fetchTimeline({ limit: 10, cursor: "" });
        console.log('Initial fetch response:', response);
        setPosts(response.posts);
        
        // Handle next_cursor - can be number, string, or null/undefined
        let newCursor = '';
        if (response.next_cursor !== null && response.next_cursor !== undefined) {
          newCursor = String(response.next_cursor);
        }
        
        console.log('Initial cursor:', newCursor);
        setNextCursor(newCursor);
        // hasMore should be based on whether there's a next cursor
        const hasMorePosts = newCursor !== '' && newCursor !== '0' && newCursor !== 'null' && newCursor !== 'undefined';
        console.log('Initial hasMore:', hasMorePosts);
        setHasMore(hasMorePosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more posts function
  const loadMorePosts = useCallback(async () => {
    // Check if nextCursor is valid (not empty string, not '0', and not null/undefined)
    if (!nextCursor || nextCursor === '' || nextCursor === '0' || nextCursor === 'null' || nextCursor === 'undefined' || loadingMore || !hasMore) {
      console.log('Load more skipped:', { nextCursor, loadingMore, hasMore });
      return;
    }

    try {
      console.log('Loading more posts with cursor:', nextCursor);
      setLoadingMore(true);
      const response: TimelineResponse = await api.fetchTimeline({ limit: 10, cursor: nextCursor });

      console.log('Load more response:', response);

      if (response.posts && response.posts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...response.posts]);
        
        // Handle next_cursor - can be number, string, or null/undefined
        let newCursor = '';
        if (response.next_cursor !== null && response.next_cursor !== undefined) {
          newCursor = String(response.next_cursor);
        }
        
        console.log('New cursor after load more:', newCursor);
        setNextCursor(newCursor);
        
        // Update hasMore based on whether there's a next cursor
        const hasMorePosts = newCursor !== '' && newCursor !== '0' && newCursor !== 'null' && newCursor !== 'undefined';
        console.log('Has more after load more:', hasMorePosts);
        setHasMore(hasMorePosts);
      } else {
        // No more posts
        console.log('No more posts available');
        setHasMore(false);
        setNextCursor('');
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('Failed to load more posts. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, hasMore]);

  // Load more posts when scrolling to bottom
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isRequestPending = false;

    const handleScroll = () => {
      // Skip if already loading or no more posts
      if (loadingMore || !hasMore || loading || !nextCursor || nextCursor === '' || nextCursor === '0' || nextCursor === 'null' || nextCursor === 'undefined') {
        return;
      }

      // Debounce scroll events
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

        // Load more when 500px from bottom (more aggressive)
        if (distanceFromBottom <= 500 && !isRequestPending) {
          console.log('Triggering load more:', { 
            distanceFromBottom, 
            hasMore, 
            loadingMore, 
            loading, 
            nextCursor,
            scrollHeight,
            scrollTop,
            clientHeight
          });
          isRequestPending = true;
          loadMorePosts().finally(() => {
            isRequestPending = false;
          });
        }
      }, 150); // 150ms debounce
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also check on initial load if content is short
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [hasMore, loadingMore, loading, loadMorePosts, nextCursor]);

  const refreshPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: TimelineResponse = await api.fetchTimeline({ limit: 10, cursor: "" });
      console.log('Refresh response:', response);
      setPosts(response.posts);
      
      // Handle next_cursor - can be number, string, or null/undefined
      let newCursor = '';
      if (response.next_cursor !== null && response.next_cursor !== undefined) {
        newCursor = String(response.next_cursor);
      }
      
      console.log('Refresh cursor:', newCursor);
      setNextCursor(newCursor);
      // hasMore should be based on whether there's a next cursor
      const hasMorePosts = newCursor !== '' && newCursor !== '0' && newCursor !== 'null' && newCursor !== 'undefined';
      console.log('Refresh hasMore:', hasMorePosts);
      setHasMore(hasMorePosts);
    } catch (err) {
      console.error('Error refreshing posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = useCallback((updatedPost: ApiPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post.id === updatedPost.id ? updatedPost : post))
    );
  }, []);

  return (
    <div className='w-full relative'>
      {/* Floating Loading Indicator */}
      {loadingMore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${theme === 'dark' ? 'bg-gray-900/95 border border-gray-800' : 'bg-white/95 border border-gray-200'} backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg`}
        >
          <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className={`animate-spin rounded-full h-5 w-5 border-2 ${theme === 'dark' ? 'border-gray-600 border-t-white' : 'border-gray-300 border-t-gray-900'}`}></div>
            <span className="font-semibold text-sm">Loading more posts...</span>
          </div>
        </motion.div>
      )}

      {/* Create Post - Hidden on mobile */}
      <div className={`hidden lg:block ${theme === 'dark' ? 'bg-gray-400 border-b border-gray-900' : 'bg-white border-b border-gray-100'}`}>
        <CreatePost
        fullScreen={false}
          title="Create Post"
          buttonText="Post"
          placeholder="Every vibe tells a story. What's yours? 🌈"
          onPostCreated={() => {
            refreshPosts();
          }}
        />
      </div>
 

      {/* Posts Feed */}
      <div className='pb-[25dvh] '>
        {loading ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading posts...
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4"
          >
            <div className={`rounded-3xl overflow-hidden backdrop-blur-xl max-w-md w-full ${
              theme === 'dark'
                ? 'bg-white/5 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
            }`}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-xl ${
                    theme === 'dark'
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-red-50 border border-red-200/50'
                  }`}>
                    <AlertCircle className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-semibold tracking-tight mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Unable to Load Posts
                    </h3>
                    <p className={`text-sm sm:text-base font-medium ${
                      theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      We couldn't connect to the server. Please check your connection and try again.
                    </p>
                  </div>
                  <motion.button
                    onClick={refreshPosts}
                    disabled={loading}
                    className={`flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-xl ${
                      loading
                        ? theme === 'dark'
                          ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-white text-black hover:bg-gray-100 active:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800 active:bg-gray-800'
                    }`}
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Reloading...' : 'Reload'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : posts.length === 0 ? (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No posts available
          </div>
        ) : (
       
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
            >
              <Post
                post={post}
                onPostClick={(postId, username) => onPostClick(postId, username)}
                onProfileClick={onProfileClick}
                onRefreshParent={() => {
                  refreshPosts();
                }}
                  onUpdatePost={handlePostUpdate}
              />
            </motion.div>
          ))
      
        )}
        {/* Loading More Indicator */}
        {loadingMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-8 text-center border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}
          >
            <div className={`inline-flex items-center space-x-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className={`animate-spin rounded-full h-5 w-5 border-2 ${theme === 'dark' ? 'border-gray-600 border-t-white' : 'border-gray-300 border-t-gray-900'}`}></div>
              <span className="font-medium">Loading more posts...</span>
            </div>
          </motion.div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No more posts to load
          </div>
        )}
      </div>
  
      </div>
  );
};

export default Flows;


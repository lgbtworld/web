import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import CreatePost from './CreatePost';
import Post, { type ApiPost as PostComponentApiPost } from './Post';
import { api } from '../../services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

// Shimmer styles - defined once globally
if (typeof document !== 'undefined' && !document.getElementById('skeleton-shimmer-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-shimmer-styles';
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    .shimmer-animation {
      animation: shimmer 1.5s infinite linear;
    }
  `;
  document.head.appendChild(style);
}

// Post Skeleton Component - exported for use in other components
export const PostSkeleton: React.FC<{ theme: 'dark' | 'light' }> = ({ theme }) => {
  return (
    <div className={`${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>

          {/* Username and timestamp */}
          <div className="space-y-2">
            <div className={`h-4 w-32 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
              }`}>
              <div className="w-full h-full shimmer-animation"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                    : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                  backgroundSize: '200% 100%'
                }} />
            </div>
            <div className={`h-3 w-24 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
              }`}>
              <div className="w-full h-full shimmer-animation"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                    : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                  backgroundSize: '200% 100%'
                }} />
            </div>
          </div>
        </div>

        {/* Menu button */}
        <div className={`w-8 h-8 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
          }`}>
          <div className="w-full h-full shimmer-animation"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
              backgroundSize: '200% 100%'
            }} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-3">
        {/* Text lines */}
        <div className="space-y-2">
          <div className={`h-4 w-full rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>
          <div className={`h-4 w-5/6 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>
          <div className={`h-4 w-4/6 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>
        </div>

        {/* Image placeholder */}
        <div className={`w-full h-64 rounded-2xl overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
          }`}>
          <div className="w-full h-full shimmer-animation"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
              backgroundSize: '200% 100%'
            }} />
        </div>
      </div>

      {/* Actions */}
      <div className={`px-4 py-3 flex items-center justify-between border-t ${theme === 'dark' ? 'border-gray-800/50' : 'border-gray-100'
        }`}>
        <div className="flex items-center gap-6">
          <div className={`w-6 h-6 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>
          <div className={`w-6 h-6 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>
          <div className={`w-6 h-6 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
            }`}>
            <div className="w-full h-full shimmer-animation"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                  : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
                backgroundSize: '200% 100%'
              }} />
          </div>
        </div>
        <div className={`w-16 h-4 rounded overflow-hidden ${theme === 'dark' ? 'bg-gray-900/70' : 'bg-gray-200'
          }`}>
          <div className="w-full h-full shimmer-animation"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(90deg, rgba(17,24,39,0.5) 0%, rgba(31,41,55,0.8) 50%, rgba(17,24,39,0.5) 100%)'
                : 'linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%)',
              backgroundSize: '200% 100%'
            }} />
        </div>
      </div>
    </div>
  );
};

type ApiPost = PostComponentApiPost;
interface MemoizedPostItemProps {
  post: ApiPost;
  theme: string;
  onPostClick: (postId: string, username: string) => void;
  onProfileClick: (username: string) => void;
  onRefreshParent: () => void;
  onUpdatePost: (post: ApiPost) => void;
}

const MemoizedPostItem = React.memo(({ post, theme, onPostClick, onProfileClick, onRefreshParent, onUpdatePost }: MemoizedPostItemProps) => {
  return (
    <div className={`${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <Post
        post={post}
        onPostClick={(postId, username) => onPostClick(postId, username)}
        onProfileClick={onProfileClick}
        onRefreshParent={onRefreshParent}
        onUpdatePost={onUpdatePost}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Sadece ana prop değişikliklerinde re-render et (fonksiyon referanslarını es geç)
  return prevProps.post === nextProps.post && prevProps.theme === nextProps.theme;
});

interface TimelineResponse {
  posts: ApiPost[];
  cursor?: number | string | null;
}

interface FlowsProps {
  onPostClick: (postId: string, username: string) => void;
  onProfileClick: (username: string) => void;
  scrollParentRef?: React.RefObject<HTMLDivElement | null>;
}

const Flows: React.FC<FlowsProps> = ({ onPostClick, onProfileClick, scrollParentRef }) => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string>('');
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollParentRef?.current) {
      setScrollElement(scrollParentRef.current);
    }
  }, [scrollParentRef]);

  // Use refs to track values and avoid stale closures
  const isRequestPendingRef = useRef(false);
  const loadingMoreRef = useRef(loadingMore);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const nextCursorRef = useRef(nextCursor);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update refs when state changes
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  // Wait for posts to render before hiding loading
  useEffect(() => {
    if (posts.length > 0 && loading) {
      // Use requestAnimationFrame for better performance
      let rafId: number;
      const timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          setLoading(false);
        });
      }, 50); // Reduced delay

      return () => {
        clearTimeout(timeoutId);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [posts, loading]);

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
        if (response.cursor !== null && response.cursor !== undefined) {
          newCursor = String(response.cursor);
        }

        console.log('Initial cursor:', newCursor);
        setNextCursor(newCursor);
        // hasMore should be based on whether there's a next cursor
        const hasMorePosts = newCursor !== '' && newCursor !== '0' && newCursor !== 'null' && newCursor !== 'undefined';
        console.log('Initial hasMore:', hasMorePosts);
        setHasMore(hasMorePosts);

        // If no posts, hide loading immediately
        if (response.posts.length === 0) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more posts function - using refs to avoid dependency issues
  const loadMorePosts = useCallback(async () => {
    // Get current values from refs to avoid stale closure
    const currentNextCursor = nextCursorRef.current;
    const currentLoadingMore = loadingMoreRef.current;
    const currentHasMore = hasMoreRef.current;

    console.log('loadMorePosts called with:', {
      currentNextCursor,
      currentLoadingMore,
      currentHasMore,
      isPending: isRequestPendingRef.current
    });

    // Check if nextCursor is valid (not empty string, not '0', and not null/undefined)
    if (
      !currentNextCursor ||
      currentNextCursor === '' ||
      currentNextCursor === '0' ||
      currentNextCursor === 'null' ||
      currentNextCursor === 'undefined' ||
      currentLoadingMore ||
      !currentHasMore ||
      isRequestPendingRef.current
    ) {
      console.log('Load more skipped:', {
        nextCursor: currentNextCursor,
        loadingMore: currentLoadingMore,
        hasMore: currentHasMore,
        isPending: isRequestPendingRef.current
      });
      return;
    }

    try {
      console.log('Loading more posts with cursor:', currentNextCursor);
      setLoadingMore(true);
      isRequestPendingRef.current = true;

      // Wait for skeleton to render (single frame is enough)
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          resolve(undefined);
        });
      });

      // Minimum loading time to ensure skeleton is visible
      const minLoadingTime = 300; // Reduced to 300ms for better UX
      const startTime = Date.now();

      const response: TimelineResponse = await api.fetchTimeline({ limit: 10, cursor: currentNextCursor });

      console.log('Load more response:', response);

      if (response.posts && response.posts.length > 0) {
        setPosts(prevPosts => {
          const existingIds = new Set(prevPosts.map(p => p.id));
          const newUniquePosts = response.posts.filter(p => !existingIds.has(p.id));
          return [...prevPosts, ...newUniquePosts];
        });

        // Handle next_cursor - can be number, string, or null/undefined
        let newCursor = '';
        if (response.cursor !== null && response.cursor !== undefined) {
          newCursor = String(response.cursor);
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

      // Ensure minimum loading time for skeleton visibility
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
      setError('Failed to load more posts. Please try again.');
    } finally {
      setLoadingMore(false);
      isRequestPendingRef.current = false;
    }
  }, []); // No dependencies - uses refs instead

  const refreshPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: TimelineResponse = await api.fetchTimeline({ limit: 10, cursor: "" });
      console.log('Refresh response:', response);
      setPosts(response.posts);

      // Handle next_cursor - can be number, string, or null/undefined
      let newCursor = '';
      if (response.cursor !== null && response.cursor !== undefined) {
        newCursor = String(response.cursor);
      }

      console.log('Refresh cursor:', newCursor);
      setNextCursor(newCursor);
      // hasMore should be based on whether there's a next cursor
      const hasMorePosts = newCursor !== '' && newCursor !== '0' && newCursor !== 'null' && newCursor !== 'undefined';
      console.log('Refresh hasMore:', hasMorePosts);
      setHasMore(hasMorePosts);

      // If no posts, hide loading immediately
      if (response.posts.length === 0) {
        setLoading(false);
      }
      // Otherwise, the useEffect will handle hiding loading after render
    } catch (err) {
      console.error('Error refreshing posts:', err);
      setError('Failed to load posts. Please try again.');
      setLoading(false);
    }
  };

  const handlePostUpdate = useCallback((updatedPost: ApiPost) => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post.id === updatedPost.id ? updatedPost : post))
    );
  }, []);

  return (
    <div ref={containerRef} className='w-full relative'>
      {/* Posts Feed - Virtualized */}
      <div className='w-full'>
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={`initial-skeleton-${index}`}>
                <PostSkeleton theme={theme} />
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4"
          >
            {/* Error UI content */}
            <div className={`w-full`}>
              <div className="p-4">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-xl ${theme === 'dark'
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-red-50 border border-red-200/50'
                    }`}>
                    <AlertCircle className={`w-8 h-8 sm:w-10 sm:h-10 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'
                      }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-semibold tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Unable to Load Posts
                    </h3>
                    <p className={`text-sm sm:text-base font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                      }`}>
                      We couldn't connect to the server. Please check your connection and try again.
                    </p>
                  </div>
                  <motion.button
                    onClick={refreshPosts}
                    disabled={loading}
                    className={`flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 backdrop-blur-xl ${loading
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
        ) : (Boolean(scrollParentRef) && !scrollElement) ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((val) => (
              <div key={`wait-skeleton-${val}`}>
                <PostSkeleton theme={theme} />
              </div>
            ))}
          </div>
        ) : (
          <Virtuoso
            key={scrollElement ? 'scroll-element-ready' : 'window-scroll-fallback'}
            useWindowScroll={!scrollElement}
            customScrollParent={scrollElement || undefined}
            data={posts}
            endReached={loadMorePosts}
            overscan={400}
            itemContent={(_index, post) => (
              <MemoizedPostItem
                post={post}
                theme={theme}
                onPostClick={onPostClick}
                onProfileClick={onProfileClick}
                onRefreshParent={refreshPosts}
                onUpdatePost={handlePostUpdate}
              />
            )}
            components={{
              Header: () => (
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
              ),
              Footer: () => (
                <div className="pb-32">
                  {loadingMore && (
                    <div className="py-8 flex justify-center items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--brand-color,#ec4899)] border-t-transparent animate-spin" />
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No more posts to load
                    </div>
                  )}
                </div>
              )
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Flows;

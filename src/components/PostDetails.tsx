import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '../lib/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Post, { PostProps, ApiPost } from './Post';
import { api } from '../services/api';
import Container from './Container';
import { PostSkeleton } from './Flows';

type PostDetailsProps = Omit<PostProps, 'post' | 'defaultShowReply' | 'loadChildren'>;

const PostDetails: React.FC<PostDetailsProps> = ({ showChildren = true, ...restProps }) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle back button click
  const handleBackClick = () => {
    navigate('/', { replace: true });
  };

  // Handle post click - navigate to post detail page
  const handlePostClick = (postId: string, username: string) => {
    navigate(`/${username}/status/${postId}`, { replace: true });
  };

  // Handle profile click - navigate to profile page
  const handleProfileClick = (username: string) => {
    const params = new URLSearchParams({
      returnTo: 'post',
      returnPostId: String(postId || ''),
      returnUsername: String(post?.author?.username || username),
    });
    navigate(`/${username}?${params.toString()}`);
  };

  useEffect(() => {
    if (!postId) {
      setError('Post ID is required');
      setLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError(null);
        const postData = await api.fetchPost(postId);
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  if (loading) {
    return (
      <Container
        className={`w-full min-h-[100dvh] overflow-y-auto scrollbar-hide max-h-[100dvh]`}>
        {/* Post Detail Header */}
        <div className={`z-40 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-950 border-gray-800/50' : 'bg-white border-gray-100/50'}`}>
          <div className="flex items-center px-4 py-3">
            <button
              onClick={handleBackClick}
              className={`p-2 rounded-full transition-all duration-200 mr-3 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Post
              </h2>
            </div>
          </div>
        </div>
        <PostSkeleton theme={theme} />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <>
        {/* Post Detail Header */}
        <div className={`z-40 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-950 border-gray-800/50' : 'bg-white border-gray-100/50'}`}>
          <div className="flex items-center px-4 py-3">
            <button
              onClick={handleBackClick}
              className={`p-2 rounded-full transition-all duration-200 mr-3 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            </button>
            <div>
              <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Post
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error || 'Post not found'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <Container
      className={`w-full min-h-[100dvh] overflow-y-auto scrollbar-hide max-h-[100dvh]`}>
      {/* Post Detail Header */}
      <div className={`z-40 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-950 border-gray-800/50' : 'bg-white border-gray-100/50'}`}>
        <div className="flex items-center px-4 py-3">
          <button
            onClick={handleBackClick}
            className={`p-2 rounded-full transition-all duration-200 mr-3 ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
          >
            <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
          </button>
          <div>
            <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Post
            </h2>
          </div>
        </div>
      </div>
      <Post
        post={post}
        {...restProps}
        onPostClick={restProps.onPostClick || handlePostClick}
        onProfileClick={restProps.onProfileClick || handleProfileClick}
        showChildren={showChildren}
        defaultShowReply={true}
        loadChildren={false}
      />
    </Container>
  );
};

export default PostDetails;

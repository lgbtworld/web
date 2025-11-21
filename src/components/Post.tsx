import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, MapPin, Calendar, X, ChevronLeft, ChevronRight, CircleCheck, CheckSquare, ListOrdered, Scale, BarChart3, Loader2, ExternalLink, Sparkles, Globe, Users, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import PostReply from './PostReply';
import VideoPlayer from './VideoPlayer';
import { api } from '../services/api';
import { $generateHtmlFromNodes } from '@lexical/html';
import { createEditor } from 'lexical';
import L from 'leaflet';

import {HashtagNode} from '@lexical/hashtag';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {ListNode, ListItemNode} from '@lexical/list';
import {LinkNode, AutoLinkNode} from '@lexical/link';
import { MentionNode } from './Lexical/nodes/MentionNode';
import { getSafeImageURL } from '../helpers/helpers';

// API data structure interfaces
interface ApiPost {
  id: string;
  public_id: string;
  author_id: string;
  type: string;
  content?: {
    en?: string;
  };
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  parent_id?: string;
  children?: ApiPost[];
  author: {
    id: string;
    public_id: number;
    username: string;
    displayname: string;
    email: string;
    date_of_birth: string;
    gender: string;
    sexual_orientation: {
      id: string;
      key: string;
      order: number;
    };
    sex_role: string;
    relationship_status: string;
    user_role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    default_language: string;
    languages: unknown;
    fantasies: unknown[];
    travel: unknown;
    social: unknown;
    deleted_at: string | null;
    avatar?: {
      url?: string;
      file?: {
        variants?: {
          image?: {
            icon?: { url: string };
            thumbnail?: { url: string };
            small?: { url: string };
            medium?: { url: string };
            large?: { url: string };
          };
        };
      };
      variants?: {
        image?: {
          icon?: { url: string };
          thumbnail?: { url: string };
          small?: { url: string };
          medium?: { url: string };
          large?: { url: string };
        };
      };
    };
  };
  attachments?: Array<{
    id: string;
    file_id: string;
    owner_id: string;
    owner_type: string;
    role: string;
    is_public: boolean;
    file: {
      id: string;
      url: string;
      storage_path: string;
      mime_type: string;
      size: number;
      name: string;
      created_at: string;
    };
    created_at: string;
    updated_at: string;
  }>;
  poll?: Array<{
    id: string;
    post_id: string;
    contentable_id: string;
    contentable_type: string;
    question: {
      en: string;
    };
    duration: string;
    kind: 'single' | 'multiple' | 'ranked' | 'weighted';
    max_selectable: number;
    created_at: string;
    updated_at: string;
    choices?: Array<{
      id: string;
      poll_id: string;
      display_order?: number;
      label: {
        en: string;
      };
      vote_count: number;
      voters?: Array<{
        id: string;
        username: string;
        displayname: string;
      }>;
      votes?: Array<{
        id: string;
        choice_id: string;
        user_id: string;
        user?: {
          id: string;
          username: string;
          displayname: string;
          avatar?: {
            file?: {
              variants?: {
                image?: {
                  icon?: { url: string };
                  thumbnail?: { url: string };
                  small?: { url: string };
                };
              };
            };
            variants?: {
              image?: {
                icon?: { url: string };
                thumbnail?: { url: string };
                small?: { url: string };
              };
            };
          };
        };
        weight?: number;
        rank?: number;
        created_at: string;
      }>;
    }>;
  }>;
  event?: {
    id: string;
    post_id: string;
    title: {
      en: string;
    };
    description: {
      en: string;
    };
    start_time: string;
    location: {
      id: string;
      contentable_id: string;
      contentable_type: string;
      country_code: string | null;
      address: string;
      display: string | null;
      latitude: number;
      longitude: number;
      location_point: {
        lng: number;
        lat: number;
      };
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    type: string;
    kind?: string;
    capacity?: number;
    is_paid?: boolean;
    price?: number;
    currency?: string;
    is_online?: boolean;
    online_url?: string;
    created_at: string;
    updated_at: string;
    attendees?: Array<{
      id: string;
      username: string;
      displayname: string;
      status: 'going' | 'not_going' | 'maybe';
    }>;
  };
  location?: {
    id: string;
    contentable_id: string;
    contentable_type: string;
    country_code: string | null;
    address: string;
    display: string | null;
    latitude: number;
    longitude: number;
    location_point: {
      lng: number;
      lat: number;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

interface PostProps {
  post: ApiPost;
  onPostClick?: (postId: string, username: string) => void;
  onProfileClick?: (username: string) => void;
  showChildren?: boolean;
  onRefreshParent?: () => void;
  defaultShowReply?: boolean;
  loadChildren?: boolean;
  onUpdatePost?: (updatedPost: ApiPost) => void;
}

const Post: React.FC<PostProps> = ({
  post: postProp,
  onPostClick,
  onProfileClick,
  showChildren = false,
  onRefreshParent,
  defaultShowReply = false,
  loadChildren = false,
  onUpdatePost,
}) => {
  const [post, setPost] = useState<ApiPost>(postProp);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedPollChoices, setSelectedPollChoices] = useState<Record<string, string[]>>({});
  const [isPollRefreshing, setIsPollRefreshing] = useState(false);
  const [eventStatus, setEventStatus] = useState<'going' | 'not_going' | 'maybe' | null>(null);
  const [showReply, setShowReply] = useState(defaultShowReply);
  const [children, setChildren] = useState<ApiPost[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [pressingChoiceId, setPressingChoiceId] = useState<string | null>(null);
  const [authorAvatarFailed, setAuthorAvatarFailed] = useState(false);
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data: appData, defaultLanguage } = useApp();
  const [html, setHtml] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const eventMapRef = useRef<HTMLDivElement>(null);
  const eventMapInstanceRef = useRef<L.Map | null>(null);

  // Update post when prop changes
  useEffect(() => {
    setPost(postProp);
  }, [postProp]);

  // Initialize selected poll choices from votes when post loads
  useEffect(() => {
    if (!post.poll || !user?.id) return;
    
    const initialChoices: Record<string, string[]> = {};
    
    post.poll.forEach((poll) => {
      if (!poll.choices) return;
      
      const userVotes: string[] = [];
      poll.choices.forEach((choice) => {
        if (choice.votes && Array.isArray(choice.votes)) {
          const userVote = choice.votes.find(vote => vote.user_id === user.id);
          if (userVote) {
            userVotes.push(choice.id);
          }
        }
      });
      
      if (userVotes.length > 0) {
        initialChoices[poll.id] = userVotes;
      }
    });
    
    if (Object.keys(initialChoices).length > 0) {
      setSelectedPollChoices(initialChoices);
    }
  }, [post.poll, user?.id]);

  useEffect(() => {
    setShowReply(defaultShowReply);
  }, [defaultShowReply]);

  useEffect(() => {
    setAuthorAvatarFailed(false);
  }, [post.author?.id, post.author?.avatar]);

  const editorConfig = {
    namespace: "CoolVibesEditor",
    editable: true,
    nodes:[HashtagNode, HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode,MentionNode],
    theme: {
      paragraph: `mb-2 text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
      heading: {
        h1: `text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
        h2: `text-2xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
        h3: `text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
      },
      list: {
        nested: {
          listitem: `list-none`,
        },
        ol: `list-decimal list-inside mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
        ul: `list-disc list-inside mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
        listitem: `mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
      },
      quote: `border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-2 italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`,
      link: `${theme === 'dark' ? 'text-white underline' : 'text-gray-900 underline'}`,
      text: {
        bold: "font-semibold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
      },
       hashtag: "hashtag inline-block bg-[linear-gradient(to_right,_#d04b36,_#e36511,_#ffba00,_#00b180,_#147aab,_#675997)]  bg-clip-text text-transparent  font-semibold hover:underline cursor-pointer",
       mention:"mention font-semibold  font-md inline-block bg-[linear-gradient(to_right,_#d04b36,_#e36511,_#ffba00,_#00b180,_#147aab,_#675997)]  bg-clip-text text-transparent  font-semibold hover:underline cursor-pointer"
    },
    onError(error: Error) {
      console.error("Lexical Error:", error);
    },
  };
  

  const  lexicalJsonToHtml = (json: any) : string =>  {
    const editor = createEditor(editorConfig);
    const editorState = editor.parseEditorState(json);
    let html = '';
    editorState.read(() => {
      html = $generateHtmlFromNodes(editor);
    });
    return html;
  }

  useEffect(() => {
    const _content = post.content?.en || ""
    if (!_content) return setHtml('');
    try {
      const parsed = JSON.parse(_content);
      if (parsed.root) {
        let _htmlString = lexicalJsonToHtml(parsed)
        setHtml(_htmlString);
      } else {
        // JSON ama Lexical değil, direkt göster
        setHtml(_content);
      }
    } catch {
      // JSON değil, direkt HTML
      setHtml(_content);
    }
  }, [post]);

  // Initialize Leaflet map when location is set
  useEffect(() => {
    if (!post.location || !mapRef.current) {
      return;
    }

    const location = post.location;
    const lat = location.latitude || location.location_point?.lat;
    const lng = location.longitude || location.location_point?.lng;

    if (!lat || !lng) {
      return;
    }

    // Cleanup existing map
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (error) {
        console.error('Error removing existing map:', error);
      }
    }

    // Clear container
    const container = mapRef.current;
    container.innerHTML = '';

    // Remove Leaflet-specific properties
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    try {
      // Create map with proper delay to ensure DOM is ready
      const initMap = () => {
        if (!mapRef.current || !location) return;

        // Ensure container has proper dimensions
        const container = mapRef.current;
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.zIndex = '1';

        const map = L.map(container, {
          center: [lat, lng],
          zoom: 17,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          attributionControl: false,
          preferCanvas: true
        });

        mapInstanceRef.current = map;

        // Add tile layer with better error handling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0cHgiPk1hcCBUaWxlPC90ZXh0Pjwvc3ZnPg=='
        }).addTo(map);

        // Add custom marker
        const customIcon = L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background: #ef4444;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          className: 'custom-location-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Force map to invalidate size after a short delay
        setTimeout(() => {
          if (map && mapInstanceRef.current) {
            map.invalidateSize();
          }
        }, 200);
      };

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(initMap, 50);
      });

    } catch (error) {
      console.error('Error creating map:', error);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [post.location]);

  // Initialize Leaflet map for event location
  useEffect(() => {
    if (!post.event?.location || !eventMapRef.current) {
      return;
    }

    const location = post.event.location;
    const lat = location.latitude || location.location_point?.lat;
    const lng = location.longitude || location.location_point?.lng;

    if (!lat || !lng) {
      return;
    }

    // Cleanup existing map
    if (eventMapInstanceRef.current) {
      try {
        eventMapInstanceRef.current.remove();
        eventMapInstanceRef.current = null;
      } catch (error) {
        console.error('Error removing existing event map:', error);
      }
    }

    // Clear container
    const container = eventMapRef.current;
    container.innerHTML = '';

    // Remove Leaflet-specific properties
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    try {
      // Create map with proper delay to ensure DOM is ready
      const initMap = () => {
        if (!eventMapRef.current || !location) return;

        // Ensure container has proper dimensions
        const container = eventMapRef.current;
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.position = 'relative';
        container.style.zIndex = '1';

        const map = L.map(container, {
          center: [lat, lng],
          zoom: 17,
          zoomControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
          attributionControl: false,
          preferCanvas: true
        });

        eventMapInstanceRef.current = map;

        // Add tile layer with better error handling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0cHgiPk1hcCBUaWxlPC90ZXh0Pjwvc3ZnPg=='
        }).addTo(map);

        // Add custom marker
        const customIcon = L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background: #ef4444;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          className: 'custom-location-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // Force map to invalidate size after a short delay
        setTimeout(() => {
          if (map && eventMapInstanceRef.current) {
            map.invalidateSize();
          }
        }, 200);
      };

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(initMap, 50);
      });

    } catch (error) {
      console.error('Error creating event map:', error);
    }

    // Cleanup function
    return () => {
      if (eventMapInstanceRef.current) {
        try {
          eventMapInstanceRef.current.remove();
          eventMapInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up event map:', error);
        }
      }
    };
  }, [post.event?.location]);

  // Fetch children (replies) when in detail view
  useEffect(() => {
    if (loadChildren && post.public_id) {
      setLoadingChildren(true);
      api.fetchPost(post.public_id)
        .then((response) => {
          if (response.children) {
            setChildren(response.children);
          }
        })
        .catch((error) => {
          console.error('Error fetching post children:', error);
        })
        .finally(() => {
          setLoadingChildren(false);
        });
    }
  }, [loadChildren, post.public_id]);

  // Handle image load
  const handleImageLoad = useCallback((imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  // Handle profile click
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post click
    onProfileClick?.(post.author.username);
  };

  const authorAvatarUrl = useMemo(() => {
    const avatar = (post.author as any)?.avatar;
    if (!avatar) return '';
    return (
      getSafeImageURL(avatar, 'small') ||
      getSafeImageURL(avatar, 'icon') ||
      getSafeImageURL(avatar, 'thumbnail') ||
      ''
    );
  }, [post.author]);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return postDate.toLocaleDateString();
  };

  // Helper function to format event time
  const formatEventTime = (timestamp: string) => {
    const eventDate = new Date(timestamp);
    return eventDate.toLocaleString();
  };

  // Calculate total votes for a specific poll
  const getTotalVotes = (poll: NonNullable<typeof post.poll>[0]) => {
    if (!poll || !poll.choices || !Array.isArray(poll.choices)) return 0;
    return poll.choices.reduce((total: number, choice: any) => total + (choice.vote_count || 0), 0);
  };

  // Calculate percentage for poll choice
  const getChoicePercentage = (voteCount: number, poll: NonNullable<typeof post.poll>[0]) => {
    const total = getTotalVotes(poll);
    if (total === 0 || !voteCount) return 0;
    return Math.round((voteCount / total) * 100);
  };

  // Rainbow rank styles for progress bars (from TrendsPanel)
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

  const getRankStyle = (rank: number) => {
    if (rank <= rainbowRankStyles.length) {
      return rainbowRankStyles[rank - 1];
    }

    const hue = (rank * 47) % 360;
    const nextHue = (hue + 30) % 360;

    return {
      background: `linear-gradient(135deg, hsl(${hue}, 85%, 55%) 0%, hsl(${nextHue}, 80%, 60%) 100%)`,
      color: '#ffffff',
    };
  };

  const handlePollVote = async (pollId: string, choiceId: string, pollKind: 'single' | 'multiple' | 'ranked' | 'weighted', maxSelectable: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post click
    
    // Get current state before updating
    const currentChoices = selectedPollChoices[pollId] || [];
    const choiceIndex = currentChoices.indexOf(choiceId);
    const isSelecting = choiceIndex === -1;
    
    // Update state
    setSelectedPollChoices(prev => {
      const currentChoices = prev[pollId] || [];
      const choiceIndex = currentChoices.indexOf(choiceId);
      
      if (pollKind === 'single') {
        // Single choice: Toggle - if already selected, deselect; otherwise replace
        if (choiceIndex !== -1) {
          // Deselect
          const updated = { ...prev };
          delete updated[pollId];
          return updated;
        } else {
          // Select (replace existing)
          return {
      ...prev,
            [pollId]: [choiceId]
          };
        }
      } else {
        // Multiple, ranked, or weighted: Allow multiple selections
        if (choiceIndex !== -1) {
          // Deselect
          const filtered = currentChoices.filter(id => id !== choiceId);
          if (filtered.length === 0) {
            const updated = { ...prev };
            delete updated[pollId];
            return updated;
          }
          return {
            ...prev,
            [pollId]: filtered
          };
        } else {
          // Select (add to list, but check max)
          if (currentChoices.length >= maxSelectable) {
            // Already at max, can't add more
            return prev;
          }
          return {
            ...prev,
            [pollId]: [...currentChoices, choiceId]
          };
        }
      }
    });
    
    // Send vote to API (both selecting and deselecting)
    setIsPollRefreshing(true);
    try {
      // Calculate rank for ranked polls (0-based index in selection order)
      // For deselecting, we don't send rank/weight
      const rank = isSelecting && pollKind === 'ranked' ? currentChoices.length : undefined;
      const weight = isSelecting && pollKind === 'weighted' ? 1 : undefined;
      
      await api.handleVote({
        choice_id: choiceId,
        rank: rank,
        weight: weight,
      });
      
      // Reload post to get updated vote counts
      if (post.public_id) {
        try {
          const updatedPost = await api.fetchPost(post.public_id);
          setPost(updatedPost);
          if (onUpdatePost) {
            onUpdatePost(updatedPost);
          } else if (onRefreshParent) {
            onRefreshParent();
          }
        } catch (reloadError) {
          console.error('Error reloading post after vote:', reloadError);
        }
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
      // Revert the selection on error
      setSelectedPollChoices(prev => {
        const currentChoices = prev[pollId] || [];
        if (isSelecting) {
          // Revert selection (remove the choice we just added)
          const filtered = currentChoices.filter(id => id !== choiceId);
          if (filtered.length === 0) {
            const updated = { ...prev };
            delete updated[pollId];
            return updated;
          }
          return {
            ...prev,
            [pollId]: filtered
          };
        } else {
          // Revert deselection (add back the choice we just removed)
          return {
            ...prev,
            [pollId]: [...currentChoices, choiceId]
          };
        }
      });
    } finally {
      setIsPollRefreshing(false);
    }
  };

  // Gallery handlers
  const openGallery = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }, []);

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
    document.body.style.overflow = ''; // Restore scrolling
  }, []);

  const imageAttachments = useMemo(() => {
    if (!post.attachments || !Array.isArray(post.attachments)) return [];
    return post.attachments.filter(att => att?.file?.mime_type?.startsWith('image/'));
  }, [post.attachments]);

  const nextImage = useCallback(() => {
    if (imageAttachments.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % imageAttachments.length);
  }, [imageAttachments.length]);

  const prevImage = useCallback(() => {
    if (imageAttachments.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + imageAttachments.length) % imageAttachments.length);
  }, [imageAttachments.length]);

  // Keyboard navigation for gallery
  useEffect(() => {
    if (!isGalleryOpen || imageAttachments.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, imageAttachments.length, prevImage, nextImage, closeGallery]);

  // Touch swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }
  };

  // Shimmer Component
  const ImageShimmer = ({ className }: { className?: string }) => (
    <>
      <style>{`
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
      `}</style>
      <div className={`relative overflow-hidden rounded-2xl ${className || ''}`}>
        <div className={`absolute inset-0 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
          <div className={`absolute inset-0 rounded-2xl shimmer-animation ${theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 via-gray-700/50 to-gray-800'
              : 'bg-gradient-to-r from-gray-200 via-gray-300/50 to-gray-200'
            }`}
            style={{
              backgroundSize: '200% 100%'
            }} />
        </div>
      </div>
    </>
  );

  
  return (
    <>
<div
className={`
  overflow-hidden border-b transition-all duration-300 ease-out
  ${theme === "dark"
    ? "bg-gray-950 border-gray-800/40 hover:bg-gray-900"
    : "bg-white border-gray-100 hover:bg-gray-50"}
`}
>
        {/* Post Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleProfileClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 overflow-hidden border ${
                theme === 'dark'
                  ? 'bg-gray-900/70 hover:bg-gray-800 border-white/10'
                  : 'bg-white hover:bg-gray-100 border-gray-200'
              }`}
              aria-label={`${post.author.displayname}'s profile`}
            >
              {authorAvatarUrl && !authorAvatarFailed ? (
                <img
                  src={authorAvatarUrl}
                  alt={post.author.displayname}
                  className="w-full h-full object-cover"
                  onError={() => setAuthorAvatarFailed(true)}
                />
              ) : (
                <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {post.author.displayname.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleProfileClick}
                  className={`font-semibold hover:underline transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'
                    }`}
                >
                  {post.author.displayname}
                </button>
                <button
                  onClick={handleProfileClick}
                  className={`text-sm hover:underline transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                    }`}
                >
                  @{post.author.username}
                </button>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>·</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>{formatTimestamp(post.created_at)}</span>
              </div>
            </div>
          </div>
          <button className={`p-2 rounded-full transition-colors ${theme === 'dark'
              ? 'hover:bg-gray-800'
              : 'hover:bg-gray-100'
            }`}>
            <MoreHorizontal className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
          </button>
        </div>

        {/* Post Content */}
        <div
          className={`px-4 py-3 ${onPostClick ? 'cursor-pointer' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onPostClick) {
              onPostClick(post.public_id, post.author.username);
            }
          }}
        >
          <div className={`leading-relaxed  break-words text-[15px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`} style={{
              color: theme === 'dark' ? '#ffffff' : '#111827'
            }}>
            <div
              dangerouslySetInnerHTML={{ __html: html }}
              style={{
                color: theme === 'dark' ? '#ffffff' : '#111827'
              }}
              className={`prose prose-sm max-w-none ${theme === 'dark'
                  ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-a:text-blue-400 prose-code:text-white'
                  : 'prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-900 prose-a:text-blue-600 prose-code:text-gray-900'
                }`}
            />
          </div>
        </div>

        {/* Post Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="px-4 pb-3">
            {(() => {
              if (!post.attachments || !Array.isArray(post.attachments)) return null;
              const imageAttachments = post.attachments.filter(att => att?.file?.mime_type?.startsWith('image/'));
              const videoAttachments = post.attachments.filter(att => att?.file?.mime_type?.startsWith('video/'));
              const nonImageVideoAttachments = post.attachments.filter(att =>
                !att?.file?.mime_type?.startsWith('image/') && !att?.file?.mime_type?.startsWith('video/')
              );
              const imageCount = imageAttachments.length;
              const videoCount = videoAttachments.length;

              // Render video attachments first (YouTube quality)
              const videoRender = videoCount > 0 && (
                <div className="space-y-4 mb-4">
                  {videoAttachments.map((attachment, index) => {
                    // Video URL'ini variants'tan al - Öncelik: high > medium > low > preview > original
                    const videoUrl = getSafeImageURL(attachment, 'high') || 
                                    getSafeImageURL(attachment, 'medium') || 
                                    getSafeImageURL(attachment, 'low') || 
                                    getSafeImageURL(attachment, 'preview') || 
                                    getSafeImageURL(attachment, 'original') || 
                                    attachment.file.url;
                    
                    // Poster URL'ini al
                    const posterUrl = getSafeImageURL(attachment, 'poster') || '';
                    
                    return (
                    <VideoPlayer
                      key={attachment.id || index}
                        src={videoUrl}
                        poster={posterUrl}
                      className="w-full"
                    />
                    );
                  })}
                </div>
              );

              if (imageCount === 0 && videoCount === 0 && nonImageVideoAttachments.length > 0) {
                // Only non-image/video attachments
                return (
                  <>
                    {videoRender}
                    {nonImageVideoAttachments.map((attachment, index) => (
                      <div key={index} className="w-full overflow-hidden mb-2 last:mb-0">
                        <div className={`w-full h-48 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                          }`}>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {attachment.file.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                );
              }

              // Pinterest-style image grid layouts - All images visible
              if (imageCount === 1) {
                const imageUrl = getSafeImageURL(imageAttachments[0], "medium");
                if (!imageUrl) return null;
                const isLoaded = loadedImages.has(imageUrl);

                return (
                  <>
                    {videoRender}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="w-full overflow-hidden rounded-2xl relative aspect-[16/9]">
                        {!isLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                        <img
                          src={imageUrl}
                          alt="Post attachment"
                          className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(imageUrl)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(0);
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              }

              if (imageCount === 2) {
                return (
                  <>
                    {videoRender}
                    <div className="grid grid-cols-2 gap-2">
                      {imageAttachments.map((attachment, index) => {
                        const imageUrl = getSafeImageURL(attachment, "medium");
                        if (!imageUrl) return null;
                        const isLoaded = loadedImages.has(imageUrl);

                        return (
                          <div key={index} className="w-full overflow-hidden rounded-2xl relative h-[300px]">
                            {!isLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                            <img
                              src={imageUrl}
                              alt={`Post attachment ${index + 1}`}
                              className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                              onLoad={() => handleImageLoad(imageUrl)}
                              onClick={(e) => {
                                e.stopPropagation();
                                openGallery(index);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              }

              if (imageCount === 3) {
                const firstImageUrl = getSafeImageURL(imageAttachments[0], "medium");
                const secondImageUrl = getSafeImageURL(imageAttachments[1], "medium");
                const thirdImageUrl = getSafeImageURL(imageAttachments[2], "medium");
                if (!firstImageUrl || !secondImageUrl || !thirdImageUrl) return null;
                const firstLoaded = loadedImages.has(firstImageUrl);
                const secondLoaded = loadedImages.has(secondImageUrl);
                const thirdLoaded = loadedImages.has(thirdImageUrl);

                return (
                  <>
                    {videoRender}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="row-span-2 overflow-hidden rounded-2xl relative h-[300px]">
                        {!firstLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                        <img
                          src={firstImageUrl}
                          alt="Post attachment 1"
                          className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!firstLoaded ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(firstImageUrl)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(0);
                          }}
                        />
                      </div>
                      <div className="overflow-hidden rounded-2xl relative h-[146px]">
                        {!secondLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                        <img
                          src={secondImageUrl}
                          alt="Post attachment 2"
                          className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!secondLoaded ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(secondImageUrl)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(1);
                          }}
                        />
                      </div>
                      <div className="overflow-hidden rounded-2xl relative h-[146px]">
                        {!thirdLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                        <img
                          src={thirdImageUrl}
                          alt="Post attachment 3"
                          className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!thirdLoaded ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(thirdImageUrl)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(2);
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              }

              if (imageCount === 4) {
                return (
                  <>
                    {videoRender}
                    <div className="grid grid-cols-2 gap-2">
                      {imageAttachments.map((attachment, index) => {
                        const imageUrl = getSafeImageURL(attachment, "medium");
                        if (!imageUrl) return null;
                        const isLoaded = loadedImages.has(imageUrl);

                        return (
                          <div key={index} className="w-full overflow-hidden rounded-2xl relative h-[200px]">
                            {!isLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                            <img
                              src={imageUrl}
                              alt={`Post attachment ${index + 1}`}
                              className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                              onLoad={() => handleImageLoad(imageUrl)}
                              onClick={(e) => {
                                e.stopPropagation();
                                openGallery(index);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              }

              // 5 images: Pinterest-style masonry grid
              if (imageCount === 5) {
                const firstImageUrl = getSafeImageURL(imageAttachments[0], "medium");
                if (!firstImageUrl) return null;
                const firstLoaded = loadedImages.has(firstImageUrl);

                return (
                  <>
                    {videoRender}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 row-span-2 overflow-hidden rounded-2xl relative h-[300px]">
                        {!firstLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                        <img
                          src={firstImageUrl}
                          alt="Post attachment 1"
                          className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!firstLoaded ? 'opacity-0' : 'opacity-100'}`}
                          onLoad={() => handleImageLoad(firstImageUrl)}
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(0);
                          }}
                        />
                      </div>
                      {imageAttachments.slice(1, 5).map((attachment, idx) => {
                        const imageUrl = getSafeImageURL(attachment, "medium");
                        if (!imageUrl) return null;
                        const isLoaded = loadedImages.has(imageUrl);

                        return (
                          <div key={idx + 1} className="overflow-hidden rounded-2xl relative h-[146px]">
                            {!isLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                            <img
                              src={imageUrl}
                              alt={`Post attachment ${idx + 2}`}
                              className={`w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                              onLoad={() => handleImageLoad(imageUrl)}
                              onClick={(e) => {
                                e.stopPropagation();
                                openGallery(idx + 1);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              }

              // 6+ images: Pinterest-style masonry grid - All images visible
              return (
                <>
                  {videoRender}
                  <div className="grid grid-cols-3 gap-2 auto-rows-[146px]">
                    {imageAttachments.map((attachment, index) => {
                      // Pinterest-style alternating pattern
                      let gridClass = '';
                      let heightClass = '';

                      if (index === 0) {
                        // First image: large - spans 2 rows
                        gridClass = 'col-span-2 row-span-2';
                        heightClass = 'h-full'; // Use full height of 2 rows
                      } else if (index === 1) {
                        gridClass = '';
                        heightClass = 'h-full';
                      } else if (index === 2) {
                        gridClass = '';
                        heightClass = 'h-full';
                      } else if (index === 3) {
                        gridClass = '';
                        heightClass = 'h-full';
                      } else if (index === 4) {
                        gridClass = 'col-span-2';
                        heightClass = 'h-full';
                      } else {
                        // For remaining images, alternate between single and double span
                        gridClass = index % 5 === 0 ? 'col-span-2' : '';
                        heightClass = 'h-full';
                      }

                      const imageUrl = getSafeImageURL(attachment,"small");
                      if (!imageUrl) return null;
                      const isLoaded = loadedImages.has(imageUrl);

                      return (
                        <div key={index} className={`overflow-hidden rounded-2xl relative ${gridClass}`}>
                          
                          {!isLoaded && <ImageShimmer className="absolute inset-0 w-full h-full" />}
                          <img
                            src={imageUrl}
                            alt={`Post attachment ${index + 1}`}
                            className={`w-full ${heightClass} object-cover cursor-pointer hover:opacity-90 transition-all duration-300 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => handleImageLoad(imageUrl)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openGallery(index);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {nonImageVideoAttachments.map((attachment, index) => (
                    <div key={`non-image-${index}`} className="w-full overflow-hidden mb-2 mt-2 last:mb-0">
                      <div className={`w-full h-48 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {attachment.file.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}

        {/* Polls Section - Compact & Elegant Design */}
        {post.poll && post.poll.length > 0 && (
          <div className="px-0 py-3" style={{ minHeight: '200px' }}>
            <div className="relative">
              {isPollRefreshing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: theme === 'dark' 
                      ? 'rgba(0, 0, 0, 0.3)' 
                      : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold shadow-lg ${
                      theme === 'dark'
                        ? 'bg-black/80 text-white border border-white/20'
                        : 'bg-white/90 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Refreshing poll results...
                  </motion.div>
                </motion.div>
              )}
              <div className={`space-y-3 transition-opacity duration-300 ${isPollRefreshing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {post.poll.map((poll) => {
                const pollKind = poll.kind || 'single';
                const maxSelectable = poll.max_selectable || 1;
                const selectedChoices = selectedPollChoices[poll.id] || [];
                const hasSelectedChoices = selectedChoices.length > 0;
                const isAtMax = selectedChoices.length >= maxSelectable;
                const isSingleChoice = pollKind === 'single';
                const isMultipleChoice = pollKind === 'multiple' || pollKind === 'ranked' || pollKind === 'weighted';

                // Poll kind labels
                const pollKindLabels = {
                  single: { label: 'Single Choice', icon: CircleCheck, color: 'blue' },
                  multiple: { label: 'Multiple Choice', icon: CheckSquare, color: 'purple' },
                  ranked: { label: 'Ranked', icon: ListOrdered, color: 'orange' },
                  weighted: { label: 'Weighted', icon: Scale, color: 'green' }
                };

                const kindInfo = pollKindLabels[pollKind] || pollKindLabels.single;
                const KindIcon = kindInfo.icon;

                return (
                  <motion.div
                    key={poll.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, layout: { duration: 0.3 } }}
                    className={`overflow-hidden ${
                      theme === 'dark'
                        ? 'bg-white/5 border-t border-b border-white/10'
                        : 'bg-white border-t border-b border-gray-200/50'
                    }`}
                    style={{ willChange: 'auto' }}
                  >
                    {/* Compact Poll Header */}
                    <div className={`px-3 py-2.5 border-b ${
                      theme === 'dark' ? 'border-white/10' : 'border-gray-200/50'
                    }`}>
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            theme === 'dark'
                              ? 'bg-white/5 border border-white/10'
                              : 'bg-black/5 border border-black/10'
                          }`}>
                            <BarChart3 className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                            }`} />
                    </div>
                          <h4 className={`font-semibold text-sm tracking-tight ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {poll.question?.en && poll.question.en !== 'Pool Question'
                        ? poll.question.en
                        : 'Poll'}
                    </h4>
                  </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                            kindInfo.color === 'blue'
                              ? theme === 'dark'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                              : kindInfo.color === 'purple'
                              ? theme === 'dark'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-purple-50 text-purple-600 border border-purple-200/50'
                              : kindInfo.color === 'orange'
                              ? theme === 'dark'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-orange-50 text-orange-600 border border-orange-200/50'
                              : theme === 'dark'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-green-50 text-green-600 border border-green-200/50'
                          }`}>
                            <KindIcon className="w-2.5 h-2.5" />
                            {kindInfo.label}
                          </span>
                          {isMultipleChoice && (
                            <span className={`text-[10px] font-medium ${
                              theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                            }`}>
                              Up to {maxSelectable}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compact Poll Choices */}
                    <div className="w-full">
                      {poll.choices && Array.isArray(poll.choices) && poll.choices.length > 0 ? (() => {
                        const sortedChoices = [...poll.choices].sort((a, b) => {
                          // Sort by display_order if available, otherwise maintain original order
                          const orderA = a.display_order ?? 999;
                          const orderB = b.display_order ?? 999;
                          return orderA - orderB;
                        });
                        
                        return sortedChoices.map((choice, choiceIndex) => {
                          const percentage = getChoicePercentage(choice.vote_count, poll);
                          const isSelected = selectedChoices.includes(choice.id);
                          const canSelect = !isAtMax || isSelected;
                          const isDisabled = !canSelect && hasSelectedChoices && !isSelected;
                          const rankPosition = isSingleChoice ? null : selectedChoices.indexOf(choice.id) + 1;
                          const isLastChoice = choiceIndex === sortedChoices.length - 1;

                          const choiceStateClasses = (() => {
                            const isPressing = pressingChoiceId === choice.id;

                            if (theme === 'dark') {
                              if (isSelected) {
                                const base = 'bg-[#0F1726] shadow-[0_8px_26px_rgba(5,11,20,0.55)] cursor-pointer hover:bg-[#141C2D] hover:shadow-[0_10px_28px_rgba(5,11,20,0.65)]';
                                return isPressing ? `${base} bg-[#141F32] shadow-[0_12px_32px_rgba(5,11,20,0.75)]` : base;
                              }
                              if (isDisabled) {
                                return 'bg-slate-950/70 opacity-45 cursor-not-allowed';
                              }
                              const base = 'bg-slate-950/70 hover:bg-[#131B2A] hover:shadow-[0_6px_18px_rgba(3,7,15,0.55)] cursor-pointer transition-all duration-200';
                              return isPressing ? `${base} bg-[#16243A] shadow-[0_10px_26px_rgba(5,11,20,0.65)]` : base;
                            }

                            if (isSelected) {
                              const base = 'bg-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 hover:shadow-md';
                              return isPressing ? `${base} bg-gray-200 shadow-lg` : base;
                            }
                            if (isDisabled) {
                              return 'bg-gray-50 opacity-45 cursor-not-allowed';
                            }
                            const base = 'bg-white hover:bg-gray-50 hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] cursor-pointer transition-all duration-200';
                            return isPressing ? `${base} bg-gray-100 shadow-md` : base;
                          })();

                          // Dotted border-bottom classes - zarif ve profesyonel
                          const borderBottomClass = isLastChoice 
                            ? '' 
                            : theme === 'dark'
                              ? 'border-b border-dotted border-white/8'
                              : 'border-b border-dotted border-gray-200/60';

                        return (
                          <motion.div
                            key={choice.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: choiceIndex * 0.03, duration: 0.2 }}
                            className={`relative px-4 py-3.5 transition-all duration-200 ${choiceStateClasses} ${borderBottomClass}`}
                            onClick={(e) => {
                              if (!isDisabled) {
                                handlePollVote(poll.id, choice.id, pollKind, maxSelectable, e);
                              }
                            }}
                            whileTap={
                              !isDisabled
                                ? {
                                    scale: 0.98,
                                    opacity: 0.92,
                                    filter: theme === 'dark' ? 'brightness(1.02)' : 'brightness(0.98)',
                                  }
                                : undefined
                            }
                            onTapStart={() => !isDisabled && setPressingChoiceId(choice.id)}
                            onTapCancel={() => setPressingChoiceId(prev => (prev === choice.id ? null : prev))}
                            onTap={() => setPressingChoiceId(null)}
                            onPointerUp={() => setPressingChoiceId(prev => (prev === choice.id ? null : prev))}
                            onPointerLeave={() => setPressingChoiceId(prev => (prev === choice.id ? null : prev))}
                          >
                            {/* Compact Selection Indicator */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  theme === 'dark'
                                    ? 'bg-white text-black shadow-lg'
                                    : 'bg-black text-white shadow-lg'
                                }`}
                              >
                                {pollKind === 'ranked' && rankPosition ? (
                                  <span className="text-xs font-bold">#{rankPosition}</span>
                                ) : pollKind === 'weighted' ? (
                                  <Scale className="w-3 h-3" />
                                ) : (
                                  <CircleCheck className="w-3 h-3" />
                                )}
                              </motion.div>
                            )}

                            {/* Choice Label with Rank */}
                            <div className="flex justify-between items-center mb-2.5">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-10">
                                {pollKind === 'ranked' && rankPosition && (
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                    theme === 'dark'
                                      ? 'bg-white/20 text-white border border-white/30'
                                      : 'bg-gray-900/10 text-gray-900 border border-gray-200/50'
                                  }`}>
                                    #{rankPosition}
                                  </div>
                                )}
                                <span className={`font-medium text-sm tracking-tight leading-relaxed ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {choice.label?.en || ''}
                                </span>
                              </div>
                            </div>

                            {/* Compact Progress Bar */}
                            <div className="relative mb-2.5" style={{ minHeight: '8px' }}>
                              <div className={`w-full h-2 rounded-full overflow-hidden ${
                                theme === 'dark' ? 'bg-white/8' : 'bg-gray-200/60'
                              }`}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ 
                                    duration: 0.8, 
                                    ease: [0.4, 0, 0.2, 1],
                                    layout: { duration: 0.3 }
                                  }}
                                  className="h-full rounded-full"
                                  style={{
                                    background: getRankStyle(choiceIndex + 1).background,
                                    willChange: 'width',
                                    boxShadow: theme === 'dark' 
                                      ? '0 0 8px rgba(255, 255, 255, 0.1)' 
                                      : '0 0 8px rgba(0, 0, 0, 0.08)'
                                  }}
                                />
                              </div>
                            </div>

                            {/* Compact Vote Stats */}
                            <div className="flex items-center justify-between pt-0.5">
                              <div className="flex items-center gap-2.5">
                          {/* Voters Avatars */}
                                {(() => {
                                  // Get voters from votes array if available, otherwise use voters array
                                  const voters = choice.votes && choice.votes.length > 0
                                    ? choice.votes.map(vote => ({
                                        id: vote.user_id,
                                        username: vote.user?.username || '',
                                        displayname: vote.user?.displayname || '',
                                        avatar: vote.user?.avatar
                                      }))
                                    : choice.voters?.map(voter => ({
                                        id: voter.id,
                                        username: voter.username,
                                        displayname: voter.displayname,
                                        avatar: undefined
                                      })) || [];
                                  
                                  return voters.length > 0 ? (
                                    <div className="flex items-center">
                                      {voters.slice(0, 5).map((voter, idx) => {
                                        // Get avatar URL using getSafeImageURL
                                        const avatarUrl = voter.avatar 
                                          ? getSafeImageURL(voter.avatar, 'icon') || getSafeImageURL(voter.avatar, 'thumbnail') || getSafeImageURL(voter.avatar, 'small')
                                          : null;
                                        
                                        return (
                                <div
                                  key={voter.id}
                                            className={`w-5 h-5 rounded-full border overflow-hidden flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                              theme === 'dark'
                                                ? 'border-white/10 bg-gray-800/80 text-white ring-1 ring-white/10'
                                                : 'border-black/70 bg-white text-gray-900 ring-1 ring-black/20'
                                    }`}
                                            style={{ marginLeft: idx === 0 ? 0 : -6 }}
                                  title={voter.displayname}
                                >
                                            {avatarUrl ? (
                                              <img
                                                src={avatarUrl}
                                                alt={voter.displayname}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  // Fallback to initial if image fails to load
                                                  const target = e.target as HTMLImageElement;
                                                  target.style.display = 'none';
                                                  const parent = target.parentElement;
                                                  if (parent) {
                                                    parent.innerHTML = voter.displayname.charAt(0).toUpperCase();
                                                  }
                                                }}
                                              />
                                            ) : (
                                              voter.displayname.charAt(0).toUpperCase()
                                            )}
                                </div>
                                        );
                                      })}
                                      {voters.length > 5 && (
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ml-1 ${
                                          theme === 'dark'
                                            ? 'border-white/10 bg-gray-800/80 text-gray-300 ring-1 ring-white/10'
                                            : 'border-black/70 bg-white text-gray-600 ring-1 ring-black/20'
                                        }`}>
                                          +{voters.length - 5}
                                </div>
                              )}
                            </div>
                                  ) : null;
                                })()}
                                <span className={`text-xs font-medium ${
                                  theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                                }`}>
                              {choice.vote_count} vote{choice.vote_count !== 1 ? 's' : ''}
                            </span>
                              </div>
                              <span className={`text-sm font-bold tracking-tight ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                              {percentage}%
                            </span>
                          </div>
                          </motion.div>
                        );
                        });
                      })() : (
                        <div className={`text-center py-4 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                          <span className="text-xs font-medium">No choices available for this poll.</span>
                  </div>
                      )}
                    </div>

                    {/* Compact Selection Info */}
                    {hasSelectedChoices && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`px-3 py-2 border-t ${
                          theme === 'dark'
                            ? 'border-white/10 bg-white/5'
                            : 'border-gray-200/50 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className={`text-xs font-medium ${
                            theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            {isSingleChoice ? (
                              <>Selected: <span className="font-semibold">{poll.choices?.find(c => selectedChoices.includes(c.id))?.label?.en || ''}</span></>
                            ) : (
                              <>
                                Selected <span className="font-bold">{selectedChoices.length}</span> of <span className="font-bold">{maxSelectable}</span>
                                {pollKind === 'ranked' && <span className="ml-1">(in order)</span>}
                              </>
                            )}
                          </span>
                          {isMultipleChoice && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPollChoices(prev => {
                                  const updated = { ...prev };
                                  delete updated[poll.id];
                                  return updated;
                                });
                              }}
                              className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-200 ${
                                theme === 'dark'
                                  ? 'text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/50 hover:border-gray-300'
                              }`}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              Clear
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Compact Total Votes */}
                  {getTotalVotes(poll) > 0 && (
                      <div className={`px-3 py-2 border-t text-center ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white/60'
                          : 'border-gray-200/50 bg-gray-50/50 text-gray-500'
                      }`}>
                        <span className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-white/50' : 'text-gray-400'
                      }`}>
                      {getTotalVotes(poll)} total vote{getTotalVotes(poll) !== 1 ? 's' : ''}
                        </span>
                    </div>
                  )}
                  </motion.div>
                );
              })}
                </div>
            </div>
          </div>
        )}

        {/* Event Section */}
        {post.event && (
          <div className="px-0 py-3">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full overflow-hidden  ${
                theme === 'dark'
                  ? 'bg-white/5 border-t border-b border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                  : 'bg-white border-t border-b border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
              }`}
            >
              {/* Event Header */}
              <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
                theme === 'dark' ? 'border-white/10' : 'border-gray-200/50'
              }`}>
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                      theme === 'dark' 
                        ? 'bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' 
                        : 'bg-black/5 border border-black/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]'
                    }`}>
                      <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        theme === 'dark' ? 'text-white/90' : 'text-gray-900/90'
                    }`} />
                </div>
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Event
                      </h3>
                      <p className={`text-[10px] sm:text-xs font-medium tracking-wide truncate ${
                        theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        Plan with community
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Content */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
                {/* Event Title */}
                <div>
                  <h4 className={`font-bold text-xl sm:text-2xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    {post.event.title?.en || ''}
                  </h4>
                </div>

                {/* Event Description */}
                <div>
                  <p className={`text-base sm:text-lg leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    {post.event.description?.en || ''}
                  </p>
                </div>

                {/* Event Type/Kind */}
                {(() => {
                  const eventKind = post.event.kind || post.event.type;
                  if (!eventKind || !appData?.event_kinds) return null;
                  
                  const eventKindData = appData.event_kinds.find((ek: any) => ek.kind === eventKind);
                  const kindLabel = eventKindData 
                    ? (eventKindData.name?.[defaultLanguage] || eventKindData.name?.en || eventKindData.kind)
                    : eventKind;
                  
                  return (
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`} />
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {kindLabel}
                      </span>
                    </div>
                  );
                })()}

                {/* Event Date & Time */}
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`} />
                  <div>
                    <div className={`text-base font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                      {formatEventTime(post.event.start_time)}
                  </div>
                  </div>
                </div>

                {/* Event Location with Map Preview */}
                  {post.event.location && (
                  <div className="space-y-3">
                    {/* Map Preview */}
                    <div className="relative h-64 sm:h-80 overflow-hidden rounded-xl sm:rounded-2xl">
                      <div
                        ref={eventMapRef}
                        className="w-full h-full relative"
                        style={{
                          zIndex: 1,
                          minHeight: '256px',
                          height: '256px',
                          width: '100%'
                        }}
                      />

                      {/* Apple-Style Location Info Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10"
                      >
                        <div className={`rounded-xl sm:rounded-2xl backdrop-blur-2xl border ${
                          theme === 'dark'
                            ? 'bg-black/60 border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
                            : 'bg-white/90 border-gray-200/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]'
                        }`}>
                          <div className="p-3 sm:p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                                theme === 'dark' 
                                  ? 'bg-white/10 border border-white/20' 
                                  : 'bg-gray-100 border border-gray-200/50'
                              }`}>
                                <MapPin className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {(() => {
                                    const parts = post.event.location.address.split(',');
                                    const city = parts[parts.length - 3]?.trim() || parts[0]?.trim();
                                    const country = parts[parts.length - 1]?.trim();
                                    return city && country ? `${city}, ${country}` : post.event.location.address.split(',')[0];
                                  })()}
                                </p>
                                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium tracking-wide truncate ${
                                  theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                                }`}>
                                  {(() => {
                                    const parts = post.event.location.address.split(',');
                                    return parts.slice(0, -2).join(', ').trim() || 'Exact location';
                                  })()}
                                </p>
                              </div>
                            </div>
                            {/* Open with Google Maps Button */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!post.event?.location) return;
                                const lat = post.event.location.latitude || post.event.location.location_point?.lat;
                                const lng = post.event.location.longitude || post.event.location.location_point?.lng;
                                if (lat && lng) {
                                  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                                  window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                theme === 'dark'
                                  ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20 active:bg-white/20'
                                  : 'bg-gray-100 border border-gray-200/50 text-gray-900 hover:bg-gray-200 active:bg-gray-200'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>Open with Google Maps</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Event Capacity */}
                {post.event.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className={`w-5 h-5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Capacity: <span className="font-semibold">{post.event.capacity}</span> attendees
                    </span>
                  </div>
                )}

                {/* Online Event */}
                {post.event.is_online && (
                  <div className="flex items-center gap-2">
                    <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`} />
                    <div className="flex-1">
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Online Event
                      </span>
                      {post.event.online_url && (
                        <a
                          href={post.event.online_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block text-sm mt-1 text-blue-500 hover:underline ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {post.event.online_url}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Paid Event */}
                {post.event.is_paid && (
                  <div className="flex items-center gap-2">
                    <HandCoins className={`w-5 h-5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Paid Event: <span className="font-semibold">
                        {post.event.price !== undefined && post.event.price !== null 
                          ? `${post.event.price} ${post.event.currency || 'USD'}`
                          : 'Price TBD'}
                      </span>
                    </span>
                    </div>
                  )}

                  {/* Event Attendance Buttons */}
                  <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEventStatus(eventStatus === 'going' ? null : 'going')}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${eventStatus === 'going'
                          ? theme === 'dark'
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                          : theme === 'dark'
                            ? 'border border-gray-600 hover:bg-white/10'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      Going
                    </button>
                    <button
                      onClick={() => setEventStatus(eventStatus === 'not_going' ? null : 'not_going')}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${eventStatus === 'not_going'
                          ? theme === 'dark'
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                          : theme === 'dark'
                            ? 'border border-gray-600 hover:bg-white/10'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      Not Going
                    </button>
                    <button
                      onClick={() => setEventStatus(eventStatus === 'maybe' ? null : 'maybe')}
                      className={`px-4 py-2 rounded-full transition-colors duration-200 ${eventStatus === 'maybe'
                          ? theme === 'dark'
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                          : theme === 'dark'
                            ? 'border border-gray-600 hover:bg-white/10'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      Maybe
                    </button>
                  </div>

                  {/* Attendees */}
                  {post.event.attendees && post.event.attendees.length > 0 && (
                    <div className="mt-4">
                      <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Attendees ({post.event.attendees.length})
                      </div>
                      <div className="flex items-center -space-x-2">
                        {post.event.attendees.slice(0, 10).map((attendee, idx) => (
                          <div
                            key={attendee.id}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${attendee.status === 'going'
                                ? theme === 'dark' ? 'border-white bg-gray-800 text-white' : 'border-gray-900 bg-gray-100 text-gray-900'
                                : attendee.status === 'not_going'
                                  ? theme === 'dark' ? 'border-gray-500 bg-gray-700 text-gray-400' : 'border-gray-400 bg-gray-200 text-gray-600'
                                  : theme === 'dark' ? 'border-gray-300 bg-gray-600 text-gray-300' : 'border-gray-500 bg-gray-300 text-gray-700'
                              }`}
                            style={{ zIndex: 10 - idx }}
                            title={`${attendee.displayname} (${attendee.status === 'going' ? 'Going' : attendee.status === 'not_going' ? 'Not Going' : 'Maybe'})`}
                          >
                            {attendee.displayname.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {post.event.attendees.length > 10 && (
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-600'
                            }`}>
                            +{post.event.attendees.length - 10}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            </motion.div>
          </div>
        )}

        {/* Location Section */}
        {post.location && !post.event && (
          <div className="px-4 py-3">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 sm:mb-8"
            >
              <div className={`rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl ${
                theme === 'dark'
                  ? 'bg-white/5 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                  : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
              }`}>
                {/* Map Preview */}
                <div className="relative h-96 overflow-hidden">
                  <div
                    ref={mapRef}
                    className="w-full h-full relative"
                    style={{
                      zIndex: 1,
                      minHeight: '192px',
                      height: '192px',
                      width: '100%'
                    }}
                  />

                  {/* Apple-Style Location Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10"
                  >
                    <div className={`rounded-xl sm:rounded-2xl backdrop-blur-2xl border ${
                      theme === 'dark'
                        ? 'bg-black/60 border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
                        : 'bg-white/90 border-gray-200/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]'
                    }`}>
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                            theme === 'dark' 
                              ? 'bg-white/10 border border-white/20' 
                              : 'bg-gray-100 border border-gray-200/50'
                          }`}>
                            <MapPin className={`w-5 h-5 sm:w-6 sm:h-6 ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {(() => {
                                const parts = post.location.address.split(',');
                                const city = parts[parts.length - 3]?.trim() || parts[0]?.trim();
                                const country = parts[parts.length - 1]?.trim();
                                return city && country ? `${city}, ${country}` : post.location.address.split(',')[0];
                              })()}
                            </p>
                            <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium tracking-wide truncate ${
                              theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                            }`}>
                              {(() => {
                                const parts = post.location.address.split(',');
                                return parts.slice(0, -2).join(', ').trim() || 'Exact location';
                              })()}
                            </p>
              </div>
            </div>
                        {/* Open with Google Maps Button */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!post.location) return;
                            const lat = post.location.latitude || post.location.location_point?.lat;
                            const lng = post.location.longitude || post.location.location_point?.lng;
                            if (lat && lng) {
                              const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                              window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                            theme === 'dark'
                              ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20 active:bg-white/20'
                              : 'bg-gray-100 border border-gray-200/50 text-gray-900 hover:bg-gray-200 active:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Open with Google Maps</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Engagement Bar */}
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-1 -ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 hover:bg-opacity-10 ${isLiked
                  ? theme === 'dark' ? 'text-red-500 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-500/10'
                  : theme === 'dark' ? 'text-gray-400 hover:text-red-500 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {isLiked ? 1 : 0}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowReply(!showReply);
              }}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 hover:bg-opacity-10 ${theme === 'dark' ? 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-500/10'
                }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>0</span>
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 hover:bg-opacity-10 ${theme === 'dark' ? 'text-gray-400 hover:text-green-500 hover:bg-green-500/10' : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                }`}
            >
              <Share className="w-5 h-5" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>0</span>
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarked(!isBookmarked);
            }}
            className={`flex items-center space-x-1 px-3 py-2 rounded-full transition-colors duration-200 hover:bg-opacity-10 ${isBookmarked
                ? theme === 'dark' ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-yellow-600 hover:bg-yellow-500/10'
                : theme === 'dark' ? 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10'
              }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

      </div>

      {/* PostReply Component - Outside main post div */}
      {showReply && (
        <PostReply
          isOpen={true}
          onClose={() => setShowReply(false)}
          parentPostId={`${post.public_id}`}
          onReply={(content, parentPostId) => {
            console.log('Reply posted:', content, 'Parent ID:', parentPostId);
            setShowReply(false);

            // Refresh parent post (top-level post) to get updated children
            if (onRefreshParent) {
              onRefreshParent();
            }

            // Also refresh local children if in detail view
            if (loadChildren && post.public_id) {
              api.fetchPost(post.public_id)
                .then((response) => {
                  if (response.children) {
                    setChildren(response.children);
                  }
                })
                .catch((error) => {
                  console.error('Error refreshing children:', error);
                });
            }
          }}
        />
      )}

      {/* Children (Replies) Section - Outside main post div */}
      {(loadChildren || showChildren) && (
        <div className={`overflow-hidden border-b ${theme === 'dark'
            ? 'bg-black border-gray-800/40'
            : 'bg-white border-gray-100'
          }`}>
          <div className="px-4 py-3">
            {loadingChildren ? (
              <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading replies...
              </div>
            ) : (children.length > 0 || (post.children && post.children.length > 0)) ? (
              <div className="space-y-4">
                <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Replies ({children.length || post.children?.length || 0})
                </div>
                {(children.length > 0 ? children : post.children || []).map((child) => (
                  <div key={child.id} className={`border-l-2 pl-4 pointer-events-none ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <div className="pointer-events-auto">
                      <Post
                        post={child}
                        onPostClick={onPostClick}
                        onProfileClick={onProfileClick}
                        showChildren={true}
                        onRefreshParent={onRefreshParent}
                        onUpdatePost={onUpdatePost}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {isGalleryOpen && imageAttachments.length > 0 && (() => {

        const currentImage = getSafeImageURL(imageAttachments[selectedImageIndex],"large");
        if (!currentImage) return null;

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              backgroundImage: theme ==="dark" ? 'radial-gradient(transparent 1px, #000000 1px)' : 'radial-gradient(transparent 1px, #000000 1px)',
             
              backdropFilter:`blur(3px)`,
              backgroundColor: 'transparent',

              backgroundSize: '2px 3px',
              transform:"none",
              maskImage: 'linear-gradient(#ffffff calc(100% - 20px), transparent)',
              WebkitMaskImage: 'linear-gradient(#ffffff calc(100% - 20px), transparent)', // Safari için
            }}
         
            
            className={`fixed inset-0 z-50 flex items-center justify-center `}
            onClick={closeGallery}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar - Close Button and Image Counter - Absolute positioned */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4 md:p-6 z-[60]">
              <div className="flex-1" />
              {/* Image Counter - Prominent Display - Optimized for mobile */}
              {imageAttachments.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`px-3 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-3 rounded-full backdrop-blur-xl border ${theme === 'dark'
                      ? 'bg-black/40 border-gray-700/50 text-white'
                      : 'bg-white/40 border-gray-300/50 text-gray-900'
                    }`}
                >
                  <span className="text-sm sm:text-base font-semibold tracking-wide">
                    {selectedImageIndex + 1} / {imageAttachments.length}
                  </span>
                </motion.div>
              )}
              <div className="flex-1 flex justify-end">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeGallery();
                  }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className={`p-2 sm:p-2.5 md:p-3 rounded-full backdrop-blur-xl border transition-all ${theme === 'dark'
                      ? 'bg-black/40 hover:bg-black/50 border-gray-700/50 text-white'
                      : 'bg-white/40 hover:bg-white/50 border-gray-300/50 text-gray-900'
                    }`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>
            </div>

            {/* Main Image Container - Centered with equal padding on all sides - Optimized for mobile */}
            <div
              
           
              className="relative bg-transparent w-full h-full flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-12 xl:p-16"
              onClick={(e) => e.stopPropagation()}
            >
      
      

              {/* Image wrapper - Professional constraints with equal spacing - Mobile optimized */}
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative  z-10 w-full h-full flex items-center justify-center"
              >
                {/* Responsive max constraints - Mobile first approach */}
                <div className="relative w-full h-full flex items-center justify-center" style={{
                  maxWidth: 'min(calc(100vw - 1.5rem), 1400px)',
                  maxHeight: 'min(calc(100vh - 1.5rem), 900px)'
                }}>
            

                  {/* Shimmer loading effect for gallery image - Facebook style */}
                  {!loadedImages.has(currentImage) && (
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden z-20">
                      <ImageShimmer className="absolute inset-0 w-full h-full" />
                    </div>
                  )}

                  {/* Foreground image - Mobile optimized */}
                  <img
                    src={currentImage}
                    alt={`Gallery image ${selectedImageIndex + 1} of ${imageAttachments.length}`}
                    className={`relative max-w-full max-h-full object-cover rounded-xl sm:rounded-2xl shadow-2xl select-none transition-opacity duration-300 ${loadedImages.has(currentImage) ? 'opacity-100' : 'opacity-0'
                      }`}
                    style={{
                      filter: loadedImages.has(currentImage) ? 'drop-shadow(0 0 40px rgba(0,0,0,0.15))' : 'none'
                    }}
                    draggable={false}
                    onLoad={() => handleImageLoad(currentImage)}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      // Mark as loaded even on error to hide shimmer
                      handleImageLoad(currentImage);
                    }}
                  />
                </div>
              </motion.div>

              {/* Navigation Buttons - Positioned on sides, outside image - Mobile optimized */}
              {imageAttachments.length > 1 && (
                <>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className={`absolute left-2 sm:left-4 md:left-6 lg:left-8 z-[60] p-2.5 sm:p-3 md:p-4 rounded-full backdrop-blur-xl border transition-all ${theme === 'dark'
                        ? 'bg-black/40 hover:bg-black/50 border-gray-700/50 text-white'
                        : 'bg-white/40 hover:bg-white/50 border-gray-300/50 text-gray-900'
                      }`}
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className={`absolute right-2 sm:right-4 md:right-6 lg:right-8 z-[60] p-2.5 sm:p-3 md:p-4 rounded-full backdrop-blur-xl border transition-all ${theme === 'dark'
                        ? 'bg-black/40 hover:bg-black/50 border-gray-700/50 text-white'
                        : 'bg-white/40 hover:bg-white/50 border-gray-300/50 text-gray-900'
                      }`}
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        );
      })()}
    </>
  );
};

export default Post;
export type { PostProps, ApiPost };
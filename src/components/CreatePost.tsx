import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Image,
  Smile,
  MapPin,
  Users,
  Globe,
  Lock,
  X,
  Video,
  BarChart3,
  Sparkles,
  Search,
  Plus,
  Minus,
  Clock,
  Navigation,
  Calendar,
  Maximize2,
  Minimize2,
  CircleCheck,
  CheckSquare,
  ListOrdered,
  Scale,
  HandCoins,
  Film,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { ToolbarContext } from '../contexts/ToolbarContext';
import { api } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';

import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';

import {HashtagNode} from '@lexical/hashtag';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {ListNode, ListItemNode} from '@lexical/list';
import {LinkNode, AutoLinkNode} from '@lexical/link';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import ToolbarPlugin from './Lexical/plugins/ToolbarPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot, $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode, INSERT_PARAGRAPH_COMMAND } from 'lexical';
import { MentionNode } from './Lexical/nodes/MentionNode';
import NewMentionsPlugin from './Lexical/plugins/MentionsPlugin';
import ImagesPlugin, { INSERT_IMAGE_COMMAND } from './Lexical/plugins/ImagesPlugin';
import StickerPicker, { StickerItem } from './StickerPicker';
import GifPicker, { GifItem } from './GifPicker';
import YouTubePicker, { YouTubeVideo } from './YouTubePicker';
import { ImageNode } from './Lexical/nodes/ImageNode';
import { YouTubeNode } from './Lexical/nodes/YouTubeNode';
import YouTubePlugin, { INSERT_YOUTUBE_COMMAND } from './Lexical/plugins/YouTubePlugin';
import { INSERT_PAGE_BREAK } from './Lexical/plugins/PageBreakPlugin';
import EmojiPicker from './EmojiPicker';


// ToolbarPlugin wrapper component
const ToolbarPluginWrapper = ({ setEditorInstance }: { setEditorInstance: (editor: any) => void }) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  // Set editor instance when available
  React.useEffect(() => {
    if (editor && setEditorInstance) {
      setEditorInstance(editor);
    }
  }, [editor, setEditorInstance]);

  return (
    <ToolbarContext>
      <ToolbarPlugin
        editor={editor}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />
    </ToolbarContext>
  );
};


interface CreatePostProps {
  title?: string;
  canClose?: boolean;
  onClose?: () => void;
  placeholder?: string;
  buttonText?: string;
  parentPostId?: string;
  fullScreen?:boolean;
  onReply?: (content: string, parentPostId?: string) => void;
  onPostCreated?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ 
  title = "Create Post", 
  canClose = false, 
  onClose,
  placeholder = "What's on your mind? Share your thoughts, experiences, or ask a question...",
  buttonText = "Post",
  parentPostId,
  onReply,
  fullScreen = false,
  onPostCreated
}) => {
  const [postText, setPostText] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [hasEditorContent, setHasEditorContent] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [audience] = useState<'public' | 'community' | 'private'>('public');
  const [polls, setPolls] = useState<Array<{id: string, question: string, options: string[], duration: string, kind: 'single' | 'multiple' | 'ranked' | 'weighted', maxSelectable: number}>>([]);
  const [isPollActive, setIsPollActive] = useState(false);
  const [isEventActive, setIsEventActive] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventKind, setEventKind] = useState<string>('');
  const [eventCapacity, setEventCapacity] = useState<string>('');
  const [eventIsPaid, setEventIsPaid] = useState(false);
  const [eventPrice, setEventPrice] = useState<string>('');
  const [eventCurrency, setEventCurrency] = useState<string>('');
  const [eventIsOnline, setEventIsOnline] = useState(false);
  const [eventOnlineURL, setEventOnlineURL] = useState('');
  const [isEventKindPickerOpen, setIsEventKindPickerOpen] = useState(false);
  const [eventKindSearchQuery, setEventKindSearchQuery] = useState('');
  const eventKindPickerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [location, setLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [pollErrors, setPollErrors] = useState<Record<string, string>>({});
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [isYouTubePickerOpen, setIsYouTubePickerOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);
  const { theme } = useTheme();
  const { data: appData, defaultLanguage } = useApp();
  const { isAuthenticated } = useAuth();
  const maxChars = 500;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined') return;
    import('leaflet')
      .then((mod) => {
        if (mounted) {
          setLeafletLib(mod.default ?? mod);
        }
      })
      .catch((error) => {
        console.error('Failed to load leaflet:', error);
      });
    return () => {
      mounted = false;
    };
  }, []);



  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    setSelectedVideos(prev => [...prev, ...videoFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleStickerSelect = (sticker: StickerItem) => {
    if (!editorInstance) return;
    editorInstance.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: sticker.src,
      altText: sticker.label,
      width: '100%',
      showCaption:false,
      captionsEnabled:false,
      height: '100%',
    });
    editorInstance.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
    
    setIsStickerPickerOpen(false);
  };

  const handleGifSelect = (gif: GifItem) => {
    if (!editorInstance) return;
    editorInstance.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: gif.url,
      altText: gif.description || 'GIF',
      width: '100%',
      height: '100%',
      showCaption: false,
      captionsEnabled: false,
    });
    editorInstance.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
    setIsGifPickerOpen(false);
  };

  const handleYouTubeSelect = (video: YouTubeVideo) => {
    if (!editorInstance) return;
    editorInstance.dispatchCommand(INSERT_YOUTUBE_COMMAND, video.id);
    setIsYouTubePickerOpen(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      console.warn('Create post blocked: unauthenticated user');
      return;
    }

    // Check if there's any content to post
    if (!hasEditorContent && selectedImages.length === 0 && selectedVideos.length === 0) return;
    
    // Validate polls
    const errors: Record<string, string> = {};
    polls.forEach((poll) => {
      // Check if question is empty
      if (!poll.question || poll.question.trim() === '') {
        errors[`poll-${poll.id}-question`] = 'Poll question is required';
      }
      
      // Check if at least 2 options are filled
      const filledOptions = poll.options.filter(opt => opt && opt.trim() !== '');
      if (filledOptions.length < 2) {
        errors[`poll-${poll.id}-options`] = 'At least 2 options are required';
      }
    });
    
    // Validate event if active
    if (isEventActive) {
      // Check if title is empty
      if (!eventTitle || eventTitle.trim() === '') {
        errors['event-title'] = 'Event title is required';
      }
      
      // Check if description is empty
      if (!eventDescription || eventDescription.trim() === '') {
        errors['event-description'] = 'Event description is required';
      }
      
      // Check if event kind is selected
      if (!eventKind || eventKind.trim() === '') {
        errors['event-kind'] = 'Event type is required';
      }
      
      // Check if date is provided
      if (!eventDate || eventDate.trim() === '') {
        errors['event-date'] = 'Event date is required';
      }
      
      // Check if time is provided
      if (!eventTime || eventTime.trim() === '') {
        errors['event-time'] = 'Event time is required';
      }
      
      // Validate date range (not in the past, not more than 2 years in the future)
      if (eventDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const maxDate = new Date(today);
        maxDate.setFullYear(maxDate.getFullYear() + 2);
        
        const [year, month, day] = eventDate.split('-').map(Number);
        const eventDateOnly = new Date(year, month - 1, day);
        eventDateOnly.setHours(0, 0, 0, 0);
        
        // Check if date is in the past
        if (eventDateOnly < today) {
          errors['event-date'] = 'Event date cannot be in the past';
        }
        
        // Check if date is more than 2 years in the future
        if (eventDateOnly > maxDate) {
          errors['event-date'] = 'Event date cannot be more than 2 years in the future';
        }
      }
      
      // Check if date and time are not in the past
      if (eventDate && eventTime) {
        const now = new Date();
        // Reset seconds and milliseconds for accurate comparison
        now.setSeconds(0, 0);
        
        const [year, month, day] = eventDate.split('-').map(Number);
        const [hours, minutes] = eventTime.split(':').map(Number);
        const eventDateTime = new Date(year, month - 1, day, hours, minutes);
        eventDateTime.setSeconds(0, 0);
        
        if (eventDateTime < now) {
          errors['event-datetime'] = 'Event date and time cannot be in the past';
        }
      } else if (!eventDate && eventTime) {
        // If time is provided but date is not, it's invalid
        errors['event-date'] = 'Event date is required when time is provided';
      }
    }
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      setPollErrors(errors);
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[data-poll-error="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Clear any previous errors
    setPollErrors({});
    setIsSubmitting(true);
    
    // Get HTML content, hashtags, and mentions from editor if available
    let htmlContent = '';
    let hashtags: string[] = [];
    let mentions: string[] = [];
    
    if (editorInstance) {
      editorInstance.getEditorState().read(() => {
        const root = $getRoot();
        htmlContent = $generateHtmlFromNodes(editorInstance, null);
        
        // Extract hashtags and mentions from the editor
        const extractHashtags = (node: any): string[] => {
          const tags: string[] = [];
          
          if (node.getType && node.getType() === 'hashtag') {
            const textContent = node.getTextContent();
            if (textContent && textContent.startsWith('#')) {
              tags.push(textContent);
            }
          }
          
          // Recursively search for hashtags in children
          if (node.getChildren) {
            for (const child of node.getChildren()) {
              tags.push(...extractHashtags(child));
            }
          }
          
          return tags;
        };
        
        const extractMentions = (node: any): string[] => {
          const mentions: string[] = [];
          
          if (node.getType && node.getType() === 'mention') {
            const mentionName = (node as any).__mention || node.getTextContent();
            if (mentionName) {
              mentions.push(mentionName);
            }
          }
          
          // Recursively search for mentions in children
          if (node.getChildren) {
            for (const child of node.getChildren()) {
              mentions.push(...extractMentions(child));
            }
          }
          
          return mentions;
        };
        
        hashtags = extractHashtags(root);
        mentions = extractMentions(root);
      });
    }

    const contentJSON = editorInstance.getEditorState().toJSON()
    const postData = {
      content: JSON.stringify(contentJSON),
      hashtags: hashtags,
      mentions: mentions,
      images: selectedImages,
      videos: selectedVideos,
      audience: audience,
      ...(parentPostId && { parentPostId }),
      ...(polls.length > 0 && polls.reduce((acc, poll, pollIndex) => {
        acc[`polls[${pollIndex}].question`] = poll.question;
        acc[`polls[${pollIndex}].duration`] = poll.duration;
        acc[`polls[${pollIndex}].kind`] = poll.kind;
        acc[`polls[${pollIndex}].max_selectable`] = poll.maxSelectable;
        poll.options.forEach((option, optionIndex) => {
          acc[`polls[${pollIndex}].options[${optionIndex}]`] = option;
        });
        return acc;
      }, {} as Record<string, any>)),
      event: isEventActive ? {
        title: eventTitle,
        description: eventDescription,
        kind: eventKind,
        date: eventDate,
        time: eventTime,
        capacity: eventCapacity ? parseInt(eventCapacity) : undefined,
        is_paid: eventIsPaid,
        price: eventPrice ? parseFloat(eventPrice) : undefined,
        currency: eventCurrency || undefined,
        is_online: eventIsOnline,
        online_url: eventOnlineURL || undefined
      } : null,
      location: location
    };
    
    try {
      // Call API to create post
      console.log('Posting data:', postData);
      
      // Call actual API
      await api.handleCreatePost(postData);
      
      // Call onReply callback if it's a reply
      if (onReply && parentPostId) {
        onReply(htmlContent || editorContent, parentPostId);
      }
      
      // Call onPostCreated callback if it's a new post (not a reply)
      if (onPostCreated && !parentPostId) {
        onPostCreated();
      }
      
      // Reset form
      setPostText('');
      setEditorContent('');
      setHasEditorContent(false);
      setSelectedImages([]);
      setSelectedVideos([]);
      setIsExpanded(false);
      setIsPollActive(false);
      setIsEventActive(false);
      setEventTitle('');
      setEventDescription('');
      setEventKind('');
      setEventDate('');
      setEventTime('');
      setEventCapacity('');
      setEventIsPaid(false);
      setEventPrice('');
      setEventCurrency('');
      setEventIsOnline(false);
      setEventOnlineURL('');
      setPolls([]);
      setPollErrors({});
      setCharCount(0);
      setLocation(null);
      
      // Clear editor content
      if (editorInstance) {
        editorInstance.update(() => {
          const root = $getRoot();
          root.clear();
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Location functionality
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'CreatePost-App/1.0'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch address');
        }

        const data = await response.json();

        if (data && data.display_name) {
          setLocation({
            address: data.display_name,
            lat: latitude,
            lng: longitude
          });
          setIsLocationPickerOpen(false);
        } else {
          // Fallback with coordinates
          setLocation({
            address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            lat: latitude,
            lng: longitude
          });
          setIsLocationPickerOpen(false);
        }
      } catch (addressError) {
        console.error('Error fetching address:', addressError);
        // Fallback with coordinates
        setLocation({
          address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          lat: latitude,
          lng: longitude
        });
        setIsLocationPickerOpen(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      let errorMessage = 'Unable to get your location. ';

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
      }

      alert(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Poll helper functions
  const addPoll = () => {
    const newPoll = {
      id: Date.now().toString(),
      question: '',
      options: ['', ''],
      duration: '0',
      kind: 'single' as 'single' | 'multiple' | 'ranked' | 'weighted',
      maxSelectable: 1
    };
    setPolls([...polls, newPoll]);
  };

  const removePoll = (pollId: string) => {
    setPolls(polls.filter(poll => poll.id !== pollId));
    // Clear errors for removed poll
    setPollErrors(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key.includes(`poll-${pollId}-`)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const addPollOption = (pollId: string) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, options: [...poll.options, ''] }
        : poll
    ));
  };

  const removePollOption = (pollId: string, optionIndex: number) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { 
            ...poll, 
            options: poll.options.length > 2 
              ? poll.options.filter((_, i) => i !== optionIndex)
              : poll.options
          }
        : poll
    ));
  };

  const updatePollOption = (pollId: string, optionIndex: number, value: string) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { 
            ...poll, 
            options: poll.options.map((option, i) => 
              i === optionIndex ? value : option
            )
          }
        : poll
    ));
  };

  const updatePollDuration = (pollId: string, duration: string) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, duration }
        : poll
    ));
  };

  const updatePollQuestion = (pollId: string, question: string) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, question }
        : poll
    ));
  };

  const updatePollKind = (pollId: string, kind: 'single' | 'multiple' | 'ranked' | 'weighted') => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, kind, maxSelectable: kind === 'single' ? 1 : poll.maxSelectable }
        : poll
    ));
  };

  const updatePollMaxSelectable = (pollId: string, maxSelectable: number) => {
    setPolls(polls.map(poll => 
      poll.id === pollId 
        ? { ...poll, maxSelectable: Math.max(1, Math.min(maxSelectable, poll.options.length || 1)) }
        : poll
    ));
  };

  // Initialize Leaflet map when location is set
  useEffect(() => {
    if (!location || !mapRef.current || !leafletLib) {
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
        const isMobile = window.innerWidth < 640;
        container.style.width = '100%';
        container.style.height = isMobile ? '192px' : '256px';
        container.style.position = 'relative';
        container.style.zIndex = '1';

        const map = leafletLib.map(container, {
          center: [location.lat, location.lng],
          zoom: 15,
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
        leafletLib.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0cHgiPk1hcCBUaWxlPC90ZXh0Pjwvc3ZnPg=='
        }).addTo(map);

        // Add custom marker
        const customIcon = leafletLib.divIcon({
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

        leafletLib.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);

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
  }, [location, leafletLib]);

  // Close event kind picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventKindPickerRef.current && !eventKindPickerRef.current.contains(event.target as Node)) {
        setIsEventKindPickerOpen(false);
      }
    };

    if (isEventKindPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEventKindPickerOpen]);




  const audienceOptions = [
    { value: 'public', icon: Globe, label: 'Everyone', description: 'Anyone can see this post' },
    { value: 'community', icon: Users, label: 'Community', description: 'Only community members can see this post' },
    { value: 'private', icon: Lock, label: 'Private', description: 'Only you can see this post' },
  ];

  // Event Kinds from context - show all without hardcoded categories
  const eventKinds = useMemo(() => {
    if (!appData?.event_kinds || !Array.isArray(appData.event_kinds)) {
      return [];
    }

    // Process all event kinds from context, sorted by display_order
    return appData.event_kinds
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((eventKind: any) => {
        const label = eventKind.name?.[defaultLanguage] || eventKind.name?.en || eventKind.kind;
        const desc = eventKind.description?.[defaultLanguage] || eventKind.description?.en || '';
        
        return {
          value: eventKind.kind,
          label: label,
          desc: desc
        };
      });
  }, [appData?.event_kinds, defaultLanguage]);


  
  
  const editorConfig = useMemo(() => ({
    namespace: "CoolVibesEditor",
    editable: true,
    isRichText: true,
    selectionAlwaysOnDisplay: true,
    listStrictIndent: false,
    measureTypingPerf: false,
    nodes: [HashtagNode, HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, MentionNode, ImageNode, YouTubeNode],
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
      indent: 'PlaygroundEditorTheme__indent',
      layoutContainer: 'PlaygroundEditorTheme__layoutContainer',
      layoutItem: 'PlaygroundEditorTheme__layoutItem',
      image: 'editor-image',
       hashtag: "hashtag inline-block bg-[linear-gradient(to_right,_#d04b36,_#e36511,_#ffba00,_#00b180,_#147aab,_#675997)]  bg-clip-text text-transparent  font-semibold hover:underline cursor-pointer",
       mention:"mention font-semibold  font-md inline-block bg-[linear-gradient(to_right,_#d04b36,_#e36511,_#ffba00,_#00b180,_#147aab,_#675997)]  bg-clip-text text-transparent  font-semibold hover:underline cursor-pointer"
    },
    onError(error: Error) {
      console.error("Lexical Error:", error);
    },
  }), [theme]);
  


  const onChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      const plainText = root.getTextContent();
      const topLevelChildren = root.getChildren();

      const hasMeaningfulNode = topLevelChildren.some((child: any) => {
        const type = typeof child.getType === 'function' ? child.getType() : null;

        if (type && type !== 'paragraph') {
          return true;
        }

        if (typeof child.isEmpty === 'function' && !child.isEmpty()) {
          return true;
        }

        if (typeof child.getChildrenSize === 'function' && child.getChildrenSize() > 0) {
          return true;
        }

        return false;
      });

      setEditorContent(plainText);
      setHasEditorContent(hasMeaningfulNode || plainText.trim().length > 0);
    });
  };
  

  
  


  return (
    <div style={{
      zIndex:100,
    }} className={`${isFullScreen ? "fixed left-[0] right-[0] bottom-[0] top-[65] scrollbar-hide md:top-0 w-full z-[999] min-h-[100dvh] h-[100dvh] max-h-[100dvh] overflow-y-scroll scrollbar-hide" : "scrollbar-hide"} ${theme === 'dark' ? "bg-gray-950" : "bg-white"}`}>



      {/* Ultra-Professional Create Post Component */}
      <motion.div
        className={`w-full ${isFullScreen ? 'h-full flex  max-h-[calc(100dvh - 200px)] scrollbar-hide overflow-y-scroll  flex-col' : 'flex flex-col'} transition-all duration-500 `}>
        {/* Compact Professional Header */}
        <div className={`${isFullScreen ? 'px-3 sm:px-6 py-2 mb-[400px] lg:mb-0' : 'px-3 sm:px-4 py-2 sm:py-3'} border-b flex-shrink-0 ${
          theme === 'dark' ? 'border-gray-900' : 'border-gray-200/30'
        }`}>
      
          <div className="flex items-center justify-between">
            {/* Left: Title Only */}
            <div className="flex items-center flex-1 min-w-0">
              <h2 className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h2>
            </div>
            
            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Audience Selector - Compact */}
              <motion.button
                className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-900/50 border-gray-900 text-gray-300 hover:bg-gray-900/70 hover:text-white active:bg-gray-900/70' 
                    : 'bg-gray-50/60 border-gray-200/60 text-gray-600 hover:bg-gray-100/80 hover:text-gray-800 active:bg-gray-100/80'
                }`}
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {audienceOptions.find(opt => opt.value === audience)?.icon && 
                  React.createElement(audienceOptions.find(opt => opt.value === audience)!.icon, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" })
                }
                <span className="text-[10px] sm:text-xs font-medium">{audienceOptions.find(opt => opt.value === audience)?.label}</span>
              </motion.button>

              {/* Full Screen Toggle Button - Compact */}
              <motion.button
                onClick={()=>{
                  toggleFullScreen()
                  if(canClose && onClose){
                    
                    onClose()
                  }
                }}
                className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 ${
                  isFullScreen
                    ? theme === 'dark'
                      ? 'bg-gray-900/60 text-white border border-gray-900 active:bg-gray-900/70'
                      : 'bg-black/8 text-black border border-black/15 active:bg-black/15'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-900/50 active:bg-gray-900/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 active:bg-gray-100/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isFullScreen ? "Exit full screen" : "Enter full screen"}
              >
                {isFullScreen ? (
                  <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </motion.button>

              {/* Close Button - Compact */}
              {canClose && onClose && (
                <motion.button
                  onClick={onClose}
                  className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-900/50 active:bg-gray-900/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/60 active:bg-gray-100/60'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Close"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.button>
              )}
            </div>
          </div>

            {/* Main Content Area */}
        <div className={`${isFullScreen ? 'py-1' : 'py-2'} w-full max-w-full flex-shrink-0 !z-0`}>
          <div className="w-full max-w-full">
            {/* Content Input Area */}
            <div className="w-full max-w-full">
              {/* Professional Text Area */}
              <div className="relative w-full max-w-full">
       
              <div className="w-full max-w-full">
                <LexicalComposer  initialConfig={editorConfig}>
                  <div className="relative">
                    <HashtagPlugin/>
                    <ListPlugin/>
                    <LinkPlugin/>
                    <ImagesPlugin  captionsEnabled={false}/>
                    <YouTubePlugin />
                    <NewMentionsPlugin/>
                  
                    <div className="-mx-2 mt-1">
                      <ToolbarPluginWrapper setEditorInstance={setEditorInstance} />
                    </div>

                    <RichTextPlugin
                    
                      contentEditable={
                        <ContentEditable 
                          className="editor-input lexical-editor py-4 px-0"
                          style={{
                            minHeight: isFullScreen ? '50dvh' : '140px',
                            maxHeight: isFullScreen ? '100%' : '100%',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}
                        />
                      }
                      placeholder={
                        <div className="pt-[24px] rounded-sm z-0 p-0 editor-placeholder w-full h-full text-start flex justify-start items-start">
                          {placeholder}
                        </div>
                      }
                      ErrorBoundary={LexicalErrorBoundary}
                    />
                    
                    <OnChangePlugin onChange={onChange} />
                    <AutoFocusPlugin />
                    <HistoryPlugin />
                  </div>
                </LexicalComposer>
              </div>

 
              </div>
            </div>
          </div>
        </div>

        {/* Professional Attachments Section - Scrollable */}
        <div className={`w-full ${isFullScreen ? 'flex-1' : ''}  ${isFullScreen ? 'overflow-y-auto' : ''} scrollbar-hide`}>
        <AnimatePresence>
          {(selectedImages.length > 0 || selectedVideos.length > 0 || location || polls.length > 0 || isEventActive || isEmojiPickerOpen || isStickerPickerOpen || isLocationPickerOpen || isGifPickerOpen || isYouTubePickerOpen) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`w-full max-w-full`}
            >
              {/* Apple-Level Premium Media Gallery */}
              {(selectedImages.length > 0 || selectedVideos.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 sm:mb-8"
                >
                  {/* Apple-Style Elegant Header with Glassmorphism */}
                  <div className="flex items-center justify-between mb-3 sm:mb-5 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                        theme === 'dark' 
                          ? 'bg-gray-900/30 border border-gray-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' 
                          : 'bg-black/5 border border-black/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]'
                      }`}>
                        <Image className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          theme === 'dark' ? 'text-white/90' : 'text-gray-900/90'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-sm sm:text-base font-semibold tracking-tight truncate ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedImages.length + selectedVideos.length} {selectedImages.length + selectedVideos.length === 1 ? 'Media' : 'Media'}
                        </h3>
                        <p className={`text-[10px] sm:text-xs font-medium tracking-wide truncate ${
                          theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          {selectedImages.length > 0 && `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}`}
                          {selectedImages.length > 0 && selectedVideos.length > 0 && ' · '}
                          {selectedVideos.length > 0 && `${selectedVideos.length} video${selectedVideos.length > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setSelectedImages([]);
                        setSelectedVideos([]);
                      }}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-300 backdrop-blur-xl flex-shrink-0 ${
                        theme === 'dark'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40'
                          : 'bg-red-50 text-red-600 border border-red-200/50 hover:bg-red-100 hover:border-red-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All
                    </motion.button>
                  </div>

                  {/* Apple-Level Smart Media Grid */}
                  {(() => {
                    const totalMedia = selectedImages.length + selectedVideos.length;
                    const allMedia = [
                      ...selectedImages.map((file, idx) => ({ type: 'image', file, index: idx })),
                      ...selectedVideos.map((file, idx) => ({ type: 'video', file, index: idx }))
                    ];

                    // Single media - Premium Full Width
                    if (totalMedia === 1) {
                      const media = allMedia[0];
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden ${
                            theme === 'dark' 
                              ? 'bg-gray-900/30 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' 
                              : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                          }`}
                        >
                          {media.type === 'image' ? (
                            <>
                              <img
                                src={URL.createObjectURL(media.file)}
                                alt="Preview"
                                className="w-full h-auto max-h-[400px] sm:max-h-[600px] object-cover"
                              />
                              <motion.button
                                onClick={() => removeImage(media.index)}
                                className="absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300"
                                whileHover={{ scale: 1.08, rotate: 90 }}
                                whileTap={{ scale: 0.92 }}
                              >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-video flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gray-900/50 border border-gray-900 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                                  >
                                    <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                  </motion.div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                                  <p className="text-sm sm:text-base font-semibold text-white truncate">{media.file.name}</p>
                                  <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-1.5 font-medium">{(media.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                </div>
                                <motion.button
                                  onClick={() => removeVideo(media.index)}
                                  className="absolute top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300"
                                  whileHover={{ scale: 1.08, rotate: 90 }}
                                  whileTap={{ scale: 0.92 }}
                                >
                                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </motion.button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    }

                    // Two media - Premium Side by Side
                    if (totalMedia === 2) {
                      return (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {allMedia.map((media, idx) => (
                            <motion.div
                              key={`${media.type}-${idx}`}
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl ${
                                theme === 'dark' 
                                  ? 'bg-gray-900/30 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' 
                                  : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                              }`}
                            >
                              {media.type === 'image' ? (
                                <>
                                  <img
                                    src={URL.createObjectURL(media.file)}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-full min-h-[160px] sm:min-h-[280px] object-cover"
                                  />
                                  <motion.button
                                    onClick={() => removeImage(media.index)}
                                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                    whileHover={{ scale: 1.08, rotate: 90 }}
                                    whileTap={{ scale: 0.92 }}
                                  >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </motion.button>
                                </>
                              ) : (
                                <>
                                  <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-square min-h-[160px] sm:min-h-[280px] flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.2 + 0.2, duration: 0.5 }}
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gray-900/50 border border-gray-900 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                                      >
                                        <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                      </motion.div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{media.file.name}</p>
                                      <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1 font-medium">{(media.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                    <motion.button
                                      onClick={() => removeVideo(media.index)}
                                      className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                      whileHover={{ scale: 1.08, rotate: 90 }}
                                      whileTap={{ scale: 0.92 }}
                                    >
                                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </motion.button>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      );
                    }

                    // Three media - Apple-Style Layout
                    if (totalMedia === 3) {
                      return (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {/* Large left */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className={`row-span-2 relative group rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl ${
                              theme === 'dark' 
                                ? 'bg-gray-900/30 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' 
                                : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                            }`}
                          >
                            {allMedia[0].type === 'image' ? (
                              <>
                                <img
                                  src={URL.createObjectURL(allMedia[0].file)}
                                  alt="Preview 1"
                                  className="w-full h-full min-h-[300px] sm:min-h-[500px] object-cover"
                                />
                                <motion.button
                                  onClick={() => removeImage(allMedia[0].index)}
                                  className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                  whileHover={{ scale: 1.08, rotate: 90 }}
                                  whileTap={{ scale: 0.92 }}
                                >
                                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-[4/5] min-h-[300px] sm:min-h-[500px] flex items-center justify-center">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ delay: 0.2, duration: 0.5 }}
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gray-900/50 border border-gray-900 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                                    >
                                      <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                    </motion.div>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                                    <p className="text-sm sm:text-base font-semibold text-white truncate">{allMedia[0].file.name}</p>
                                    <p className="text-xs sm:text-sm text-white/60 mt-1 sm:mt-1.5 font-medium">{(allMedia[0].file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                  </div>
                                  <motion.button
                                    onClick={() => removeVideo(allMedia[0].index)}
                                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                    whileHover={{ scale: 1.08, rotate: 90 }}
                                    whileTap={{ scale: 0.92 }}
                                  >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                  </motion.button>
                                </div>
                              </>
                            )}
                          </motion.div>
                          {/* Two small right */}
                          {allMedia.slice(1).map((media, idx) => (
                            <motion.div
                              key={`${media.type}-${idx + 1}`}
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (idx + 1) * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl ${
                                theme === 'dark' 
                                  ? 'bg-gray-900/30 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' 
                                  : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                              }`}
                            >
                              {media.type === 'image' ? (
                                <>
                                  <img
                                    src={URL.createObjectURL(media.file)}
                                    alt={`Preview ${idx + 2}`}
                                    className="w-full h-full min-h-[145px] sm:min-h-[245px] object-cover"
                                  />
                                  <motion.button
                                    onClick={() => removeImage(media.index)}
                                    className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                    whileHover={{ scale: 1.08, rotate: 90 }}
                                    whileTap={{ scale: 0.92 }}
                                  >
                                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                  </motion.button>
                                </>
                              ) : (
                                <>
                                  <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-square min-h-[145px] sm:min-h-[245px] flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: (idx + 1) * 0.2 + 0.3, duration: 0.5 }}
                                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gray-900/50 border border-gray-900 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                                      >
                                        <Video className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                      </motion.div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{media.file.name}</p>
                                      <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1 font-medium">{(media.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                    <motion.button
                                      onClick={() => removeVideo(media.index)}
                                      className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                      whileHover={{ scale: 1.08, rotate: 90 }}
                                      whileTap={{ scale: 0.92 }}
                                    >
                                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </motion.button>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      );
                    }

                    // Four or more - Apple-Level Grid Layout
                    return (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {allMedia.map((media, idx) => {
                          // Show first 4, if more show overlay on 4th
                          const showOverlay = idx === 3 && totalMedia > 4;
                          return (
                            <motion.div
                              key={`${media.type}-${idx}`}
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl ${
                                theme === 'dark' 
                                  ? 'bg-gray-900/30 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]' 
                                  : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                              }`}
                            >
                              {media.type === 'image' ? (
                                <>
                                  <img
                                    src={URL.createObjectURL(media.file)}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-full min-h-[140px] sm:min-h-[220px] object-cover"
                                  />
                                  {showOverlay && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-2xl sm:rounded-3xl">
                                      <div className="text-center">
                                        <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">+{totalMedia - 4}</p>
                                        <p className="text-xs sm:text-sm text-white/80 mt-1 sm:mt-2 font-medium">more</p>
                                      </div>
                                    </div>
                                  )}
                                  {!showOverlay && (
                                    <motion.button
                                      onClick={() => removeImage(media.index)}
                                      className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                      whileHover={{ scale: 1.08, rotate: 90 }}
                                      whileTap={{ scale: 0.92 }}
                                    >
                                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </motion.button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-square min-h-[140px] sm:min-h-[220px] flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl backdrop-blur-2xl bg-gray-900/50 border border-gray-900 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
                                      >
                                        <Video className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                                      </motion.div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{media.file.name}</p>
                                      <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1 font-medium">{(media.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                    </div>
                                    {showOverlay && (
                                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-2xl sm:rounded-3xl">
                                        <div className="text-center">
                                          <p className="text-xl sm:text-3xl font-bold text-white tracking-tight">+{totalMedia - 4}</p>
                                          <p className="text-xs sm:text-sm text-white/80 mt-1 sm:mt-2 font-medium">more</p>
                                        </div>
                                      </div>
                                    )}
                                    {!showOverlay && (
                                      <motion.button
                                        onClick={() => removeVideo(media.index)}
                                        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl backdrop-blur-2xl bg-gray-950/80 border border-gray-900 hover:bg-gray-950 active:bg-gray-950 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                                        whileHover={{ scale: 1.08, rotate: 90 }}
                                        whileTap={{ scale: 0.92 }}
                                      >
                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                      </motion.button>
                                    )}
                                  </div>
                                </>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* Apple-Level Premium Polls Section */}
              {polls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 sm:mb-8"
                >
                  <div className={`w-full overflow-visible  ${
                    theme === 'dark'
                      ? 'bg-gray-950 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                      : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                  }`}>
                    {/* Apple-Style Header */}
                    <div className={`px-4  sm:px-6 py-3 sm:py-4 border-b ${
                      theme === 'dark' ? 'border-gray-900' : 'border-gray-200/50'
                    }`}>
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                            theme === 'dark' 
                              ? 'bg-gray-900/30 border border-gray-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' 
                              : 'bg-black/5 border border-black/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]'
                          }`}>
                            <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              theme === 'dark' ? 'text-white/90' : 'text-gray-900/90'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-semibold text-sm sm:text-base tracking-tight truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              Poll{polls.length > 1 ? 's' : ''}
                            </h3>
                            <p className={`text-[10px] sm:text-xs font-medium tracking-wide truncate ${
                              theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                            }`}>
                              {polls.length} question{polls.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => {
                            setPolls([]);
                            setPollErrors({});
                          }}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                            theme === 'dark'
                              ? 'bg-gray-900/50 border border-gray-900 hover:bg-gray-900/70 active:bg-gray-900/70'
                              : 'bg-gray-100 border border-gray-200/50 hover:bg-gray-200 active:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.08, rotate: 90 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <X className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="w-full py-2 flex flex-col gap-2 sm:py-2 space-y-2 sm:space-y-2">
                    {polls.map((poll, pollIndex) => (
                      <motion.div
                        key={poll.id}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: pollIndex * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`w-full overflow-hidden  ${
                          theme === 'dark'
                            ? 'bg-gray-950 border-t border-b border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                            : 'bg-white border-t border-b border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                        }`}
                      >
                        {/* Apple-Style Poll Header */}
                        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                          theme === 'dark' ? 'border-gray-900' : 'border-gray-200/50'
                        }`} data-poll-error={`poll-${poll.id}-question`}>
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                                theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                              }`}>
                                Question
                              </label>
                              <input
                                type="text"
                                placeholder="What would you like to ask?"
                                value={poll.question}
                                onChange={(e) => {
                                  updatePollQuestion(poll.id, e.target.value);
                                  // Clear error when user starts typing
                                  if (pollErrors[`poll-${poll.id}-question`]) {
                                    setPollErrors(prev => {
                                      const updated = { ...prev };
                                      delete updated[`poll-${poll.id}-question`];
                                      return updated;
                                    });
                                  }
                                }}
                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold tracking-tight rounded-xl sm:rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl ${
                                  pollErrors[`poll-${poll.id}-question`]
                                    ? theme === 'dark'
                                      ? 'bg-red-500/10 border-red-500/50 text-white placeholder:text-white/40 focus:border-red-500 focus:ring-red-500/20'
                                      : 'bg-red-50 border-red-500/50 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20'
                                    : theme === 'dark'
                                    ? 'bg-gray-900/30 border-gray-900 text-white placeholder:text-white/40 focus:border-gray-900 focus:ring-gray-900/30'
                                    : 'bg-gray-50 border-gray-200/50 text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:ring-gray-200'
                                }`}
                              />
                              {pollErrors[`poll-${poll.id}-question`] && (
                                <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                                  {pollErrors[`poll-${poll.id}-question`]}
                                </p>
                              )}
                            </div>
                            <motion.button
                              onClick={() => removePoll(poll.id)}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 mt-7 ${
                                theme === 'dark'
                                  ? 'bg-gray-900/50 border border-gray-900 hover:bg-gray-900/70 active:bg-gray-900/70'
                                  : 'bg-gray-100 border border-gray-200/50 hover:bg-gray-200 active:bg-gray-200'
                              }`}
                              whileHover={{ scale: 1.08, rotate: 90 }}
                              whileTap={{ scale: 0.92 }}
                            >
                              <X className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Apple-Style Poll Options */}
                        <div className="px-4 sm:px-6 py-4 sm:py-5" data-poll-error={`poll-${poll.id}-options`}>
                          <label className={`block text-xs sm:text-sm font-medium mb-3 ${
                            theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            Options
                          </label>
                          {pollErrors[`poll-${poll.id}-options`] && (
                            <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                              {pollErrors[`poll-${poll.id}-options`]}
                            </p>
                          )}
                          <div className="space-y-2.5 sm:space-y-3">
                            {poll.options.map((option, optionIndex) => (
                              <motion.div
                                key={optionIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: optionIndex * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center gap-2 sm:gap-3"
                              >
                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-xl ${
                                  theme === 'dark' 
                                    ? 'bg-gray-900/30 border border-gray-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' 
                                    : 'bg-gray-100 border border-gray-200/50'
                                }`}>
                                  <span className={`text-xs sm:text-sm font-bold tracking-tight ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {optionIndex + 1}
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  placeholder={`Option ${optionIndex + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    updatePollOption(poll.id, optionIndex, e.target.value);
                                    // Clear error when user starts typing
                                    if (pollErrors[`poll-${poll.id}-options`]) {
                                      const filledOptions = poll.options.map((opt, idx) => 
                                        idx === optionIndex ? e.target.value : opt
                                      ).filter(opt => opt && opt.trim() !== '');
                                      if (filledOptions.length >= 2) {
                                        setPollErrors(prev => {
                                          const updated = { ...prev };
                                          delete updated[`poll-${poll.id}-options`];
                                          return updated;
                                        });
                                      }
                                    }
                                  }}
                                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl sm:rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl ${
                                    pollErrors[`poll-${poll.id}-options`] && (!option || option.trim() === '')
                                      ? theme === 'dark'
                                        ? 'bg-red-500/10 border-red-500/50 text-white placeholder:text-white/40 focus:border-red-500 focus:ring-red-500/20'
                                        : 'bg-red-50 border-red-500/50 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20'
                                      : theme === 'dark'
                                      ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30'
                                      : 'bg-gray-50 border-gray-200/50 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-200'
                                  }`}
                                />
                                {poll.options.length > 2 && (
                                  <motion.button
                                    onClick={() => removePollOption(poll.id, optionIndex)}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                                      theme === 'dark'
                                        ? 'bg-gray-900/50 border border-gray-900 hover:bg-gray-900/70 active:bg-gray-900/70'
                                        : 'bg-gray-100 border border-gray-200/50 hover:bg-gray-200 active:bg-gray-200'
                                    }`}
                                    whileHover={{ scale: 1.08, rotate: 90 }}
                                    whileTap={{ scale: 0.92 }}
                                  >
                                    <X className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`} />
                                  </motion.button>
                                )}
                              </motion.div>
                            ))}

                            {/* Apple-Style Add Option Button */}
                            <motion.button
                              onClick={() => addPollOption(poll.id)}
                              className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-300 backdrop-blur-xl mt-3 ${
                                theme === 'dark'
                                  ? 'border-gray-900 text-white/60 hover:text-white hover:bg-gray-900/50 hover:border-gray-900 active:bg-gray-900/50'
                                  : 'border-gray-200/50 text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-50'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm font-semibold tracking-tight">Add option</span>
                            </motion.button>
                          </div>
                        </div>

                        {/* Poll Settings - Combined Section */}
                        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-t backdrop-blur-xl ${
                          theme === 'dark' ? 'border-gray-900 bg-gray-950' : 'border-gray-200/50 bg-gray-50/50'
                        }`}>
                          <div className="space-y-4 sm:space-y-5">
                            {/* Poll Type Selection */}
                            <div className="flex flex-col gap-2.5 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                }`} />
                                <span className={`text-xs sm:text-sm font-semibold tracking-tight ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  Poll Type
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                {[
                                  { value: 'single', label: 'Single', icon: CircleCheck, desc: 'One choice' },
                                  { value: 'multiple', label: 'Multiple', icon: CheckSquare, desc: 'Many choices' },
                                  { value: 'ranked', label: 'Ranked', icon: ListOrdered, desc: 'Ordered' },
                                  { value: 'weighted', label: 'Weighted', icon: Scale, desc: 'Prioritized' }
                                ].map((kind) => {
                                  const IconComponent = kind.icon;
                                  return (
                                    <motion.button
                                      key={kind.value}
                                      onClick={() => updatePollKind(poll.id, kind.value as 'single' | 'multiple' | 'ranked' | 'weighted')}
                                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 backdrop-blur-xl flex items-center gap-1.5 sm:gap-2 ${
                                        poll.kind === kind.value
                                          ? theme === 'dark'
                                        ? 'bg-white text-black shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]'
                                        : 'bg-black text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]'
                                      : theme === 'dark'
                                      ? 'bg-gray-900/30 border border-gray-900 text-white/60 hover:text-white hover:bg-gray-900/50 active:bg-gray-900/50'
                                      : 'bg-gray-100 border border-gray-200/50 text-gray-500 hover:text-gray-900 hover:bg-gray-200 active:bg-gray-200'
                                      }`}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      title={kind.desc}
                                    >
                                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span>{kind.label}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Duration Selection */}
                            <div className="flex flex-col gap-2.5 sm:gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                }`} />
                                <span className={`text-xs sm:text-sm font-semibold tracking-tight ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  Duration
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                {[
                                  { value: '0', label: '∞', desc: 'Never ends' },
                                  { value: '1', label: '1d', desc: '1 day' },
                                  { value: '3', label: '3d', desc: '3 days' },
                                  { value: '7', label: '1w', desc: '1 week' },
                                  { value: '30', label: '1m', desc: '1 month' }
                                ].map((duration) => (
                                  <motion.button
                                    key={duration.value}
                                    onClick={() => updatePollDuration(poll.id, duration.value)}
                                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 backdrop-blur-xl ${
                                      poll.duration === duration.value
                                        ? theme === 'dark'
                                          ? 'bg-white text-black shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]'
                                          : 'bg-black text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]'
                                        : theme === 'dark'
                                        ? 'bg-gray-900/30 border border-gray-900 text-white/60 hover:text-white hover:bg-gray-900/50 active:bg-gray-900/50'
                                        : 'bg-gray-100 border border-gray-200/50 text-gray-500 hover:text-gray-900 hover:bg-gray-200 active:bg-gray-200'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={duration.desc}
                                  >
                                    {duration.label}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Max Selectable - Only show for multiple, ranked, or weighted */}
                        {(poll.kind === 'multiple' || poll.kind === 'ranked' || poll.kind === 'weighted') && (
                          <div className={`px-4 sm:px-6 py-4 sm:py-5 border-t backdrop-blur-xl ${
                            theme === 'dark' ? 'border-gray-900 bg-gray-950' : 'border-gray-200/50 bg-gray-50/50'
                          }`}>
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                                }`} />
                                <span className={`text-xs sm:text-sm font-semibold tracking-tight ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  Max Selections
                                </span>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3">
                                {/* Decrease Button */}
                                <motion.button
                                  onClick={() => {
                                    const current = poll.maxSelectable;
                                    if (current > 1) {
                                      updatePollMaxSelectable(poll.id, current - 1);
                                    }
                                  }}
                                  disabled={poll.maxSelectable <= 1}
                                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                                    poll.maxSelectable <= 1
                                      ? theme === 'dark'
                                        ? 'bg-gray-900/20 border border-gray-900 text-white/30 cursor-not-allowed'
                                        : 'bg-gray-100 border border-gray-200/50 text-gray-300 cursor-not-allowed'
                                      : theme === 'dark'
                                      ? 'bg-gray-900/50 border border-gray-900 text-white hover:bg-gray-900/70 active:bg-gray-900/70'
                                      : 'bg-gray-100 border border-gray-200/50 text-gray-900 hover:bg-gray-200 active:bg-gray-200'
                                  }`}
                                  whileHover={poll.maxSelectable > 1 ? { scale: 1.05 } : {}}
                                  whileTap={poll.maxSelectable > 1 ? { scale: 0.95 } : {}}
                                >
                                  <Minus className={`w-4 h-4 sm:w-5 sm:h-5`} />
                                </motion.button>

                                {/* Value Display - Clickable Stepper */}
                                <motion.button
                                  onClick={() => {
                                    const maxOptions = poll.options.filter(opt => opt.trim() !== '').length || 1;
                                    const nextValue = poll.maxSelectable >= maxOptions ? 1 : poll.maxSelectable + 1;
                                    updatePollMaxSelectable(poll.id, nextValue);
                                  }}
                                  className={`flex-1 min-w-[100px] sm:min-w-[120px] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border transition-all duration-300 backdrop-blur-xl flex items-center justify-center gap-2 ${
                                    theme === 'dark'
                                    ? 'bg-gray-900/30 border-gray-900 text-white hover:bg-gray-900/50 hover:border-gray-900 active:bg-gray-900/50'
                                    : 'bg-gray-50 border-gray-200/50 text-gray-900 hover:bg-gray-100 hover:border-gray-300 active:bg-gray-100'
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <span className={`text-lg sm:text-xl font-bold tracking-tight ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {poll.maxSelectable}
                                  </span>
                                  <span className={`text-xs sm:text-sm font-medium ${
                                    theme === 'dark' ? 'text-white/50' : 'text-gray-400'
                                  }`}>
                                    of {poll.options.filter(opt => opt.trim() !== '').length || 1}
                                  </span>
                                </motion.button>

                                {/* Increase Button */}
                                <motion.button
                                  onClick={() => {
                                    const maxOptions = poll.options.filter(opt => opt.trim() !== '').length || 1;
                                    const current = poll.maxSelectable;
                                    if (current < maxOptions) {
                                      updatePollMaxSelectable(poll.id, current + 1);
                                    }
                                  }}
                                  disabled={poll.maxSelectable >= (poll.options.filter(opt => opt.trim() !== '').length || 1)}
                                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                                    poll.maxSelectable >= (poll.options.filter(opt => opt.trim() !== '').length || 1)
                                      ? theme === 'dark'
                                        ? 'bg-gray-900/20 border border-gray-900 text-white/30 cursor-not-allowed'
                                        : 'bg-gray-100 border border-gray-200/50 text-gray-300 cursor-not-allowed'
                                      : theme === 'dark'
                                      ? 'bg-gray-900/50 border border-gray-900 text-white hover:bg-gray-900/70 active:bg-gray-900/70'
                                      : 'bg-gray-100 border border-gray-200/50 text-gray-900 hover:bg-gray-200 active:bg-gray-200'
                                  }`}
                                  whileHover={poll.maxSelectable < (poll.options.filter(opt => opt.trim() !== '').length || 1) ? { scale: 1.05 } : {}}
                                  whileTap={poll.maxSelectable < (poll.options.filter(opt => opt.trim() !== '').length || 1) ? { scale: 0.95 } : {}}
                                >
                                  <Plus className={`w-4 h-4 sm:w-5 sm:h-5`} />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Apple-Level Premium Location Display */}
              {location && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 sm:mb-8"
                >
                  <div className={`rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl ${
                    theme === 'dark'
                      ? 'bg-gray-900/30 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                      : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                  }`}>
                    {/* Map Preview */}
                    <div className="relative h-48 sm:h-64 overflow-hidden">
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
                            ? 'bg-gray-950/80 border-gray-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
                            : 'bg-white/90 border-gray-200/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]'
                        }`}>
                          <div className="p-3 sm:p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                                theme === 'dark' 
                                  ? 'bg-gray-900/50 border border-gray-900' 
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
                                    const parts = location.address.split(',');
                                    const city = parts[parts.length - 3]?.trim() || parts[0]?.trim();
                                    const country = parts[parts.length - 1]?.trim();
                                    return city && country ? `${city}, ${country}` : location.address.split(',')[0];
                                  })()}
                                </p>
                                <p className={`text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium tracking-wide truncate ${
                                  theme === 'dark' ? 'text-white/60' : 'text-gray-500'
                                }`}>
                                  {(() => {
                                    const parts = location.address.split(',');
                                    return parts.slice(0, -2).join(', ').trim() || 'Exact location';
                                  })()}
                                </p>
                              </div>
                              <motion.button
                                onClick={() => setLocation(null)}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                                  theme === 'dark'
                                    ? 'bg-gray-900/50 border border-gray-900 hover:bg-gray-900/70 active:bg-gray-900/70'
                                    : 'bg-gray-100 border border-gray-200/50 hover:bg-gray-200 active:bg-gray-200'
                                }`}
                                whileHover={{ scale: 1.08, rotate: 90 }}
                                whileTap={{ scale: 0.92 }}
                              >
                                <X className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Apple-Level Premium Event Creation Section */}
              {isEventActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 sm:mb-8"
                >
                  <div className={`w-full overflow-visible ${
                    theme === 'dark'
                      ? 'bg-gray-950 border border-gray-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'
                      : 'bg-white border border-gray-200/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                  }`}>
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
                      theme === 'dark' ? 'border-gray-900' : 'border-gray-200/50'
                    }`}>
                      <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl flex-shrink-0 ${
                            theme === 'dark' 
                              ? 'bg-gray-900/30 border border-gray-900 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' 
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
                        <motion.button
                          onClick={() => setIsEventActive(false)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all duration-300 flex items-center justify-center flex-shrink-0 ${
                            theme === 'dark'
                                        ? 'bg-gray-900/50 border border-gray-900 hover:bg-gray-900/70 active:bg-gray-900/70'
                              : 'bg-gray-100 border border-gray-200/50 hover:bg-gray-200 active:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.08, rotate: 90 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <X className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="px-4 w-full py-4 sm:py-6 space-y-3 sm:space-y-4">
                      <div>
                      <input
                        type="text"
                          placeholder="Event title *"
                        value={eventTitle}
                          onChange={(e) => {
                            setEventTitle(e.target.value);
                            // Clear error when user starts typing
                            if (pollErrors['event-title']) {
                              setPollErrors(prev => {
                                const updated = { ...prev };
                                delete updated['event-title'];
                                return updated;
                              });
                            }
                          }}
                          data-poll-error="event-title"
                        className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl sm:rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl ${
                            pollErrors['event-title']
                              ? theme === 'dark'
                                ? 'bg-gray-900/30 border-red-500/50 text-white placeholder-white/40 focus:border-red-500 focus:ring-red-500/20'
                                : 'bg-gray-50 border-red-500/50 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20'
                              : theme === 'dark'
                            ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30'
                            : 'bg-gray-50 border-gray-200/50 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-200'
                        }`}
                      />
                        {pollErrors['event-title'] && (
                          <p className="mt-1.5 text-xs text-red-500">{pollErrors['event-title']}</p>
                        )}
                      </div>

                      <div>
                      <textarea
                          placeholder="Event description *"
                        value={eventDescription}
                          onChange={(e) => {
                            setEventDescription(e.target.value);
                            // Clear error when user starts typing
                            if (pollErrors['event-description']) {
                              setPollErrors(prev => {
                                const updated = { ...prev };
                                delete updated['event-description'];
                                return updated;
                              });
                            }
                          }}
                          data-poll-error="event-description"
                        rows={4}
                        className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl sm:rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none backdrop-blur-xl ${
                            pollErrors['event-description']
                              ? theme === 'dark'
                                ? 'bg-gray-900/30 border-red-500/50 text-white placeholder-white/40 focus:border-red-500 focus:ring-red-500/20'
                                : 'bg-gray-50 border-red-500/50 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20'
                              : theme === 'dark'
                            ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30'
                            : 'bg-gray-50 border-gray-200/50 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-200'
                        }`}
                      />
                        {pollErrors['event-description'] && (
                          <p className="mt-1.5 text-xs text-red-500">{pollErrors['event-description']}</p>
                        )}
                      </div>

                      {/* Event Type Selection */}
                      <div className="w-full h-full]">
                        <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                          theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                        }`}>
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-semibold tracking-tight">Event Type *</span>
                        </label>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setIsEventKindPickerOpen(!isEventKindPickerOpen);
                            if (!isEventKindPickerOpen) {
                              setEventKindSearchQuery('');
                            }
                          }}
                          data-poll-error="event-kind"
                          className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium text-left flex items-center justify-between ${
                            pollErrors['event-kind']
                              ? theme === 'dark'
                                ? 'bg-gray-900/30 border-red-500/60 text-white focus:border-red-500 focus:ring-red-500/30'
                                : 'bg-gray-50 border-red-500/60 text-gray-900 focus:border-red-500 focus:ring-red-500/30'
                              : theme === 'dark'
                              ? 'bg-gray-900/30 border-gray-900 text-white focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                              : 'bg-gray-50 border-gray-300/60 text-gray-900 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <span className={eventKind ? '' : 'opacity-60'}>
                            {eventKind 
                              ? (() => {
                                  const found = eventKinds.find(k => k.value === eventKind);
                                  return found ? found.label : eventKind;
                                })()
                              : 'Select event type'
                            }
                          </span>
                          <motion.div
                            animate={{ rotate: isEventKindPickerOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <X className={`w-5 h-5 transform ${isEventKindPickerOpen ? 'rotate-45' : ''}`} />
                          </motion.div>
                        </motion.button>
                        {pollErrors['event-kind'] && (
                          <p className="mt-2 text-xs text-red-500 font-medium">{pollErrors['event-kind']}</p>
                        )}

                        {/* Event Kind Picker - Dropdown below button */}
                        <AnimatePresence>
                          {isEventKindPickerOpen && (
                            <motion.div
                              ref={eventKindPickerRef}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className={`w-full h-full max-h-[50dvh] overflow-y-scroll scrollbar-hide top-full  mt-2 rounded-xl border border-2  ${
                                theme === 'dark'
                                  ? 'bg-gray-950 border-gray-900'
                                  : 'bg-white border-gray-200/60'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Search Bar */}
                              <div className={`p-3 sm:p-4 border-b ${
                                theme === 'dark' ? 'border-gray-900 bg-gray-950' : 'border-gray-200/50 bg-white'
                              }`}>
                                <div className="relative">
                                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                                    theme === 'dark' ? 'text-white/50' : 'text-gray-400'
                                  }`} />
                                  <input
                                    type="text"
                                    placeholder="Search event types..."
                                    value={eventKindSearchQuery}
                                    onChange={(e) => setEventKindSearchQuery(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 ${
                                      theme === 'dark'
                                        ? 'bg-gray-900 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300 focus:ring-gray-200'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              {/* All Event Kinds - Single column, no grid */}
                              <div className="p-2 sm:p-3">
                                {eventKinds
                                  .filter(kind =>
                                    kind.label.toLowerCase().includes(eventKindSearchQuery.toLowerCase()) ||
                                    kind.desc.toLowerCase().includes(eventKindSearchQuery.toLowerCase()) ||
                                    kind.value.toLowerCase().includes(eventKindSearchQuery.toLowerCase())
                                  )
                                  .map((kind) => (
                                    <motion.button
                                      key={kind.value}
                                      onClick={() => {
                                        setEventKind(kind.value);
                                        setIsEventKindPickerOpen(false);
                                        setEventKindSearchQuery('');
                                        // Clear error when user selects
                                        if (pollErrors['event-kind']) {
                                          setPollErrors(prev => {
                                            const updated = { ...prev };
                                            delete updated['event-kind'];
                                            return updated;
                                          });
                                        }
                                      }}
                                      className={`w-full px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-200 mb-1.5 ${
                                        eventKind === kind.value
                                          ? theme === 'dark'
                                            ? 'bg-white text-black shadow-lg'
                                            : 'bg-black text-white shadow-lg'
                                          : theme === 'dark'
                                          ? 'bg-gray-900/30 hover:bg-gray-900/50 text-white/80 hover:text-white'
                                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                                      }`}
                                      whileHover={{ scale: 1.01 }}
                                      whileTap={{ scale: 0.99 }}
                                    >
                                      <div className="font-semibold">{kind.label}</div>
                                      {kind.desc && (
                                        <div className={`text-xs mt-0.5 ${
                                          eventKind === kind.value
                                            ? theme === 'dark' ? 'text-black/70' : 'text-white/80'
                                            : theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                                        }`}>
                                          {kind.desc}
                                        </div>
                                      )}
                                    </motion.button>
                                  ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Professional Date & Time Selection */}
                      <div className="space-y-4 sm:space-y-5">
                        {/* Date Selection */}
                        <div>
                          <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight">Date *</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={eventDate}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                
                                // Validate maximum date (2 years from now)
                                if (selectedDate) {
                                  const today = new Date();
                                  const maxDate = new Date(today);
                                  maxDate.setFullYear(maxDate.getFullYear() + 2);
                                  const selected = new Date(selectedDate);
                                  
                                  if (selected > maxDate) {
                                    setPollErrors(prev => ({
                                      ...prev,
                                      'event-date': 'Event date cannot be more than 2 years in the future'
                                    }));
                                    return;
                                  }
                                }
                                
                                setEventDate(selectedDate);
                                
                                // Clear errors when user selects date
                                if (pollErrors['event-date'] || pollErrors['event-datetime']) {
                                  setPollErrors(prev => {
                                    const updated = { ...prev };
                                    delete updated['event-date'];
                                    delete updated['event-datetime'];
                                    return updated;
                                  });
                                }
                                
                                // If today is selected and time is set, validate time
                                if (selectedDate && eventTime) {
                                  const today = new Date().toISOString().split('T')[0];
                                  if (selectedDate === today) {
                                    const now = new Date();
                                    const [hours, minutes] = eventTime.split(':').map(Number);
                                    const selectedTime = new Date();
                                    selectedTime.setHours(hours, minutes, 0, 0);
                                    
                                    if (selectedTime < now) {
                                      setPollErrors(prev => ({
                                        ...prev,
                                        'event-datetime': 'Event date and time cannot be in the past'
                                      }));
                                    }
                                  }
                                }
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              max={(() => {
                                const maxDate = new Date();
                                maxDate.setFullYear(maxDate.getFullYear() + 2);
                                return maxDate.toISOString().split('T')[0];
                              })()}
                              data-poll-error="event-date"
                              className={`w-full px-4 sm:px-5 pr-12 sm:pr-14 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium ${
                                pollErrors['event-date'] || pollErrors['event-datetime']
                                  ? theme === 'dark'
                                    ? 'bg-gray-900/30 border-red-500/60 text-white focus:border-red-500 focus:ring-red-500/30'
                                    : 'bg-gray-50 border-red-500/60 text-gray-900 focus:border-red-500 focus:ring-red-500/30'
                                : theme === 'dark'
                                ? 'bg-gray-900/30 border-gray-900 text-white focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                                : 'bg-gray-50 border-gray-300/60 text-gray-900 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                            }`}
                            />
                            <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Calendar className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                theme === 'dark' ? 'text-white/70' : 'text-gray-500'
                              }`} />
                            </div>
                          </div>
                          {pollErrors['event-date'] && !pollErrors['event-datetime'] && (
                            <p className="mt-2 text-xs text-red-500 font-medium">{pollErrors['event-date']}</p>
                          )}
                        </div>

                        {/* Time Selection */}
                        <div>
                          <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight">Time *</span>
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              value={eventTime}
                              onChange={(e) => {
                                const selectedTime = e.target.value;
                                setEventTime(selectedTime);
                                
                                // Clear errors when user selects time
                                if (pollErrors['event-time'] || pollErrors['event-datetime']) {
                                  setPollErrors(prev => {
                                    const updated = { ...prev };
                                    delete updated['event-time'];
                                    delete updated['event-datetime'];
                                    return updated;
                                  });
                                }
                                
                                // If today is selected and time is set, validate time
                                if (eventDate && selectedTime) {
                                  const today = new Date().toISOString().split('T')[0];
                                  if (eventDate === today) {
                                    const now = new Date();
                                    const [hours, minutes] = selectedTime.split(':').map(Number);
                                    const selectedDateTime = new Date();
                                    selectedDateTime.setHours(hours, minutes, 0, 0);
                                    
                                    if (selectedDateTime < now) {
                                      setPollErrors(prev => ({
                                        ...prev,
                                        'event-datetime': 'Event date and time cannot be in the past'
                                      }));
                                    }
                                  }
                                }
                              }}
                              data-poll-error="event-time"
                              className={`w-full px-4 sm:px-5 pr-12 sm:pr-14 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium ${
                                pollErrors['event-time'] || pollErrors['event-datetime']
                                  ? theme === 'dark'
                                    ? 'bg-gray-900/30 border-red-500/60 text-white focus:border-red-500 focus:ring-red-500/30'
                                    : 'bg-gray-50 border-red-500/60 text-gray-900 focus:border-red-500 focus:ring-red-500/30'
                                  : theme === 'dark'
                                  ? 'bg-gray-900/30 border-gray-900 text-white focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                                  : 'bg-gray-50 border-gray-300/60 text-gray-900 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                            }`}
                            />
                            <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Clock className={`w-5 h-5 sm:w-6 sm:h-6 ${
                                theme === 'dark' ? 'text-white/70' : 'text-gray-500'
                              }`} />
                            </div>
                          </div>
                          {pollErrors['event-time'] && !pollErrors['event-datetime'] && (
                            <p className="mt-2 text-xs text-red-500 font-medium">{pollErrors['event-time']}</p>
                          )}
                          {pollErrors['event-datetime'] && (
                            <p className="mt-2 text-xs text-red-500 font-medium">{pollErrors['event-datetime']}</p>
                          )}
                        </div>
                      </div>

                      {/* Event Additional Fields */}
                      <div className="space-y-4 sm:space-y-5">
                        {/* Capacity */}
                        <div>
                          <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight">Capacity</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Maximum number of attendees"
                            value={eventCapacity}
                            onChange={(e) => setEventCapacity(e.target.value)}
                            className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium ${
                              theme === 'dark'
                                ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                                : 'bg-gray-50 border-gray-300/60 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                            }`}
                          />
                        </div>

                        {/* Is Online Toggle */}
                        <div>
                          <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight">Online Event</span>
                          </label>
                          <motion.button
                            type="button"
                            onClick={() => setEventIsOnline(!eventIsOnline)}
                            className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium flex items-center justify-between ${
                              eventIsOnline
                                ? theme === 'dark'
                                ? 'bg-gray-900/50 border-gray-700 text-white'
                                : 'bg-gray-100 border-gray-400 text-gray-900'
                              : theme === 'dark'
                              ? 'bg-gray-900/30 border-gray-700 text-white/90 focus:border-gray-700 focus:ring-gray-700/30 hover:border-gray-700'
                              : 'bg-gray-50 border-gray-300/60 text-gray-900 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <span className={theme === 'dark' && !eventIsOnline ? 'text-white/80' : ''}>{eventIsOnline ? 'Yes' : 'No'}</span>
                            <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                              eventIsOnline
                                ? theme === 'dark' ? 'bg-white' : 'bg-black'
                                : theme === 'dark' ? 'bg-gray-600/60' : 'bg-gray-300'
                            }`}>
                              <motion.div
                                className={`w-5 h-5 rounded-full mt-0.5 ${
                                  theme === 'dark' ? 'bg-white' : 'bg-white'
                                }`}
                                animate={{ x: eventIsOnline ? 26 : 2 }}
                                transition={{ duration: 0.2 }}
                              />
                            </div>
                          </motion.button>
                        </div>

                        {/* Online URL - Only show if IsOnline is true */}
                        {eventIsOnline && (
                          <div>
                            <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                              theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                            }`}>
                              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm font-semibold tracking-tight">Online URL</span>
                            </label>
                            <input
                              type="url"
                              placeholder="https://example.com/meeting"
                              value={eventOnlineURL}
                              onChange={(e) => setEventOnlineURL(e.target.value)}
                              className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium ${
                                theme === 'dark'
                                  ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                                  : 'bg-gray-50 border-gray-300/60 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                              }`}
                            />
                          </div>
                        )}

                        {/* Is Paid Toggle */}
                        <div>
                          <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            <HandCoins className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm font-semibold tracking-tight">Paid Event</span>
                          </label>
                          <motion.button
                            type="button"
                            onClick={() => setEventIsPaid(!eventIsPaid)}
                            className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium flex items-center justify-between ${
                              eventIsPaid
                                ? theme === 'dark'
                                ? 'bg-gray-900/50 border-gray-700 text-white'
                                : 'bg-gray-100 border-gray-400 text-gray-900'
                              : theme === 'dark'
                              ? 'bg-gray-900/30 border-gray-700 text-white/90 focus:border-gray-700 focus:ring-gray-700/30 hover:border-gray-700'
                              : 'bg-gray-50 border-gray-300/60 text-gray-900 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <span className={theme === 'dark' && !eventIsPaid ? 'text-white/80' : ''}>{eventIsPaid ? 'Yes' : 'No'}</span>
                            <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                              eventIsPaid
                                ? theme === 'dark' ? 'bg-white' : 'bg-black'
                                : theme === 'dark' ? 'bg-gray-600/60' : 'bg-gray-300'
                            }`}>
                              <motion.div
                                className={`w-5 h-5 rounded-full mt-0.5 ${
                                  theme === 'dark' ? 'bg-white' : 'bg-white'
                                }`}
                                animate={{ x: eventIsPaid ? 26 : 2 }}
                                transition={{ duration: 0.2 }}
                              />
                            </div>
                          </motion.button>
                        </div>

                        {/* Price and Currency - Only show if IsPaid is true */}
                        {eventIsPaid && (
                          <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                                theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                              }`}>
                                <span className="text-xs sm:text-sm font-semibold tracking-tight">Price</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={eventPrice}
                                onChange={(e) => setEventPrice(e.target.value)}
                                className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium ${
                                  theme === 'dark'
                                    ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                                    : 'bg-gray-50 border-gray-300/60 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 ${
                                theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                              }`}>
                                <span className="text-xs sm:text-sm font-semibold tracking-tight">Currency</span>
                              </label>
                              <input
                                type="text"
                                placeholder="USD"
                                maxLength={8}
                                value={eventCurrency}
                                onChange={(e) => setEventCurrency(e.target.value.toUpperCase())}
                                className={`w-full px-4 sm:px-5 py-4 sm:py-4.5 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-xl font-medium ${
                                  theme === 'dark'
                                    ? 'bg-gray-900/30 border-gray-900 text-white placeholder-white/40 focus:border-gray-900 focus:ring-gray-900/30 hover:border-gray-900'
                                    : 'bg-gray-50 border-gray-300/60 text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-300/40 hover:border-gray-400'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Emoji Picker Inside Attachments */}
              {isEmojiPickerOpen && (
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    // Insert emoji into editor
                    if (editorInstance) {
                      editorInstance.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          selection.insertText(emoji);
                        } else {
                          // If no selection, append to root
                          const root = $getRoot();
                          const lastChild = root.getLastChild();
                          if (lastChild && 'append' in lastChild) {
                            const textNode = $createTextNode(emoji);
                            (lastChild as any).append(textNode);
                          } else {
                            const paragraph = $createParagraphNode();
                            const textNode = $createTextNode(emoji);
                            paragraph.append(textNode);
                            root.append(paragraph);
                          }
                        }
                      });
                    }
                  }}
                  onClose={() => setIsEmojiPickerOpen(false)}
                />
              )}

            {/* Sticker Picker */}
            {isStickerPickerOpen && (
              <StickerPicker
                onStickerSelect={handleStickerSelect}
                onClose={() => setIsStickerPickerOpen(false)}
              />
            )}

            {/* GIF Picker */}
            {isGifPickerOpen && (
              <GifPicker
                onGifSelect={handleGifSelect}
                onClose={() => setIsGifPickerOpen(false)}
                isProcessing={isSubmitting}
              />
            )}

            {/* YouTube Picker */}
            {isYouTubePickerOpen && (
              <YouTubePicker
                onVideoSelect={handleYouTubeSelect}
                onClose={() => setIsYouTubePickerOpen(false)}
                isProcessing={isSubmitting}
              />
            )}

              {/* Compact Location Picker */}
              {isLocationPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-4"
                >
                  <div                   className={`rounded-xl border overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-gray-950 border-gray-900'
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* Compact Header */}
                    <div className={`flex items-center justify-between px-3 py-2 border-b ${
                      theme === 'dark' ? 'border-gray-900' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div                         className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
                        }`}>
                          <MapPin className={`w-3.5 h-3.5 ${
                            theme === 'dark' ? 'text-white' : 'text-black'
                          }`} />
                        </div>
                        <h4 className={`font-semibold text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-black'
                        }`}>
                          Location
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsLocationPickerOpen(false)}
                        className={`p-1 rounded-lg transition-colors ${
                          theme === 'dark'
                            ? 'text-gray-500 hover:text-white hover:bg-gray-900/50'
                            : 'text-gray-400 hover:text-black hover:bg-gray-100'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Compact Content */}
                    <div className="p-3">
                      <motion.button
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isGettingLocation
                            ? theme === 'dark'
                              ? 'bg-gray-900/50 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : theme === 'dark'
                            ? 'bg-gray-900/50 text-white hover:bg-gray-900/70 border border-gray-900'
                            : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                        }`}
                        whileHover={!isGettingLocation ? { scale: 1.02 } : {}}
                        whileTap={!isGettingLocation ? { scale: 0.98 } : {}}
                      >
                        {isGettingLocation ? (
                          <>
                            <div className={`w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin ${
                              theme === 'dark' ? 'border-gray-900' : 'border-gray-400'
                            }`} />
                            <span>Getting location...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Use Current Location</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Compact Action Bar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-2 ${parentPostId ? 'pb-3 sm:pb-2.5' : ''} border-t w-full max-w-full mt-auto flex-shrink-0 ${
            theme === 'dark' ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-200/30'
          }`}
        >
          {/* Compact Action Buttons */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Photo Upload */}
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                selectedImages.some(f => f.type.startsWith('image/'))
                  ? theme === 'dark'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add photos"
            >
              <Image className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Video Upload */}
            <motion.button
              onClick={() => videoInputRef.current?.click()}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                selectedVideos.length > 0
                  ? theme === 'dark'
                    ? 'bg-purple-500/15 text-purple-400'
                    : 'bg-purple-50 text-purple-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add videos"
            >
              <Video className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Poll */}
            <motion.button
              onClick={addPoll}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                polls.length > 0
                  ? theme === 'dark'
                    ? 'bg-gray-900/60 text-white'
                    : 'bg-black/10 text-black'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add a poll"
            >
              <BarChart3 className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Emoji */}
            <motion.button
              onClick={() => {
                const nextState = !isEmojiPickerOpen;
                setIsEmojiPickerOpen(nextState);
                if (nextState) {
                  setIsStickerPickerOpen(false);
                  setIsGifPickerOpen(false);
                  setIsYouTubePickerOpen(false);
                  setIsLocationPickerOpen(false);
                }
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                isEmojiPickerOpen
                  ? theme === 'dark'
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'bg-yellow-50 text-yellow-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add emoji"
            >
              <Smile className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Stickers */}
            <motion.button
              onClick={() => {
                const nextState = !isStickerPickerOpen;
                setIsStickerPickerOpen(nextState);
                if (nextState) {
                  setIsEmojiPickerOpen(false);
                  setIsGifPickerOpen(false);
                  setIsYouTubePickerOpen(false);
                  setIsLocationPickerOpen(false);
                }
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                isStickerPickerOpen
                  ? theme === 'dark'
                    ? 'bg-pink-500/15 text-pink-400'
                    : 'bg-pink-50 text-pink-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add stickers"
            >
              <Sparkles className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* GIFs */}
            <motion.button
              onClick={() => {
                const nextState = !isGifPickerOpen;
                setIsGifPickerOpen(nextState);
                if (nextState) {
                  setIsStickerPickerOpen(false);
                  setIsEmojiPickerOpen(false);
                  setIsYouTubePickerOpen(false);
                  setIsLocationPickerOpen(false);
                }
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                isGifPickerOpen
                  ? theme === 'dark'
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'bg-indigo-50 text-indigo-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add GIF"
            >
              <Film className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* YouTube */}
            <motion.button
              onClick={() => {
                const nextState = !isYouTubePickerOpen;
                setIsYouTubePickerOpen(nextState);
                if (nextState) {
                  setIsStickerPickerOpen(false);
                  setIsEmojiPickerOpen(false);
                  setIsGifPickerOpen(false);
                  setIsLocationPickerOpen(false);
                }
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                isYouTubePickerOpen
                  ? theme === 'dark'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-red-50 text-red-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add YouTube video"
            >
              <Youtube className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Event */}
            <motion.button
              onClick={() => setIsEventActive(!isEventActive)}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                isEventActive
                  ? theme === 'dark'
                    ? 'bg-purple-500/15 text-purple-400'
                    : 'bg-purple-50 text-purple-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Create event"
            >
              <Calendar className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>

            {/* Location */}
            <motion.button
              onClick={() => {
                const nextState = !isLocationPickerOpen;
                setIsLocationPickerOpen(nextState);
                if (nextState) {
                  setIsEmojiPickerOpen(false);
                  setIsStickerPickerOpen(false);
                  setIsGifPickerOpen(false);
                  setIsYouTubePickerOpen(false);
                }
              }}
              className={`flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 flex-shrink-0 ${
                location || isLocationPickerOpen
                  ? theme === 'dark'
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'bg-orange-50 text-orange-600'
                  : theme === 'dark'
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 active:bg-gray-900/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 active:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Add location"
            >
              <MapPin className="w-5 h-5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>

          {/* Compact Post Button */}
          <motion.button
            disabled={!isAuthenticated || (!hasEditorContent && selectedImages.length === 0 && selectedVideos.length === 0) || isSubmitting || charCount > maxChars}
            className={`w-full sm:w-auto sm:min-w-[120px] px-4 sm:px-5 py-3 sm:py-2 rounded-xl sm:rounded-lg font-semibold text-sm transition-all duration-200 flex-shrink-0 text-center ${
              hasEditorContent || selectedImages.length > 0 || selectedVideos.length > 0
                ? theme === 'dark'
                  ? 'bg-white text-black hover:bg-gray-100 active:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900 active:bg-gray-900'
                : theme === 'dark'
                  ? 'bg-gray-900/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
            } ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            whileHover={!isAuthenticated || (!hasEditorContent && selectedImages.length === 0 && selectedVideos.length === 0) || isSubmitting ? {} : { scale: 1.02 }}
            whileTap={!isAuthenticated || (!hasEditorContent && selectedImages.length === 0 && selectedVideos.length === 0) || isSubmitting ? {} : { scale: 0.98 }}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-t-transparent rounded-full animate-spin ${
                  theme === 'dark' ? 'border-gray-900' : 'border-white'
                }`} />
                <span className="text-xs sm:text-sm">Publishing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm">{buttonText}</span>
              </div>
            )}
          </motion.button>
        </div>
        </div>

      
      </motion.div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />




    </div>
  );
};

export default CreatePost;

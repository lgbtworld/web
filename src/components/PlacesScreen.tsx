import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapPin, Search, Loader, RefreshCw, Grid, Map as MapIcon, Plus, Minus, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import PlaceMarker from './Map/PlaceMarker';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../services/api';
import { Place } from '../types/places';
import PlaceCard from './PlaceCard';
import { DEFAULT_LIMIT } from '../constants/constants';
import { useTranslation } from 'react-i18next';
import Container from './Container';
import { useNavigate } from 'react-router-dom';

type CursorType = {
  next: string | null;
  distance: number | null;
} | null;

const PlaceCardSkeleton = () => {
  const { theme } = useTheme();
  return (
    <div className={`rounded-2xl animate-pulse overflow-hidden border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className={`w-full aspect-video ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
      <div className="p-4 space-y-3">
        <div className={`h-5 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
        <div className="flex items-center gap-2 pt-1">
          <div className={`w-4 h-4 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
          <div className={`h-3 rounded-md w-1/2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
        </div>
        <div className="space-y-1 pt-1">
          <div className={`h-3 rounded-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
          <div className={`h-3 rounded-md w-5/6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
};

const PlacesScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [places, setPlaces] = useState<Place[]>([]);
  const [cursor, setCursor] = useState<CursorType>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const fetchNearbyPlaces = useCallback(
    async (
      { center, reset = false }:
        { center: { latitude: number; longitude: number }; reset?: boolean }
    ) => {
      const isAppend = !reset;

      if (isAppend && loadingMore) return;

      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoadingInitial(true);
      }
      setError(null);

      const cursorToUse = reset ? null : cursor;

      try {
        const response = await api.fetchNearbyPlaces(
          center.latitude,
          center.longitude,
          cursorToUse?.next || null,
          cursorToUse?.distance ? String(cursorToUse.distance) : null,
          DEFAULT_LIMIT
        );

        if (response && response.places) {
          setPlaces((prev: Place[]) => {
            if (reset) return response.places;
            const existingIds = new Set(prev.map(p => p.public_id));
            const newPlaces = response.places.filter((p: Place) => !existingIds.has(p.public_id));
            return [...prev, ...newPlaces];
          });

          if (response.cursor && response.cursor.next) {
            setCursor({
              next: response.cursor.next,
              distance: response.cursor.distance || null
            });
          } else {
            setCursor(null);
          }
        } else {
          setCursor(null);
          throw new Error(response?.error || t('places.no_places'));
        }
      } catch (err: any) {
        console.error('Mekanlar alınırken hata:', err);
        setError(err.message || t('places.no_places'));
        setCursor(null);
      } finally {
        if (isAppend) {
          setLoadingMore(false);
        } else {
          setLoadingInitial(false);
        }
      }
    },
    [cursor, loadingInitial, loadingMore, t]
  );

  const handleInitialFetch = useCallback(() => {
    setLoadingInitial(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(loc);
        setPlaces([]);
        setCursor(null);
        fetchNearbyPlaces({ center: loc, reset: true });
      },
      (geoError) => {
        console.error('Konum hatası:', geoError);
        setError(t('places.location_permission_error'));
        setLoadingInitial(false);
      }
    );
  }, [fetchNearbyPlaces, t]);

  useEffect(() => {
    handleInitialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const allHashtags = places.flatMap((p: Place) => p.hashtags.map((h: any) => h.tag));
    const uniqueHashtags = [...new Set(allHashtags)];
    return ['all', ...uniqueHashtags.slice(0, 10)];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place: Place) => {
      if (selectedCategory !== 'all' && !place.hashtags.some((h: any) => h.tag === selectedCategory)) {
        return false;
      }
      if (searchQuery) {
        const name = place.extras.place.name.toLowerCase();
        const description = place.extras.place.description.toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || description.includes(query);
      }
      return true;
    });
  }, [places, selectedCategory, searchQuery]);

  const observerTarget = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(cursor);
  const loadingMoreRef = useRef(loadingMore);
  const locationRef = useRef(location);
  const isRequestPendingRef = useRef(false);

  useEffect(() => { cursorRef.current = cursor; }, [cursor]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  useEffect(() => { locationRef.current = location; }, [location]);

  const loadMore = useCallback(async () => {
    if (isRequestPendingRef.current || !cursorRef.current || !locationRef.current) return;

    isRequestPendingRef.current = true;
    await fetchNearbyPlaces({ center: locationRef.current });

    // Add a small delay to prevent immediate re-trigger by observer
    setTimeout(() => {
      isRequestPendingRef.current = false;
    }, 500);
  }, [fetchNearbyPlaces]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursorRef.current && !loadingMoreRef.current && !isRequestPendingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [loadMore]);

  const MapEventsHandler = ({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) => {
    useMapEvents({
      moveend: (e) => {
        const center = e.target.getCenter();
        onMoveEnd(center.lat, center.lng);
      },
    });
    return null;
  };

  const handleMapMove = useCallback((lat: number, lng: number) => {
    const newLoc = { latitude: lat, longitude: lng };
    setLocation(newLoc);
    // When moving the map, we treat it as a "load more" or "discovery" in the new area.
    // We don't reset the list to allow the user to see all items they've found.
    fetchNearbyPlaces({ center: newLoc });
  }, [fetchNearbyPlaces]);

  const MapControls = () => {
    const map = useMap();

    const handleLocate = () => {
      map.locate({ setView: true, maxZoom: 16 });
    };

    return (
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[400]">
        <button
          onClick={() => map.zoomIn()}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={handleLocate}
          className="w-12 h-12 flex items-center justify-center bg-purple-600 text-white rounded-2xl shadow-xl hover:bg-purple-700 transition-all mt-2"
          title="My Location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderGrid = () => (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlaces.map(place => (
          <PlaceCard
            key={place.public_id}
            place={place}
            selected={false}
            onClick={p => navigate(`/places/${p.public_id}`, { state: { place: p } })}
            className={`rounded-2xl border ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
              }`}
          />
        ))}
      </div>
      <div ref={observerTarget} className="h-10 w-full flex items-center justify-center">
        {loadingMore && (
          <div className="flex items-center justify-center gap-2 text-sm p-4">
            <Loader className="w-5 h-5 animate-spin" />
            <span>{t('places.loading_more')}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Use a ref for the initial center to prevent the MapContainer from re-rendering/re-mounting
  // when the user drags and updates the 'location' state.
  const initialCenter = useRef<[number, number] | null>(null);
  if (!initialCenter.current && location) {
    initialCenter.current = [location.latitude, location.longitude];
  }

  const defaultCenter: [number, number] = initialCenter.current || [41.0082, 28.9784];

  const renderMap = useMemo(() => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-[calc(100dvh-200px)] sm:h-[calc(100dvh-140px)] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl relative z-0 bg-gray-100 dark:bg-gray-900"
      >
        <MapContainer
          key={`map-${theme}`}
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          preferCanvas={true}
        >
          <TileLayer
            key={`tile-${theme}`}
            attribution='&copy; CARTO'
            url={theme === 'dark'
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'}
            keepBuffer={2}
          />
          <MapEventsHandler onMoveEnd={handleMapMove} />

          {filteredPlaces.map((place: Place) => (
            <PlaceMarker
              key={place.public_id}
              place={place}
              selected={selectedPlaceId === place.public_id}
              onClick={(p: Place) => {
                setSelectedPlaceId(p.public_id);
                navigate(`/places/${p.public_id}`, { state: { place: p } });
              }}
            />
          ))}

          <MapControls />
        </MapContainer>
      </motion.div>
    );
  }, [theme, filteredPlaces, selectedPlaceId, handleMapMove, navigate, defaultCenter]);

  const renderContent = () => {
    if (loadingInitial && places.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={`rounded-2xl p-6 mt-4 border text-center ${theme === 'dark' ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          <p className="text-sm font-medium mb-3">{error}</p>
          <button type="button" onClick={handleInitialFetch} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${theme === 'dark' ? 'bg-red-900/50 hover:bg-red-900/70' : 'bg-red-100 hover:bg-red-200'
            }`}>
            <RefreshCw className="w-4 h-4" />
            {t('places.retry', 'Tekrar dene')}
          </button>
        </div>
      );
    }

    if (filteredPlaces.length === 0) {
      return (
        <div className="py-16 text-center">
          <MapPin className={`mx-auto w-12 h-12 mb-4 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} />
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            {t('places.no_places_found_title', 'No places found')}
          </h3>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('places.no_places_found_subtitle', 'Try adjusting your search or filters.')}
          </p>
        </div>
      );
    }

    if (viewMode === 'map') {
      return renderMap;
    }

    return renderGrid();
  };

  return (
    <Container>
      <div className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'border-gray-800/50 bg-black/95' : 'border-gray-200/50 bg-white/95'
        }`}>
        <div className="w-full flex flex-row items-center justify-between gap-2 p-2 px-2 max-w-7xl mx-auto">
          <div className="hidden md:flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
              }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('places.title')}
              </h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('places.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex flex-1 md:flex-initial flex-col sm:flex-row gap-2 justify-end">
            <div className={`relative flex-1 min-w-[180px] rounded-xl ${theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'
              }`}>
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                placeholder={t('places.search_placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`block w-full pl-9 pr-3 py-2.5 text-sm bg-transparent rounded-xl border-0 focus:ring-0 ${theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                  ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'map'
                  ? theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
            <button type="button" onClick={handleInitialFetch} disabled={loadingInitial} className={`px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-900 border border-gray-800 text-gray-200 hover:bg-gray-800' : 'bg-gray-100 border border-gray-200 text-gray-800 hover:bg-gray-200'
              }`}>
              <RefreshCw className={`w-4 h-4 ${loadingInitial && places.length === 0 ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {categories.length > 1 && (
          <div className="w-full max-w-7xl mx-auto px-2 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat: any) => {
                const isAll = cat === 'all';
                const isSelected = selectedCategory === cat;
                return (
                  <button key={cat} type="button" onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${theme === 'dark'
                    ? isSelected
                      ? 'bg-gray-800 text-white border-gray-700'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'
                    : isSelected
                      ? 'bg-gray-100 text-gray-800 border-gray-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}>
                    {isAll ? t('places.all_categories', 'Tümü') : `#${cat}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="w-full mx-auto max-w-7xl p-2">
        {renderContent()}
      </div>
    </Container>
  );
};

export default PlacesScreen;
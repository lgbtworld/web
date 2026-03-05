import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
    MapPin,
    Clock,
    Home,
    Car,
    Building2,
    Wallet,
    Heart,
    Zap,
    MessageSquare,
    Banknote,
    Moon,
    Coffee,
    Smile,
    ShieldCheck,
    Hand,
    X,
    Globe,
    Radar,
    Send,
    Minimize2,
    Maximize2,
    Minus
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../contexts/ThemeContext';

// Fix Leaflet marker icon issue
import 'leaflet/dist/leaflet.css';

type TagCategory = 'capacity' | 'intent' | 'availability' | 'personality' | 'safety';

interface CheckInTag {
    id: string;
    tag: string;
    name: { en: string; tr: string };
    icon: any;
    category: TagCategory;
}

interface CheckIn {
    id: string;
    user: {
        displayname: string;
        username: string;
        avatar: string;
    };
    location: [number, number];
    shout?: string;
    tags: string[];
    timestamp: string;
}

const CHECKIN_TAGS: CheckInTag[] = [
    { id: '1', tag: 'has_place', name: { en: 'Has Place', tr: 'Mekanı Var' }, icon: Home, category: 'capacity' },
    { id: '2', tag: 'has_vehicle', name: { en: 'Has Vehicle', tr: 'Aracı Var' }, icon: Car, category: 'capacity' },
    { id: '3', tag: 'owns_home', name: { en: 'Owns Home', tr: 'Evi Var' }, icon: Building2, category: 'capacity' },
    { id: '4', tag: 'has_money', name: { en: 'Has Money', tr: 'Parası Var' }, icon: Wallet, category: 'capacity' },
    { id: '5', tag: 'seeking_love', name: { en: 'Seeking Love', tr: 'Aşk Arıyor' }, icon: Heart, category: 'intent' },
    { id: '6', tag: 'seeking_fun', name: { en: 'Seeking Fun', tr: 'Takılmak İstiyor' }, icon: Zap, category: 'intent' },
    { id: '7', tag: 'seeking_chat', name: { en: 'Seeking Chat', tr: 'Sohbet Etmek İstiyor' }, icon: MessageSquare, category: 'intent' },
    { id: '8', tag: 'paid_meeting', name: { en: 'Paid Meeting', tr: 'Ücretli Görüşüyor' }, icon: Banknote, category: 'intent' },
    { id: '9', tag: 'available_now', name: { en: 'Available Now', tr: 'Şu An Müsait' }, icon: Clock, category: 'availability' },
    { id: '10', tag: 'night_only', name: { en: 'Night Only', tr: 'Gece Uygun' }, icon: Moon, category: 'availability' },
    { id: '11', tag: 'chill', name: { en: 'Chill', tr: 'Sakin' }, icon: Coffee, category: 'personality' },
    { id: '12', tag: 'fun', name: { en: 'Fun', tr: 'Eğlenceli' }, icon: Smile, category: 'personality' },
    { id: '13', tag: 'respectful', name: { en: 'Respectful', tr: 'Saygılı' }, icon: ShieldCheck, category: 'safety' },
    { id: '14', tag: 'no_pressure', name: { en: 'No Pressure', tr: 'Israrcı Değil' }, icon: Hand, category: 'safety' },
    { id: '15', tag: 'sporty', name: { en: 'Sporty', tr: 'Sporcu' }, icon: Zap, category: 'personality' },
    { id: '16', tag: 'gamer', name: { en: 'Gamer', tr: 'Oyuncu' }, icon: Zap, category: 'personality' },
    { id: '17', tag: 'traveler', name: { en: 'Traveler', tr: 'Gezgin' }, icon: Globe, category: 'personality' },
    { id: '18', tag: 'foodie', name: { en: 'Foodie', tr: 'Gurme' }, icon: Coffee, category: 'personality' },
    { id: '19', tag: 'music_lover', name: { en: 'Music Lover', tr: 'Müzik Sever' }, icon: Zap, category: 'personality' },
];

const MOCK_CHECKINS: CheckIn[] = [
    {
        id: 'c1',
        user: { displayname: 'Alex Rivera', username: 'arivera', avatar: 'https://i.pravatar.cc/150?u=arivera' },
        location: [41.0082, 28.9784],
        shout: 'Best oat latte in town! ☕️',
        tags: ['has_place', 'chill', 'available_now'],
        timestamp: '2m ago'
    },
    {
        id: 'c2',
        user: { displayname: 'Sam Taylor', username: 'staylor', avatar: 'https://i.pravatar.cc/150?u=staylor' },
        location: [41.0152, 28.9824],
        shout: 'The music is amazing tonight! 🌈✨',
        tags: ['seeking_fun', 'fun', 'has_vehicle'],
        timestamp: '15m ago'
    },
    {
        id: 'c3',
        user: { displayname: 'Jordan Lee', username: 'jlee', avatar: 'https://i.pravatar.cc/150?u=jlee' },
        location: [41.0122, 28.9754],
        shout: 'Anyone up for a quick ride?',
        tags: ['has_vehicle', 'chill'],
        timestamp: '20m ago'
    },
    {
        id: 'c4',
        user: { displayname: 'Casey Smith', username: 'csmith', avatar: 'https://i.pravatar.cc/150?u=csmith' },
        location: [41.0202, 28.9854],
        shout: 'Just chilling at home 🏠',
        tags: ['owns_home', 'available_now'],
        timestamp: '25m ago'
    },
    {
        id: 'c5',
        user: { displayname: 'Riley Davis', username: 'rdavis', avatar: 'https://i.pravatar.cc/150?u=rdavis' },
        location: [41.0052, 28.9714],
        shout: '',
        tags: ['seeking_love', 'respectful'],
        timestamp: '30m ago'
    },
    {
        id: 'c6',
        user: { displayname: 'Morgan White', username: 'mwhite', avatar: 'https://i.pravatar.cc/150?u=mwhite' },
        location: [41.0182, 28.9904],
        shout: 'Looking for a fun night out!',
        tags: ['seeking_fun', 'night_only'],
        timestamp: '45m ago'
    },
    {
        id: 'c7',
        user: { displayname: 'Jamie Brown', username: 'jbrown', avatar: 'https://i.pravatar.cc/150?u=jbrown' },
        location: [41.0012, 28.9684],
        shout: 'Let\'s chat over coffee ☕',
        tags: ['seeking_chat', 'chill'],
        timestamp: '1h ago'
    },
    {
        id: 'c8',
        user: { displayname: 'Taylor Green', username: 'tgreen', avatar: 'https://i.pravatar.cc/150?u=tgreen' },
        location: [41.0252, 28.9804],
        shout: '',
        tags: ['has_money', 'paid_meeting'],
        timestamp: '1h 15m ago'
    },
    {
        id: 'c9',
        user: { displayname: 'Drew Hall', username: 'dhall', avatar: 'https://i.pravatar.cc/150?u=dhall' },
        location: [41.0092, 28.9764],
        shout: 'No pressure, just good vibes',
        tags: ['no_pressure', 'respectful'],
        timestamp: '1h 30m ago'
    },
    {
        id: 'c10',
        user: { displayname: 'Quinn Adams', username: 'qadams', avatar: 'https://i.pravatar.cc/150?u=qadams' },
        location: [41.0142, 28.9834],
        shout: '',
        tags: ['sporty', 'available_now'],
        timestamp: '2h ago'
    },
    {
        id: 'c11',
        user: { displayname: 'Avery Baker', username: 'abaker', avatar: 'https://i.pravatar.cc/150?u=abaker' },
        location: [41.0042, 28.9744],
        shout: 'Gaming tonight 🎮',
        tags: ['gamer', 'night_only'],
        timestamp: '2h 15m ago'
    },
    {
        id: 'c12',
        user: { displayname: 'Skyler Hill', username: 'shill', avatar: 'https://i.pravatar.cc/150?u=shill' },
        location: [41.0222, 28.9814],
        shout: 'Just passing through town',
        tags: ['traveler', 'chill'],
        timestamp: '2h 30m ago'
    },
    {
        id: 'c13',
        user: { displayname: 'Robin Scott', username: 'rscott', avatar: 'https://i.pravatar.cc/150?u=rscott' },
        location: [41.0072, 28.9884],
        shout: 'Looking for the best food around here',
        tags: ['foodie', 'seeking_fun'],
        timestamp: '3h ago'
    },
    {
        id: 'c14',
        user: { displayname: 'Cameron Young', username: 'cyoung', avatar: 'https://i.pravatar.cc/150?u=cyoung' },
        location: [41.0162, 28.9724],
        shout: 'Where\'s the live music?',
        tags: ['music_lover', 'night_only'],
        timestamp: '3h 15m ago'
    },
    {
        id: 'c15',
        user: { displayname: 'Rowan King', username: 'rking', avatar: 'https://i.pravatar.cc/150?u=rking' },
        location: [41.0032, 28.9794],
        shout: 'Hosting a small get-together 🎉',
        tags: ['has_place', 'fun'],
        timestamp: '3h 30m ago'
    },
    {
        id: 'c16',
        user: { displayname: 'Blake Evans', username: 'bevans', avatar: 'https://i.pravatar.cc/150?u=bevans' },
        location: [41.0192, 28.9864],
        shout: '',
        tags: ['seeking_love', 'chill'],
        timestamp: '4h ago'
    },
    {
        id: 'c17',
        user: { displayname: 'Reese Stone', username: 'rstone', avatar: 'https://i.pravatar.cc/150?u=rstone' },
        location: [41.0062, 28.9694],
        shout: 'Let\'s go for a drive 🚘',
        tags: ['has_vehicle', 'seeking_chat'],
        timestamp: '4h 30m ago'
    },
    {
        id: 'c18',
        user: { displayname: 'Harley Ford', username: 'hford', avatar: 'https://i.pravatar.cc/150?u=hford' },
        location: [41.0112, 28.9844],
        shout: '',
        tags: ['paid_meeting', 'respectful'],
        timestamp: '5h ago'
    },
    {
        id: 'c19',
        user: { displayname: 'Emery Fox', username: 'efox', avatar: 'https://i.pravatar.cc/150?u=efox' },
        location: [41.0212, 28.9734],
        shout: 'Available later tonight',
        tags: ['night_only', 'seeking_fun'],
        timestamp: '5h 30m ago'
    },
    {
        id: 'c20',
        user: { displayname: 'Peyton Cole', username: 'pcole', avatar: 'https://i.pravatar.cc/150?u=pcole' },
        location: [41.0022, 28.9774],
        shout: 'Just looking to chat 🤙',
        tags: ['seeking_chat', 'no_pressure'],
        timestamp: '6h ago'
    }
];

// Custom Radar Marker Icon (Using Black/White theme for CoolVibes)
const createRadarIcon = (theme: string) => {
    const color = theme === 'dark' ? 'white' : 'black';
    const opacityPing = theme === 'dark' ? 'opacity-20' : 'opacity-10';
    return L.divIcon({
        className: 'custom-radar-icon',
        html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-${color} ${opacityPing} rounded-full animate-ping"></div>
        <div class="absolute w-8 h-8 bg-${color} opacity-20 rounded-full animate-pulse"></div>
        <div class="relative w-4 h-4 bg-${color} rounded-full border border-${theme === 'dark' ? 'black' : 'white'} shadow-sm"></div>
      </div>
    `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });
};

const createUserIcon = (avatar: string, theme: string) => {
    const borderColor = theme === 'dark' ? 'white' : 'black';
    return L.divIcon({
        className: 'custom-user-icon',
        html: `
      <div class="relative group">
        <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-${borderColor} shadow-sm transition-transform group-hover:scale-110">
          <img src="${avatar}" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
        </div>
      </div>
    `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

// Hexagon Grid Layout Math for Apple Watch Style (Spiral Honeycomb)
const getHexPosition = (index: number) => {
    // Spiral order hex coordinates for a more organic Apple Watch look
    const hexCoords = [
        { q: 0, r: 0 },   // Center
        { q: 1, r: -1 }, { q: 1, r: 0 }, { q: 0, r: 1 },
        { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 }, // Ring 1
        { q: 2, r: -2 }, { q: 2, r: -1 }, { q: 2, r: 0 }, { q: 1, r: 1 },
        { q: 0, r: 2 }, { q: -1, r: 2 }, { q: -2, r: 2 }, { q: -2, r: 1 },
        { q: -2, r: 0 }, { q: -1, r: -1 }, { q: 0, r: -2 }, { q: 1, r: -2 }
    ];

    const coord = hexCoords[index] || { q: 0, r: 0 };
    const size = 64; // Compact size to see more at once

    // Convert axial to pixel coordinates (pointy-topped)
    const x = size * (Math.sqrt(3) * coord.q + Math.sqrt(3) / 2 * coord.r);
    const y = size * (3 / 2 * coord.r);

    return { x, y };
};

// CircleItem component for reactive scaling and fisheye effect
function CircleItem({ tag, pos, isSelected, hasSelection, toggleTag }: {
    tag: CheckInTag;
    pos: { x: number; y: number };
    isSelected: boolean;
    hasSelection: boolean;
    toggleTag: (tag: string, pos: { x: number; y: number }) => void;
    key?: React.Key;
}) {
    const Icon = tag.icon;

    // Remove fisheye effects for consistent visibility
    const itemScale = isSelected ? 1.2 : 1;
    const itemOpacity = isSelected ? 1 : (hasSelection ? 0.7 : 1);

    // Use motion values for smooth transitions between fisheye and selected state
    const animX = useSpring(pos.x);
    const animY = useSpring(pos.y);

    useEffect(() => {
        if (isSelected) {
            animX.set(pos.x);
            animY.set(pos.y);
        } else {
            animX.set(pos.x);
            animY.set(pos.y);
        }
    }, [isSelected, pos.x, pos.y]);

    return (
        <motion.button
            style={{
                x: animX,
                y: animY,
                scale: itemScale,
                opacity: itemOpacity,
                zIndex: isSelected ? 100 : 1
            }}
            animate={{
                background: isSelected
                    ? '#000000' // black
                    : '#ffffff',
                borderColor: isSelected ? '#000000' : '#e2e8f0',
                boxShadow: 'none',
            }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
            }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.stopPropagation();
                toggleTag(tag.tag, pos);
            }}
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1 border ${isSelected ? 'text-white z-20' : 'text-gray-400 hover:border-gray-500'
                }`}
        >
            <motion.div
                animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-black'}`} />
            </motion.div>

            <span className={`text-[8px] font-black uppercase tracking-tight text-center px-1 leading-none ${isSelected ? 'text-white' : 'text-gray-500'
                }`}>
                {tag.name.tr}
            </span>
        </motion.button>
    );
}

export default function CheckInScreen() {
    const { theme } = useTheme();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [shout, setShout] = useState('');
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkins, setCheckins] = useState<CheckIn[]>(MOCK_CHECKINS);
    const [userLocation, setUserLocation] = useState<[number, number]>([41.0082, 28.9784]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<'min' | 'half' | 'full'>('half');

    // Drag state for honeycomb
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);

    useEffect(() => {
        if (isMenuOpen) {
            dragX.set(0);
            dragY.set(0);
        }
    }, [isMenuOpen]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            });
        }
    }, []);

    const centerOnItem = (pos: { x: number; y: number }) => {
        dragX.set(-pos.x);
        dragY.set(-pos.y);
    };

    const toggleTag = (tag: string, pos: { x: number; y: number }) => {
        const isSelecting = !selectedTags.includes(tag);

        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );

        if (isSelecting) {
            centerOnItem(pos);
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleCheckIn = () => {
        setIsCheckingIn(true);
        setTimeout(() => {
            const newCheckIn: CheckIn = {
                id: Math.random().toString(36).substr(2, 9),
                user: {
                    displayname: 'You',
                    username: 'me',
                    avatar: 'https://i.pravatar.cc/150?u=me'
                },
                location: userLocation,
                shout: shout.trim() || undefined,
                tags: selectedTags,
                timestamp: 'Just now'
            };

            setCheckins([newCheckIn, ...checkins]);
            setSelectedTags([]);
            setShout('');
            setIsCheckingIn(false);
            setIsMenuOpen(false);
        }, 1500);
    };

    return (
        <div className={`relative h-full w-full ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} overflow-hidden font-sans`}>

            {/* Leaflet Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={userLocation}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url={theme === 'dark'
                            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        }
                    />

                    <RadarScan />
                    <Marker position={userLocation} icon={createRadarIcon(theme)} />

                    {checkins.map((checkin) => (
                        <Marker
                            key={checkin.id}
                            position={checkin.location}
                            icon={createUserIcon(checkin.user.avatar, theme)}
                        >
                            <Popup className="custom-popup">
                                <div className={`p-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <p className="font-black">{checkin.user.displayname}</p>
                                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                                        {checkin.tags.map(t => {
                                            const tag = CHECKIN_TAGS.find(ct => ct.tag === t);
                                            return tag ? <tag.icon key={t} className={`w-3 h-3 ${theme === 'dark' ? 'text-blue-400' : 'text-rose-500'}`} /> : null;
                                        })}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

            </div>

            {/* UI Overlay: Header, Bottom Sheet and FAB */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
                <div className="p-6 flex items-center justify-between pointer-events-auto mt-12 lg:mt-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200/60'} flex items-center justify-center`}>
                            <Radar className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Radar</h2>
                        </div>
                    </div>
                </div>

                {/* Floating Round Checkin Button (FAB) */}
                <div className="absolute bottom-[44vh] md:bottom-[50vh] right-6 z-[110] pointer-events-auto">
                    {!isMenuOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMenuOpen(true)}
                            className={`w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} shadow-xl ${theme === 'dark' ? 'shadow-white/5' : 'shadow-black/10'} flex items-center justify-center group relative overflow-hidden transition-all border-none`}
                        >
                            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gray-200' : 'bg-gray-800'} opacity-0 group-hover:opacity-10 transition-opacity`} />
                            <MapPin className="relative z-10 w-7 h-7 flex-shrink-0" style={{ transform: 'translate(1px, -1px)' }} />
                            <div className={`absolute inset-0 border-[3px] ${theme === 'dark' ? 'border-black/5' : 'border-white/10'} rounded-full animate-pulse`} />
                        </motion.button>
                    )}
                </div>

                {/* Bottom Sheet - Posts (Apple-Quality Scalable via Drag) */}
                <motion.div
                    drag="y"
                    dragDirectionLock
                    dragConstraints={{ top: 0, bottom: 1000 }}
                    dragElastic={0.4}
                    dragMomentum={false}
                    onDragStart={() => {
                        setSheetMode('full');
                    }}
                    onDragEnd={(_, info) => {
                        const threshold = 100;
                        const velocity = info.velocity.y;

                        if (velocity > 500) {
                            if (sheetMode === 'full') setSheetMode('half');
                            else setSheetMode('min');
                        } else if (velocity < -500) {
                            if (sheetMode === 'min') setSheetMode('half');
                            else setSheetMode('full');
                        } else {
                            if (info.offset.y > threshold) {
                                if (sheetMode === 'full') setSheetMode('half');
                                else if (sheetMode === 'half') setSheetMode('min');
                            } else if (info.offset.y < -threshold) {
                                if (sheetMode === 'min') setSheetMode('half');
                                else setSheetMode('full');
                            }
                        }
                    }}
                    variants={{
                        full: { y: "0vh" },
                        half: { y: "45vh" },
                        min: { y: "82vh" }
                    }}
                    initial="half"
                    animate={sheetMode}
                    transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
                    className={`absolute inset-x-0 bottom-0 h-[100vh] ${theme === 'dark' ? 'bg-gray-950/95 border-white/10' : 'bg-white/95 border-gray-100/60'} backdrop-blur-3xl rounded-t-[32px] pointer-events-auto flex flex-col border-t z-[200] overflow-hidden shadow-2xl`}
                >
                    {/* Compact Drag Handle & Header */}
                    <div className="flex flex-col relative z-20">
                        <div className={`w-full flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none`}>
                            <div className={`w-10 h-1 ${theme === 'dark' ? 'bg-white/20' : 'bg-gray-200'} rounded-full`} />
                        </div>

                        <div className={`px-4 py-2 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/5' : 'border-gray-50'}`}>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-[15px]`}>
                                    Radarlar
                                </h3>
                                <div className="flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-emerald-500/10 transition-colors">
                                    <span className={`w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest text-green-600`}>
                                        {checkins.length}
                                    </span>
                                </div>
                            </div>

                            {/* Compact Apple-style Controls */}
                            <div className={`flex items-center gap-1 p-1 rounded-full ${theme === 'dark' ? 'bg-gray-900/40' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSheetMode('min'); }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${sheetMode === 'min' ? (theme === 'dark' ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm') : (theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black')}`}
                                >
                                    <Minimize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSheetMode('half'); }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${sheetMode === 'half' ? (theme === 'dark' ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm') : (theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black')}`}
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSheetMode('full'); }}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${sheetMode === 'full' ? (theme === 'dark' ? 'bg-white text-black shadow-sm' : 'bg-black text-white shadow-sm') : (theme === 'dark' ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black')}`}
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className={`flex-1 overflow-y-auto px-4 pb-24 lg:pb-6 space-y-3 no-scrollbar relative z-0 mt-4`}>
                        {checkins.map(checkin => (
                            <div key={checkin.id} className={`${theme === 'dark' ? 'bg-gray-900/40 border-gray-800/60 hover:border-gray-700' : 'bg-white border-gray-200/50 hover:bg-gray-50'} border rounded-[24px] flex items-stretch min-h-[92px] w-full cursor-pointer transition-all overflow-hidden group/card`}>
                                {/* Left: Avatar & Info */}
                                <div className="flex flex-1 p-3 gap-4 items-center min-w-0">
                                    <div className="relative flex-shrink-0 w-[64px] h-[64px]">
                                        <img src={checkin.user.avatar} referrerPolicy="no-referrer" className={`w-full h-full rounded-[20px] object-cover transition-transform group-hover/card:scale-105 ${theme === 'dark' ? 'border border-gray-800' : 'border border-gray-100'}`} />
                                        <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-green-500 border-[3.5px] ${theme === 'dark' ? 'border-gray-900' : 'border-white'} rounded-full shadow-sm`}></div>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-[15px] truncate leading-tight tracking-tight`}>{checkin.user.displayname}</h4>
                                            <span className={`text-[10px] font-black uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap shrink-0`}>{checkin.timestamp}</span>
                                        </div>

                                        {checkin.shout && (
                                            <p className={`text-[12px] font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} leading-snug break-words`}>"{checkin.shout}"</p>
                                        )}

                                        {/* Tags - Show all tags as requested */}
                                        {checkin.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {checkin.tags.map(t => {
                                                    const tag = CHECKIN_TAGS.find(ct => ct.tag === t);
                                                    return tag ? (
                                                        <div key={t} className={`flex items-center gap-1 ${theme === 'dark' ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100 text-gray-700'} px-1.5 py-[3.5px] rounded-lg`}>
                                                            <tag.icon className="w-3 h-3" strokeWidth={2.5} />
                                                            <span className="text-[9px] font-black uppercase tracking-tight leading-none">{tag.name.tr}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Action Buttons (Stacked Horizontally) */}
                                <div className={`flex border-l ${theme === 'dark' ? 'border-gray-800/60' : 'border-gray-100/80'} shrink-0`}>
                                    <button
                                        className={`w-[60px] flex items-center justify-center bg-transparent transition-all ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-black hover:bg-black/5 active:bg-black/10'}`}
                                        title="Mesaj Gönder"
                                    >
                                        <MessageSquare className="w-5.5 h-5.5" strokeWidth={1.5} />
                                    </button>
                                    <button
                                        className={`w-[60px] flex items-center justify-center bg-transparent transition-all ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5 border-gray-800/60' : 'text-gray-400 hover:text-black hover:bg-black/5 border-gray-100/80 active:bg-black/10'} border-l`}
                                        title="Profili Gör"
                                    >
                                        <Globe className="w-5.5 h-5.5" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Full Screen Hexagonal Presence Grid (Apple Watch Style) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 flex items-center justify-center pointer-events-auto ${theme === 'dark' ? 'bg-gray-950/98' : 'bg-white/98'} backdrop-blur-2xl z-[300]`}
                    >
                        {/* Prominent Close Button */}
                        <button
                            onClick={closeMenu}
                            className={`absolute top-8 right-8 w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-gray-900 hover:bg-white text-gray-500 hover:text-black border-gray-800' : 'bg-white hover:bg-black text-gray-400 hover:text-white border-gray-200/40'} flex items-center justify-center transition-all z-[110] border group shadow-sm`}
                        >
                            <X className="w-10 h-10 group-hover:rotate-90 transition-transform" />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            <motion.div
                                drag
                                dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                                dragElastic={0.05}
                                dragMomentum={false}
                                style={{ x: dragX, y: dragY }}
                                className="absolute w-[800px] h-[800px] flex items-center justify-center cursor-grab active:cursor-grabbing z-0"
                            >
                                {CHECKIN_TAGS.map((tag, idx) => {
                                    const pos = getHexPosition(idx);
                                    const isSelected = selectedTags.includes(tag.tag);

                                    return (
                                        <CircleItem
                                            key={tag.id}
                                            tag={tag}
                                            pos={pos}
                                            isSelected={isSelected}
                                            hasSelection={selectedTags.length > 0}
                                            toggleTag={toggleTag}
                                        />
                                    );
                                })}
                            </motion.div>

                            <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none z-[130]">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`w-full max-w-[460px] mx-auto pointer-events-auto ${theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-gray-200'} border rounded-2xl p-5 space-y-4 shadow-2xl shadow-black/40`}
                                >
                                    {/* Selections Summary - Clean Minimalist Badges */}
                                    {selectedTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 overflow-hidden pb-1">
                                            {selectedTags.map(t => {
                                                const tag = CHECKIN_TAGS.find(ct => ct.tag === t);
                                                return tag ? (
                                                    <div
                                                        key={t}
                                                        className={`flex items-center gap-1.5 ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'} px-2 py-1 rounded-lg border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'}`}
                                                    >
                                                        <tag.icon className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">{tag.name.tr}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <textarea
                                            placeholder="Mesajınız (opsiyonel)..."
                                            value={shout}
                                            onChange={(e) => setShout(e.target.value)}
                                            className={`w-full ${theme === 'dark' ? 'bg-gray-950 border-white/5 text-white placeholder:text-gray-700' : 'bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400'} border rounded-xl p-3 text-[14px] font-medium outline-none h-[80px] resize-none focus:border-blue-500/30 transition-all`}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCheckIn}
                                            disabled={isCheckingIn || selectedTags.length === 0}
                                            className={`flex-[2] py-4 rounded-full ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600' : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-300'} font-bold text-[12px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-[0.98]`}
                                        >
                                            {isCheckingIn ? (
                                                <div className={`w-4 h-4 border-2 ${theme === 'dark' ? 'border-black/20 border-t-black' : 'border-white/20 border-t-white'} rounded-full animate-spin`} />
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5" />
                                                    Check-in
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={closeMenu}
                                            className={`flex-1 py-4 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-white border-white/10 hover:bg-gray-700' : 'bg-white text-black border-gray-200 hover:bg-gray-50'} font-bold text-[12px] uppercase tracking-[0.15em] transition-all border active:scale-[0.98]`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Radar Styles */}
            < style dangerouslySetInnerHTML={{
                __html: `
                    .custom-popup .leaflet-popup-content-wrapper {
                        background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.9)'};
                        backdrop-filter: blur(12px);
                        border: 1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
                        border-radius: 20px;
                        color: ${theme === 'dark' ? '#fff' : '#0f172a'};
                        box-shadow: none;
                    }
                    .custom-popup .leaflet-popup-tip {
                        background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.9)'};
                    }
                `
            }} />
        </div >
    );
}

function RadarScan() {
    return null;
}

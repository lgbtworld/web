import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
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
    Video,
    Sparkles,
    Droplet,
    Feather,
    Dumbbell,
    FlaskRound,
    ImagePlus,
    Minimize2,
    Maximize2,
    Minus,
    Plus,
    ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../contexts/ThemeContext';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { tagNameToColor } from '../helpers/colors';
import CreatePost from '../features/post/CreatePost';
import { getLocalizedContent } from '../helpers/helpers';

type TagCategory = 'capacity' | 'intent' | 'availability' | 'personality' | 'safety';

interface CheckInTag {
    id: string;
    tag: string;
    name: { en: string; tr: string };
    icon: LucideIcon;
    category: TagCategory;
    color: string;
}

interface CheckIn {
    id: string;
    user: { displayname: string; username: string; avatar: string };
    location: [number, number];
    shout?: string;
    tags: string[];
    timestamp: string;
}


const MOCK_CHECKINS: CheckIn[] = [
    { id: 'c1', user: { displayname: 'Alex Rivera', username: 'arivera', avatar: 'https://i.pravatar.cc/150?u=arivera' }, location: [41.0082, 28.9784], shout: 'Best oat latte in town! ☕️', tags: ['has_place', 'chill', 'available_now'], timestamp: '2m' },
    { id: 'c2', user: { displayname: 'Sam Taylor', username: 'staylor', avatar: 'https://i.pravatar.cc/150?u=staylor' }, location: [41.0152, 28.9824], shout: 'The music is amazing tonight! 🌈✨', tags: ['seeking_fun', 'fun', 'has_vehicle'], timestamp: '15m' },
    { id: 'c3', user: { displayname: 'Jordan Lee', username: 'jlee', avatar: 'https://i.pravatar.cc/150?u=jlee' }, location: [41.0122, 28.9754], shout: 'Anyone up for a quick ride?', tags: ['has_vehicle', 'chill'], timestamp: '20m' },
    { id: 'c4', user: { displayname: 'Casey Smith', username: 'csmith', avatar: 'https://i.pravatar.cc/150?u=csmith' }, location: [41.0202, 28.9854], shout: 'Just chilling at home 🏠', tags: ['owns_home', 'available_now'], timestamp: '25m' },
    { id: 'c5', user: { displayname: 'Riley Davis', username: 'rdavis', avatar: 'https://i.pravatar.cc/150?u=rdavis' }, location: [41.0052, 28.9714], shout: '', tags: ['seeking_love', 'respectful'], timestamp: '30m' },
    { id: 'c6', user: { displayname: 'Morgan White', username: 'mwhite', avatar: 'https://i.pravatar.cc/150?u=mwhite' }, location: [41.0182, 28.9904], shout: 'Looking for a fun night out!', tags: ['seeking_fun', 'night_only'], timestamp: '45m' },
    { id: 'c7', user: { displayname: 'Jamie Brown', username: 'jbrown', avatar: 'https://i.pravatar.cc/150?u=jbrown' }, location: [41.0012, 28.9684], shout: "Let's chat over coffee ☕", tags: ['seeking_chat', 'chill'], timestamp: '1s' },
    { id: 'c8', user: { displayname: 'Taylor Green', username: 'tgreen', avatar: 'https://i.pravatar.cc/150?u=tgreen' }, location: [41.0252, 28.9804], shout: '', tags: ['has_money', 'paid_meeting'], timestamp: '1s 15m' },
    { id: 'c9', user: { displayname: 'Drew Hall', username: 'dhall', avatar: 'https://i.pravatar.cc/150?u=dhall' }, location: [41.0092, 28.9764], shout: 'No pressure, just good vibes', tags: ['no_pressure', 'respectful'], timestamp: '1s 30m' },
    { id: 'c10', user: { displayname: 'Quinn Adams', username: 'qadams', avatar: 'https://i.pravatar.cc/150?u=qadams' }, location: [41.0142, 28.9834], shout: '', tags: ['sporty', 'available_now'], timestamp: '2s' },
    { id: 'c11', user: { displayname: 'Avery Baker', username: 'abaker', avatar: 'https://i.pravatar.cc/150?u=abaker' }, location: [41.0042, 28.9744], shout: 'Gaming tonight 🎮', tags: ['chill', 'night_only'], timestamp: '2s 15m' },
    { id: 'c12', user: { displayname: 'Skyler Hill', username: 'shill', avatar: 'https://i.pravatar.cc/150?u=shill' }, location: [41.0222, 28.9814], shout: 'Just passing through town', tags: ['traveler', 'chill'], timestamp: '2s 30m' },
];

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
    home: Home,
    car: Car,
    building: Building2,
    wallet: Wallet,
    heart: Heart,
    zap: Zap,
    'message-circle': MessageSquare,
    banknote: Banknote,
    sparkles: Sparkles,
    droplet: Droplet,
    feather: Feather,
    dumbbell: Dumbbell,
    'flask-round': FlaskRound,
    clock: Clock,
    moon: Moon,
    coffee: Coffee,
    smile: Smile,
    'shield-check': ShieldCheck,
    hand: Hand,
    globe: Globe,
};

const resolveTagIcon = (icon?: string | LucideIcon): LucideIcon => {
    if (!icon) return MapPin;
    if (typeof icon === 'function') return icon as LucideIcon;
    const key = icon.toLowerCase();
    return LUCIDE_ICON_MAP[key] ?? MapPin;
};

const createUserIcon = (avatar: string, isSelf = false) => {
    return L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:40px;height:40px;">
            <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:2.5px solid ${isSelf ? '#3b82f6' : 'rgba(255,255,255,0.85)'};box-shadow:0 2px 8px rgba(0,0,0,0.3);">
              <img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" referrerpolicy="no-referrer"/>
            </div>
            ${isSelf ? `<div style="position:absolute;bottom:-1px;right:-1px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid white;"></div>` : `<div style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid white;"></div>`}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

/* ─── Hex position helper (Apple Watch spiral layout) ─────────────────────── */
const getHexPosition = (index: number) => {
    const hexCoords = [
        { q: 0, r: 0 },
        { q: 1, r: -1 }, { q: 1, r: 0 }, { q: 0, r: 1 },
        { q: -1, r: 1 }, { q: -1, r: 0 }, { q: 0, r: -1 },
        { q: 2, r: -2 }, { q: 2, r: -1 }, { q: 2, r: 0 }, { q: 1, r: 1 },
        { q: 0, r: 2 }, { q: -1, r: 2 }, { q: -2, r: 2 }, { q: -2, r: 1 },
        { q: -2, r: 0 }, { q: -1, r: -1 }, { q: 0, r: -2 }, { q: 1, r: -2 },
    ];
    const coord = hexCoords[index] || { q: 0, r: 0 };
    const size = 98;
    const x = size * (Math.sqrt(3) * coord.q + (Math.sqrt(3) / 2) * coord.r);
    const y = size * ((3 / 2) * coord.r);
    return { x, y };
};

/* ─── Honeycomb Item ────────────────────────────────────────────────────────── */
function HoneycombItem({ tag, pos, isSelected, hasSelection, onToggle, dark, defaultLanguage }: {
    tag: CheckInTag;
    pos: { x: number; y: number };
    isSelected: boolean;
    hasSelection: boolean;
    onToggle: (pos: { x: number; y: number }) => void;
    dark: boolean;
    defaultLanguage: string;
}) {
   const Icon = tag.icon ?? MapPin;
    // pos hiç değişmediği için spring gereksiz — doğrudan kullanıyoruz
    return (
        <motion.button
            style={{ x: pos.x, y: pos.y, zIndex: isSelected ? 20 : 1 }}
            animate={{ opacity: hasSelection && !isSelected ? 0.55 : 1 }}
            transition={{ opacity: { duration: 0.25, ease: 'easeInOut' } }}
            whileTap={{ scale: 0.93 }}
            onClick={e => { e.stopPropagation(); onToggle(pos); }}
            className={`
                absolute w-[116px] h-[116px] rounded-full flex flex-col items-center justify-center gap-2
                border-2 overflow-hidden
                ${isSelected
                    ? 'border-transparent'
                    : dark
                        ? 'bg-gray-900/60 border-white/[0.10] hover:border-white/[0.22] hover:bg-gray-800/45'
                        : 'bg-white/80 border-black/[0.08] hover:border-black/[0.18] hover:bg-black/[0.03]'
                }
            `}
        >
            <motion.div
                 style={tagNameToColor(tag.tag)}

                className={`absolute inset-0`}
                initial={false}
                animate={{ opacity: isSelected ? 1 : 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
            />
            <div className="relative flex flex-col items-center gap-1">
                
               <Icon
            className={`w-8 h-8 transition-colors duration-250 ${
                isSelected
                    ? 'text-white'
                    : dark
                        ? 'text-gray-200'
                        : 'text-gray-700'
            }`}
            strokeWidth={1.8}
        />
                <span className={`text-[10px] font-black uppercase tracking-tight text-center px-1 leading-none transition-colors duration-250 ${isSelected ? 'text-white' : dark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getLocalizedContent(tag.name, defaultLanguage)}
                </span>
            </div>
        </motion.button>
    );
}

/* ─── CheckIn Card ──────────────────────────────────────────────────────────── */
function CheckInCard({ checkin, dark, checkinTags }: { checkin: CheckIn; dark: boolean; checkinTags: CheckInTag[] }) {
    const tags = checkin.tags
        .map(t => checkinTags.find(ct => ct.tag === t))
        .filter(Boolean) as CheckInTag[];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                group flex gap-3 p-3.5 rounded-[20px] border transition-all cursor-pointer
                ${dark
                    ? 'bg-gray-900/40 border-gray-800/60 hover:bg-gray-800/50 hover:border-gray-700/70'
                    : 'bg-white border-black/[0.06] hover:bg-gray-50 hover:border-black/[0.10]'
                }
            `}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <img
                    src={checkin.user.avatar}
                    referrerPolicy="no-referrer"
                    className={`w-[52px] h-[52px] rounded-[14px] object-cover border ${dark ? 'border-gray-800' : 'border-gray-100'} group-hover:scale-[1.03] transition-transform duration-200`}
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 ${dark ? 'border-gray-900' : 'border-white'}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                    <span className={`text-[14px] font-bold truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                        {checkin.user.displayname}
                    </span>
                    <span className={`text-[10px] font-semibold flex-shrink-0 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {checkin.timestamp}
                    </span>
                </div>

                {checkin.shout && (
                    <p className={`text-[12px] leading-snug ${dark ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                        {checkin.shout}
                    </p>
                )}

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {tags.map(tag => {
                            const Icon = tag.icon;
                            return (
                                <div
                                    key={tag.id}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg ${dark ? 'bg-gray-800/60 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
                                    <span className="text-[9px] font-black uppercase tracking-wide leading-none">{tag.name.tr}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action */}
            <div className="flex-shrink-0 flex items-center self-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? 'text-gray-600 group-hover:text-gray-300 group-hover:bg-white/5' : 'text-gray-300 group-hover:text-gray-600 group-hover:bg-black/5'} transition-all`}>
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function CheckInScreen() {
    const { theme } = useTheme();
    const dark = theme === 'dark';
    const { data: appData,defaultLanguage } = useApp();
    const checkinTags: CheckInTag[] = (appData?.checkin_tag_types ?? []).map((tag: any) => ({
        ...tag,
        icon: resolveTagIcon(tag.icon),
    }));

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkins, setCheckins] = useState<CheckIn[]>(MOCK_CHECKINS);
    const [userLocation, setUserLocation] = useState<[number, number]>([41.0082, 28.9784]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<'min' | 'half' | 'full'>('half');
    // useMotionValue — drag sırasında lag yok, centerOnItem'da animate() ile smooth spring
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            animate(dragX, 0, { duration: 0 });
            animate(dragY, 0, { duration: 0 });
            setSelectedTags([]);
        }
    }, [isModalOpen]);

    const centerOnItem = (pos: { x: number; y: number }) => {
        // animate() — spring ile smooth kayma, drag sırasında ise anlık
        animate(dragX, -pos.x, { type: 'spring', stiffness: 200, damping: 28, mass: 0.7 });
        animate(dragY, -pos.y, { type: 'spring', stiffness: 200, damping: 28, mass: 0.7 });
    };

    const toggleTag = (tag: string, pos?: { x: number; y: number }) => {
        const willSelect = !selectedTags.includes(tag);
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        if (willSelect && pos) centerOnItem(pos);
    };


    const handleCheckIn = () => {
        if (selectedTags.length === 0) return;
        setIsCheckingIn(true);
        setTimeout(() => {
            setCheckins(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                user: { displayname: 'Siz', username: 'me', avatar: 'https://i.pravatar.cc/150?u=me' },
                location: userLocation,
                tags: selectedTags,
                timestamp: 'şimdi',
            }, ...prev]);
            setSelectedTags([]);
            setIsCheckingIn(false);
            setIsModalOpen(false);
        }, 1400);
    };


    const sheetVariants = {
        full: { y: '0vh' },
        half: { y: '45vh' },
        min: { y: '82vh' },
    };

    return (
        <div className={`relative h-full w-full overflow-hidden font-sans ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* ── Map ── */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={userLocation}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url={dark
                            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                        }
                    />
                    <Marker position={userLocation} icon={createUserIcon('https://i.pravatar.cc/150?u=me', true)} />
                    {checkins.map(c => (
                        <Marker key={c.id} position={c.location} icon={createUserIcon(c.user.avatar)}>
                            <Popup className="custom-popup">
                                <div className="p-1.5 text-center min-w-[100px]">
                                    <p className={`font-bold text-[13px] ${dark ? 'text-white' : 'text-gray-900'}`}>{c.user.displayname}</p>
                                    {c.shout && <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{c.shout}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* ── UI overlay ── */}
            <div className="absolute inset-0 z-20 pointer-events-none">

                {/* FAB — Check-in button */}
                <AnimatePresence>
                    {!isModalOpen && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute bottom-[47vh] md:bottom-[52vh] right-5 z-[110] pointer-events-auto"
                        >
                            <motion.button
                                whileHover={{ scale: 1.06 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setIsModalOpen(true)}
                                className={`
                                    relative w-[58px] h-[58px] rounded-full flex items-center justify-center
                                    ${dark ? 'bg-white text-black' : 'bg-gray-900 text-white'}
                                    shadow-xl overflow-hidden
                                `}
                            >
                                <div className={`absolute inset-0 ${dark ? 'bg-gray-100' : 'bg-gray-700'} opacity-0 hover:opacity-10 transition-opacity`} />
                                <MapPin className="relative z-10 w-6 h-6" />
                            </motion.button>
                            <div className={`
                                absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap
                                text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full
                                ${dark ? 'bg-gray-900/80 text-gray-400' : 'bg-white/80 text-gray-500'}
                                backdrop-blur-sm
                            `}>
                                Check-in
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Bottom Sheet ── */}
                <motion.div
                    drag="y"
                    dragDirectionLock
                    dragConstraints={{ top: 0, bottom: 1000 }}
                    dragElastic={0.3}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                        const v = info.velocity.y;
                        const o = info.offset.y;
                        if (v > 400 || o > 80) {
                            setSheetMode(prev => prev === 'full' ? 'half' : 'min');
                        } else if (v < -400 || o < -80) {
                            setSheetMode(prev => prev === 'min' ? 'half' : 'full');
                        }
                    }}
                    variants={sheetVariants}
                    initial="half"
                    animate={sheetMode}
                    transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
                    className={`
                        absolute inset-x-0 bottom-0 h-[100vh] pointer-events-auto
                        ${dark ? 'bg-gray-950/96 border-white/[0.07]' : 'bg-white/97 border-black/[0.06]'}
                        backdrop-blur-3xl border-t rounded-t-[28px] flex flex-col z-[200]
                        shadow-[0_-8px_40px_rgba(0,0,0,0.12)]
                    `}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing touch-none">
                        <div className={`w-8 h-[3px] rounded-full ${dark ? 'bg-white/15' : 'bg-gray-200'}`} />
                    </div>

                    {/* Sheet header */}
                    <div className={`px-4 pb-2 pt-1 flex items-center justify-between border-b ${dark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                        <div className="flex items-center gap-2.5">
                            <span className={`text-[15px] font-black tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                                Howls
                            </span>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${dark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    {checkins.length}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className={`flex items-center gap-0.5 p-0.5 rounded-full ${dark ? 'bg-gray-900/60 border border-white/[0.06]' : 'bg-gray-100 border border-black/[0.05]'}`}>
                            {(['min', 'half', 'full'] as const).map((mode, i) => {
                                const icons = [Minimize2, Minus, Maximize2];
                                const Icon = icons[i];
                                const active = sheetMode === mode;
                                return (
                                    <button
                                        key={mode}
                                        onClick={e => { e.stopPropagation(); setSheetMode(mode); }}
                                        className={`
                                            w-7 h-7 rounded-full flex items-center justify-center transition-all
                                            ${active
                                                ? dark ? 'bg-white text-black' : 'bg-gray-900 text-white'
                                                : dark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-800 hover:bg-black/[0.06]'
                                            }
                                        `}
                                    >
                                        <Icon className="w-3 h-3" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cards list */}
                    <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2 pb-24 lg:pb-6 no-scrollbar">
                        {checkins.map(c => (
                            <CheckInCard key={c.id} checkin={c} dark={dark} checkinTags={checkinTags} />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Check-in Modal ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Modal: fullscreen honeycomb + bottom panel */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`
                                absolute inset-0 z-[300] flex flex-col
                                ${dark ? 'bg-gray-950/98' : 'bg-white/98'}
                                backdrop-blur-2xl
                            `}
                        >
                            {/* Close + title */}
                            <div className={`flex items-center justify-between px-5 pt-12 pb-3 lg:pt-5`}>
                                <div>
                                    <h2 className={`text-[17px] font-black tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>
                                        Check-in
                                    </h2>
                                    <p className={`text-[11px] mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Durumunu seç ve paylaş
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dark ? 'bg-white/[0.07] hover:bg-white/[0.14] text-gray-300' : 'bg-black/[0.05] hover:bg-black/[0.10] text-gray-600'}`}
                                >
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>

                            {/* Draggable honeycomb area */}
                            <div className="flex-1 relative overflow-hidden">
                                <motion.div
                                    drag
                                    dragConstraints={{ left: -320, right: 320, top: -240, bottom: 240 }}
                                    dragElastic={0.06}
                                    dragMomentum={false}
                                    style={{ x: dragX, y: dragY }}
                                    className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                                >
                                    {checkinTags.map((tag, idx) => {
                                        const pos = getHexPosition(idx);
                                        return (
                                            <HoneycombItem
                                                key={tag.id}
                                                tag={tag}
                                                pos={pos}
                                                isSelected={selectedTags.includes(tag.tag)}
                                                hasSelection={selectedTags.length > 0}
                                                onToggle={pos => toggleTag(tag.tag, pos)}
                                                dark={dark}
                                                defaultLanguage={defaultLanguage}
                                            />
                                        );
                                    })}
                                </motion.div>

                                {/* Hint label */}
                                <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full pointer-events-none ${dark ? 'text-gray-600 bg-gray-900/60' : 'text-gray-400 bg-gray-100/80'}`}>
                                    Sürükle &amp; Seç
                                </div>
                            </div>

                            {/* Bottom panel */}
                            <div className={`px-5 pt-3 pb-4 border-t ${dark ? 'border-white/[0.06]' : 'border-black/[0.05]'} flex flex-col gap-3`}>

                                {/* Selected tags row */}
                                <AnimatePresence>
                                    {selectedTags.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`px-3.5 py-2.5 rounded-2xl flex flex-wrap gap-1.5 ${dark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-black/[0.06]'}`}>
                                                {selectedTags.map(t => {
                                                    const tag = checkinTags.find(ct => ct.tag === t);
                                                    if (!tag) {
                                                        return (
                                                            <button
                                                                key={t}
                                                                onClick={() => toggleTag(t)}
                                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-xl ${dark ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-800'}`}
                                                            >
                                                                <span className="text-[10px] font-bold">{t}</span>
                                                                <X className="w-2 h-2 opacity-60" />
                                                            </button>
                                                        );
                                                    }
                                                    const Icon = tag.icon;
                                                    return (
                                                        <button
                                                            key={t}
                                                            onClick={() => toggleTag(t)}
                                                              style={tagNameToColor(tag.tag)}

                                                  
                                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-white`}
                                                        >
                                                            <Icon className="w-3 h-3" strokeWidth={2} />
                                                            <span className="text-[10px] font-bold">{getLocalizedContent(tag.name, defaultLanguage)}</span>
                                                            <X className="w-2 h-2 opacity-60" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Shout + media input — replaced with CreatePost */}
                                <div className="pt-2">
                                    <CreatePost
                                    title='CheckIn'

                                        buttonText="CheckIn"
                                        fullScreen={false}
                                        placeholder="Ne söylemek istersin?"
                                        canClose={false}
                                        onPostCreated={() => setIsModalOpen(false)}
                                    />
                                </div>

                     
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Popup styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-popup .leaflet-popup-content-wrapper {
                    background: ${dark ? 'rgba(10,10,15,0.92)' : 'rgba(255,255,255,0.94)'};
                    backdrop-filter: blur(16px);
                    border: 1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'};
                    border-radius: 18px;
                    color: ${dark ? '#fff' : '#0f172a'};
                    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
                    padding: 0;
                }
                .custom-popup .leaflet-popup-tip-container { display: none; }
                .custom-popup .leaflet-popup-content { margin: 0; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
            `}} />
        </div>
    );
}

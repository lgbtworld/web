import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import './style.css';
import { ArrowUpRight, Heart } from 'lucide-react';
import { useAtom } from 'jotai';
import { globalState } from '../../state/nearby'; // atomun tanımlı olduğu dosya
import { calculateAge, getSafeImageURL } from '../../helpers/helpers';
import { ActionBar, burstConfig, BurstOverlayState, BurstType, createOverlayConfetti, createOverlayParticles, createOverlayStreaks } from '../UserCard/ActionBar';
import { api } from '../../services/api';
import { Actions } from '../../services/actions';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';
import { useWebGLSphere } from '../../hooks/useWebGLSphere';


const defaultItems = [
    {
        image: 'https://picsum.photos/900/900?grayscale',
        link: 'https://google.com/',
        title: '',
        description: ''
    }
];

export default function BubbleView() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [state, setState] = useAtom(globalState);

    const [activeItem, setActiveItem] = useState(null);
    const [isMoving, setIsMoving] = useState(false);

    const [isGiftSelectorOpen, setIsGiftSelectorOpen] = useState(false);
    const [isQuickMessageSelectorOpen, setIsQuickMessageSelectorOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false)
    const [blocked, setIsBlocked] = useState(false)
    const [overlay, setOverlay] = useState<BurstOverlayState | null>(null);
    const [isOverlayReady, setIsOverlayReady] = useState(false);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeUser, setActiveUser] = useState<any | null>(null);

    const baseCardStyle =
        theme === 'dark'
            ? 'bg-gray-950 border border-gray-900 text-white'
            : 'bg-white border border-gray-100 text-black';

    const baseButtonStyle =
        theme === 'dark'
            ? 'border border-gray-700 text-gray-400 hover:bg-gray-950 hover:text-white'
            : 'border border-gray-300 text-gray-700 hover:bg-gray-400 hover:text-gray-900';

    useEffect(() => {
        setIsOverlayReady(true);
    }, []);

    const users = useMemo(() => state.nearbyUsers.length ? state.nearbyUsers : defaultItems, [state.nearbyUsers]);

    const handleActiveItemChange = useCallback((index: number) => {
        const itemIndex = index % users.length;
        setActiveUser(users[itemIndex]);
    }, [users]);

    const webglController = useWebGLSphere(canvasRef, users, handleActiveItemChange, setIsMoving);


   

 

    const handleSendMessage = async (profile: any) => {
        if (!profile?.id) {
            console.error('User or profile ID is missing');
            return;
        }

        try {
            // Create chat via API
            const chatResponse = await api.call<{
                chat: {
                    id: string;
                    type: string;
                    participants?: Array<{
                        user_id: string;
                        user?: {
                            id: string;
                            username?: string;
                            displayname?: string;
                        };
                    }>;
                };
                success: boolean;
            }>(Actions.CMD_CHAT_CREATE, {
                method: "POST",
                body: {
                    type: 'private',
                    participant_ids: [profile.id],
                },
            });

            const chatId = chatResponse?.chat?.id;

            if (chatId) {
                // Navigate to messages screen with chat ID
                navigate('/messages', {
                    state: {
                        openChat: chatId,
                        userId: profile.id,
                        publicId: profile.public_id,
                        username: profile.username
                    }
                });
            } else {
                console.error('Chat creation failed - no chat ID returned');
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            // Navigate anyway, MessagesScreen will handle creating a temporary chat
            navigate('/messages', {
                state: {
                    openChat: profile.username || profile.id,
                    userId: profile.id,
                    publicId: profile.public_id
                }
            });
        }
    };

    const handleSendLike = async (user: any) => {
        //


        if (!user?.public_id) return;

        try {
            await api.call(Actions.CMD_USER_TOGGLE_LIKE, {
                method: 'POST',
                body: {
                    likee_id: user.public_id,
                },
            });


        } catch (error) {
            console.error('Error toggling like:', error);
            // Optionally show error message to user
        }
    }

    const handleSendDislike = async (user: any) => {
        //


        if (!user?.public_id) return;

        try {
            await api.call(Actions.CMD_USER_TOGGLE_DISLIKE, {
                method: 'POST',
                body: {
                    likee_id: user.public_id,
                },
            });


        } catch (error) {
            console.error('Error toggling like:', error);
            // Optionally show error message to user
        }
    }

    const handleBlock = async (user: any) => {
        //


        if (!user?.public_id) return;

        try {
            await api.call(Actions.CMD_USER_TOGGLE_BLOCK, {
                method: 'POST',
                body: {
                    user_id: user.public_id,
                },
            });


        } catch (error) {
            console.error('Error toggling like:', error);
            // Optionally show error message to user
        }
    }

    const handleTriggerOverlay = (type: BurstType) => {
        const key = Date.now();
        setOverlay({
            type,
            key,
            particles: createOverlayParticles(type, key),
            confetti: createOverlayConfetti(type, key),
            streaks: createOverlayStreaks(type, key),
        });
    };

    useEffect(() => {
        if (!overlay) return;
        const timeout = setTimeout(() => setOverlay(null), 2600);
        return () => clearTimeout(timeout);
    }, [overlay]);




    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}><canvas id="infinite-grid-menu-canvas" ref={canvasRef} />
            {activeUser && (<>
                <div className={(isMoving ? 'hidden' : '') + ` absolute flex flex-col gap-2 items-center justify-center text-center bottom-0  w-full  h-1/4 md:h-1/7  z-5 rounded-lg backdrop-blur-sm py-5 bg-red-500"`}>
                    <h2 className="text-3xl font-bold">{activeUser?.username} <span className="font-light">{calculateAge(activeUser.date_of_birth)}</span></h2>
                    <ActionBar
                        viewMode='bubble'
                        liked={liked}
                        disliked={disliked}
                        blocked={blocked}
                        onBlockToggle={() => {
                            setIsBlocked((prev) => !prev)
                            handleBlock(activeUser)
                        }}
                        onLikeToggle={() => {
                            setLiked((prev) => !prev)
                            handleSendLike(activeUser)
                        }}
                        onDislikeToggle={() => {
                            setDisliked((prev) => !prev)
                            handleSendDislike(activeUser)
                        }}
                        onOpenGiftSelector={() => setIsGiftSelectorOpen(true)}
                        onOpenQuickMessageSelector={() => {
                            handleSendMessage(activeUser)
                        }}
                        baseButtonStyle={baseButtonStyle}
                        onTriggerOverlay={handleTriggerOverlay}
                    />
                </div>




            </>)}

            {isOverlayReady && overlay &&
                createPortal(
                    <AnimatePresence initial={true}>
                        <motion.div
                            key={`overlay-${overlay.key}`}
                            className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            />
                            <motion.div
                                className="absolute inset-0"
                                style={{ background: burstConfig[overlay.type].gradient }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                            />
                            <motion.div
                                className="absolute inset-0"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: [0.6, 1.05, 1], opacity: [0, 0.6, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 65%)',
                                }}
                            />

                            <div className="relative z-[1] flex flex-col items-center justify-center gap-8">
                                <motion.div
                                    className="absolute"
                                    style={{ width: 260, height: 260 }}
                                    initial={{ scale: 0.35, opacity: 0 }}
                                    animate={{ scale: [0.35, 1.2], opacity: [0.45, 0] }}
                                    transition={{ duration: 1.4, ease: 'easeOut', repeat: Infinity, repeatType: 'loop' }}
                                >
                                    <div className="w-full h-full rounded-full border border-white/15" />
                                </motion.div>

                                {['-90deg', '-30deg', '40deg', '110deg'].map((angle, idx) => (
                                    <motion.div
                                        key={`float-heart-${idx}`}
                                        className="absolute text-white/70"
                                        style={{ rotate: angle }}
                                        initial={{ opacity: 0, scale: 0.4, y: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0.4, 0.9, 1.1],
                                            y: [-10, -35, -55],
                                        }}
                                        transition={{
                                            duration: 1.6 + idx * 0.1,
                                            delay: 0.2 * idx,
                                            repeat: Infinity,
                                            repeatType: 'loop',
                                            ease: 'easeOut',
                                        }}
                                    >
                                        <Heart className="h-6 w-6 text-white/60" />
                                    </motion.div>
                                ))}

                                {overlay.streaks.map(({ id, angle, length, delay }) => (
                                    <motion.span
                                        key={id}
                                        className="absolute origin-center"
                                        style={{
                                            width: length,
                                            height: 2,
                                            background:
                                                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.05) 100%)',
                                            rotate: `${angle}deg`,
                                        }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: [0, 1.05, 0.8], opacity: [0, 0.85, 0] }}
                                        transition={{
                                            duration: 1.1,
                                            ease: 'easeOut',
                                            delay,
                                            repeat: Infinity,
                                            repeatType: 'loop',
                                        }}
                                    />
                                ))}

                                <motion.div
                                    className="relative"
                                    initial={{ scale: 0.2, opacity: 0, rotate: -25 }}
                                    animate={{
                                        scale: [0.2, 1.25, 1],
                                        opacity: [0, 1, 1],
                                        rotate: 0,
                                    }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ duration: 0.55, ease: 'easeOut' }}
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.12, 1],
                                            rotate: [0, 3, -3, 0],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="rounded-full drop-shadow-[0_0_65px_rgba(255,255,255,0.45)]"
                                    >
                                        {React.createElement(burstConfig[overlay.type].Icon, {
                                            className: `h-32 w-32 ${burstConfig[overlay.type].color}`,
                                            strokeWidth: 1.4,
                                            fill: 'currentColor',
                                        })}
                                    </motion.div>
                                </motion.div>

                                {overlay.particles.map(({ id, x, y, rotate, Icon, color }) => (
                                    <motion.span
                                        key={id}
                                        className="absolute drop-shadow-[0_0_22px_rgba(255,255,255,0.45)]"
                                        initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1.25, 0.65],
                                            x,
                                            y,
                                            rotate: rotate + 120,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0,
                                            x: x * 1.05,
                                            y: y * 1.05,
                                        }}
                                        transition={{ duration: 0.95, ease: 'easeOut' }}
                                    >
                                        <Icon className={`h-12 w-12 ${color}`} strokeWidth={1.2} fill="currentColor" />
                                    </motion.span>
                                ))}

                                {overlay.confetti.map(({ id, x, y, size, color, rotate, driftX, driftY, duration, delay, shape }) => (
                                    <motion.span
                                        key={id}
                                        className={`absolute left-1/2 top-1/2 shadow-[0_0_18px_rgba(255,255,255,0.35)] ${shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-sm' : ''}`}
                                        initial={{ opacity: 0, scale: 0.6, x: 0, y: 0, rotate: 0 }}
                                        animate={{
                                            opacity: [0, 1, 0.8, 0],
                                            scale: [0.6, 1.05, 0.95, 0.6],
                                            x: [0, x * 0.6, x + driftX],
                                            y: [0, y * 0.6, y + driftY],
                                            rotate: [0, rotate * 0.6, rotate * 1.2],
                                        }}
                                        exit={{ opacity: 0, scale: 0.4, x: x * 1.05, y: y * 1.05 }}
                                        transition={{
                                            duration,
                                            ease: 'easeInOut',
                                            delay,
                                            repeat: Infinity,
                                            repeatType: 'mirror',
                                        }}
                                        style={{
                                            width: size,
                                            height: size,
                                            backgroundColor: color,
                                            mixBlendMode: 'screen',
                                            borderRadius: shape === 'circle' ? '9999px' : shape === 'square' ? '4px' : undefined,
                                            clipPath:
                                                shape === 'triangle'
                                                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                                    : undefined,
                                        }}
                                    />
                                ))}

                                <motion.div
                                    className="absolute -bottom-20 text-white text-3xl font-semibold uppercase tracking-[0.4rem]"
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 40 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    {overlay.type === 'like' && 'İYİ HİSSETTİNİZ'}
                                    {overlay.type === 'dislike' && 'BİR SONRAKİNE'}
                                    {overlay.type === 'block' && 'ENGELLENDİ'}
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body
                )}
        </div>
    );
}
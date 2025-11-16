import { AnimatePresence, motion } from "framer-motion";
import { Gift, Heart, HeartCrack, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { BlockIcon, ChatIcon, DislikeIcon, LikeIcon } from "./icons";

interface ActionBarProps {
  liked: boolean;
  disliked: boolean,
  blocked: boolean,
  viewMode: 'compact' | 'list' | 'card' | 'bubble',
  onLikeToggle: () => void;
  onDislikeToggle: () => void;
  onBlockToggle: () => void;
  onOpenGiftSelector: () => void;
  onOpenQuickMessageSelector: () => void;
  baseButtonStyle: string;
  onTriggerOverlay: (type: BurstType) => void;
}



export type BurstType = 'like' | 'dislike' | 'block';

type BurstIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface OverlayParticle {
  id: string;
  x: number;
  y: number;
  rotate: number;
  Icon: BurstIconComponent;
  color: string;
}

interface OverlayConfetti {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotate: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  shape: 'circle' | 'square' | 'triangle';
}

export interface BurstOverlayState {
  type: BurstType;
  key: number;
  particles: OverlayParticle[];
  confetti: OverlayConfetti[];
  streaks: OverlayStreak[];
}

export const burstConfig: Record<BurstType, {
  Icon: BurstIconComponent;
  color: string;
  gradient: string;
}> = {
  like: {
    Icon: LikeIcon,
    color: 'text-red-500',
    gradient: 'radial-gradient(circle at center, rgba(244,63,94,0.35) 0%, rgba(244,63,94,0) 70%)',
  },
  dislike: {
    Icon: DislikeIcon,
    color: 'text-rose-500',
    gradient: 'radial-gradient(circle at center, rgba(244,114,182,0.32) 0%, rgba(244,114,182,0) 70%)',
  },
  block: {
    Icon: BlockIcon,
    color: 'text-blue-400',
    gradient: 'radial-gradient(circle at center, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0) 70%)',
  },
};

export const createOverlayParticles = (type: BurstType, key: number): OverlayParticle[] => {
  const { Icon, color } = burstConfig[type];
  const particleCount = 18;

  return Array.from({ length: particleCount }, (_, index) => {
    const angle = (360 / particleCount) * index + Math.random() * 20;
    const distance = 160 + Math.random() * 160;
    const rad = (angle * Math.PI) / 180;

    return {
      id: `${type}-overlay-${key}-${index}`,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      rotate: angle + Math.random() * 180,
      Icon,
      color,
    };
  });
};

export const createOverlayConfetti = (type: BurstType, key: number): OverlayConfetti[] => {
  const palette: Record<BurstType, string[]> = {
    like: ['#F87171', '#FB7185', '#FDE68A', '#F97316', '#FBB6CE', '#F9A8D4'],
    dislike: ['#FB7185', '#F43F5E', '#FDA4AF', '#FECACA', '#FDE68A', '#F97316'],
    block: ['#60A5FA', '#38BDF8', '#818CF8', '#A5B4FC', '#FBBF24', '#22D3EE'],
  };
  const count = 32;
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.random() * 360;
    const distance = 220 + Math.random() * 260;
    const rad = (angle * Math.PI) / 180;
    const driftAngle = Math.random() * 360;
    const driftRadius = 40 + Math.random() * 60;
    return {
      id: `${type}-confetti-${key}-${index}`,
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance,
      size: 8 + Math.random() * 14,
      color: palette[type][index % palette[type].length],
      rotate: Math.random() * 720,
      driftX: Math.cos(driftAngle) * driftRadius,
      driftY: Math.sin(driftAngle) * driftRadius,
      duration: 1.4 + Math.random() * 0.8,
      delay: (index % 5) * 0.05,
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as OverlayConfetti['shape'],
    };
  });
};

interface OverlayStreak {
  id: string;
  angle: number;
  length: number;
  delay: number;
}

export const createOverlayStreaks = (type: BurstType, key: number): OverlayStreak[] => {
  const count = 12;
  return Array.from({ length: count }, (_, index) => ({
    id: `${type}-streak-${key}-${index}`,
    angle: (360 / count) * index + Math.random() * 15,
    length: 140 + Math.random() * 120,
    delay: 0.05 * index,
  }));
};



 
  

export const ActionBar: React.FC<ActionBarProps> = ({
  liked,
  disliked,
  blocked,
  onLikeToggle,
  onDislikeToggle,
  onBlockToggle,
  onOpenGiftSelector,
  onOpenQuickMessageSelector,
  baseButtonStyle,
  viewMode,
  onTriggerOverlay,
}) => {
  interface Particle {
    id: string;
    x: number;
    y: number;
    rotate: number;
    Icon: BurstIconComponent;
    color: string;
  }


  const [animation, setAnimation] = useState<{ type: BurstType; key: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const createButtonParticles = (type: BurstType): Particle[] => {
    const { Icon, color } = burstConfig[type];
    const particleCount = 12;
    const now = Date.now();

    return Array.from({ length: particleCount }, (_, index) => {
      const angle = (360 / particleCount) * index + Math.random() * 25;
      const distance = 60 + Math.random() * 50;
      const rad = (angle * Math.PI) / 180;

      return {
        id: `${type}-button-${now}-${index}`,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        rotate: angle + Math.random() * 90,
        Icon,
        color,
      };
    });
  };

  const triggerAnimation = (type: BurstType) => {
    const key = Date.now();
    setAnimation({ type, key });
    setParticles(createButtonParticles(type));
    onTriggerOverlay(type);
  };

  useEffect(() => {
    if (!animation) return;
    const timeout = setTimeout(() => setAnimation(null), 600);
    return () => clearTimeout(timeout);
  }, [animation]);

  useEffect(() => {
    if (!particles.length) return;
    const timeout = setTimeout(() => setParticles([]), 650);
    return () => clearTimeout(timeout);
  }, [particles]);

  const iconStyle = "h-8 w-8 min-h-8  min-w-8 max-h-8 max-w-8"
  const buttonStyle = "p-2 h-12 w-12 max-w-12 min-h-12 flex items-center justify-center"
  const viewGridStyle = {
    "compact": "grid grid-cols-2 py-2 ",
    "card": "grid grid-cols-4",
    "list": "grid sm:grid-cols-4 grid-cols-2",
    "bubble": "grid sm:grid-cols-4 grid-cols-4"
  }
  return (
    <div className={`relative w-full ${viewGridStyle[viewMode]} justify-center place-items-center gap-2`}>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenQuickMessageSelector();
        }}
        className={`cursor-pointer rounded-full transition-all ${buttonStyle}  ${baseButtonStyle}`}
        aria-label="Send Message"
      >
        <ChatIcon className={iconStyle} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenGiftSelector();
        }}
        className={`hidden cursor-pointer rounded-full transition-all ${buttonStyle} ${baseButtonStyle}`}
        aria-label="Send Gift"
      >
        <Gift className={iconStyle} />
      </motion.button>

      <div className="relative overflow-visible">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            triggerAnimation('like');
            onLikeToggle();
          }}
          className={`cursor-pointer rounded-full transition-all ${buttonStyle} ${liked ? "text-red-500" : baseButtonStyle
            }`}
          aria-label="Like"
        >
          <LikeIcon className={iconStyle} />

        </motion.button>
        <AnimatePresence>
          {animation?.type === 'like' && (
            <motion.div
              key={`like-${animation.key}`}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 0.9, scale: 1.6, y: -20 }}
              exit={{ opacity: 0, scale: 1.8, y: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <Heart className="h-9 w-9 text-red-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative overflow-visible">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            triggerAnimation('dislike');
            onDislikeToggle();
          }}
          className={`cursor-pointer rounded-full transition-all ${buttonStyle} ${disliked ? "text-red-500" : baseButtonStyle
            }`}
          aria-label="Dislike"
        >
          <DislikeIcon className={iconStyle} />
        </motion.button>
        <AnimatePresence>
          {animation?.type === 'dislike' && (
            <motion.div
              key={`dislike-${animation.key}`}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 0.9, scale: 1.6, y: -20 }}
              exit={{ opacity: 0, scale: 1.8, y: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-red-500"
            >
              <HeartCrack className="h-9 w-9 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative overflow-visible">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            triggerAnimation('block');
            onBlockToggle();
          }}
          className={`cursor-pointer rounded-full transition-all ${buttonStyle} ${blocked ? "text-red-500" : baseButtonStyle
            }`}
          aria-label="Block">
          <BlockIcon className={iconStyle} />

        </motion.button>
        <AnimatePresence>
          {animation?.type === 'block' && (
            <motion.div
              key={`block-${animation.key}`}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 0.9, scale: 1.6, y: -20 }}
              exit={{ opacity: 0, scale: 1.8, y: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-blue-400"
            >
              <Shield className="h-9 w-9 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {!!particles.length && (
          <motion.div
            key={`burst-${animation?.key ?? 'particles'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-10"
          >
            {particles.map(({ id, x, y, rotate, Icon, color }) => (
              <motion.span
                key={id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, x, y, rotate }}
                exit={{ opacity: 0, scale: 0.4, x: x * 1.1, y: y * 1.1, rotate: rotate + 45 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute"
              >
                <Icon className={`h-5 w-5 drop-shadow-lg ${color}`} />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
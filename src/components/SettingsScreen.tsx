import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Eye,
    EyeOff,
    Trash2,
    ChevronRight,
    Shield,
    UserX,
    Mail,
    MessageSquare,
    Heart,
    ArrowLeft,
    AlertTriangle,
    Moon,
    Sun,
    Languages,
    Settings as SettingsIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Container from './Container';
import ConfirmationModal from './ConfirmationModal';
import LanguageSelectorModal from './LanguageSelector';

// --- Sub-components (Refined for a Professional Look) ---

const Section = memo(({ title, children, dark }: { title: string, children: React.ReactNode, dark: boolean }) => (
    <div className="mb-8">
        <h3 className={`px-4 mb-2 text-[10px] font-black uppercase tracking-[0.15em] ${dark ? 'text-white/30' : 'text-gray-400'}`}>
            {title}
        </h3>
        <div className={`overflow-hidden rounded-3xl border transition-all ${dark ? 'bg-gray-900/20 border-gray-800/40' : 'bg-white border-gray-100 shadow-sm'
            }`}>
            <div className={`divide-y ${dark ? 'divide-gray-800/40' : 'divide-gray-50'}`}>
                {children}
            </div>
        </div>
    </div>
));

Section.displayName = 'Section';

const SettingItem = memo(({
    icon: Icon,
    title,
    description,
    rightElement,
    onClick,
    dark,
    danger = false
}: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 px-5 transition-all text-left outline-none ${dark ? 'hover:bg-white/[0.04] active:bg-white/[0.08]' : 'hover:bg-gray-50 active:bg-gray-100'
            }`}
    >
        <div className="flex items-center gap-4">
            <div className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${danger
                ? (dark ? 'bg-red-500/10' : 'bg-red-50')
                : (dark ? 'bg-white/5' : 'bg-gray-50/50')
                }`}>
                <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : (dark ? 'text-white/60' : 'text-gray-500')}`} />
            </div>
            <div className="flex flex-col">
                <span className={`text-[13px] font-bold tracking-tight ${danger ? 'text-red-500' : (dark ? 'text-white/90' : 'text-gray-900')
                    }`}>
                    {title}
                </span>
                {description && (
                    <span className={`text-[11px] leading-relaxed mt-0.5 opacity-60 ${dark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {description}
                    </span>
                )}
            </div>
        </div>
        <div className="shrink-0 flex items-center ml-4">
            {rightElement}
        </div>
    </button>
));

SettingItem.displayName = 'SettingItem';

const Toggle = memo(({ value, dark }: { value: boolean, dark: boolean }) => (
    <div
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${value ? 'bg-emerald-500' : (dark ? 'bg-gray-800' : 'bg-gray-200')
            }`}
    >
        <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-[22px]' : 'translate-x-1'
                } mt-[4px]`}
        />
    </div>
));

Toggle.displayName = 'Toggle';

// --- Main Settings Screen ---

export default function SettingsScreen() {
    const { t, i18n } = useTranslation('common');
    const { theme, toggleTheme } = useTheme();
    const { settings, setOption } = useSettings();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const dark = theme === 'dark';

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

    const handleToggle = useCallback((name: any, currentVal: boolean) => {
        setOption(name, !currentVal);
    }, [setOption]);

    const currentLangName = i18n.language ? i18n.language.split('-')[0].toUpperCase() : 'EN';

    return (
        <Container className={`${dark ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
            <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${dark ? 'bg-black/80 border-gray-800/40' : 'bg-white/80 border-gray-100/60'}`}>
                <div className="max-w-2xl mx-auto w-full h-14 px-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full transition-all ${dark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className={`font-black text-xs uppercase tracking-[0.2em] ${dark ? 'text-white' : 'text-gray-900'}`}>
                        {t('settings.title')}
                    </h2>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-8 pb-40">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* General Settings */}
                    <Section title={t('settings.general.title', { defaultValue: 'General' })} dark={dark}>
                        <SettingItem
                            onClick={toggleTheme}
                            icon={dark ? Moon : Sun}
                            title={t('settings.general.dark_mode', { defaultValue: 'Dark Mode' })}
                            description={dark ? 'Karanlık tema aktif' : 'Aydınlık tema aktif'}
                            rightElement={<Toggle value={dark} dark={dark} />}
                            dark={dark}
                        />
                        <SettingItem
                            onClick={() => setIsLanguageModalOpen(true)}
                            icon={Languages}
                            title={t('settings.general.language', { defaultValue: 'Language' })}
                            description={currentLangName}
                            rightElement={<ChevronRight className="w-4 h-4 opacity-30" />}
                            dark={dark}
                        />
                    </Section>

                    {/* Notifications Settings */}
                    <Section title={t('settings.notifications.title')} dark={dark}>
                        <SettingItem
                            onClick={() => handleToggle('pushNotifications', !!settings.pushNotifications)}
                            icon={Bell}
                            title={t('settings.notifications.push')}
                            rightElement={<Toggle value={!!settings.pushNotifications} dark={dark} />}
                            dark={dark}
                        />
                        <SettingItem
                            onClick={() => handleToggle('emailNotifications', !!settings.emailNotifications)}
                            icon={Mail}
                            title={t('settings.notifications.email')}
                            rightElement={<Toggle value={!!settings.emailNotifications} dark={dark} />}
                            dark={dark}
                        />
                        <SettingItem
                            onClick={() => handleToggle('messageNotifications', !!settings.messageNotifications)}
                            icon={MessageSquare}
                            title={t('settings.notifications.messages')}
                            rightElement={<Toggle value={!!settings.messageNotifications} dark={dark} />}
                            dark={dark}
                        />
                        <SettingItem
                            onClick={() => handleToggle('matchNotifications', !!settings.matchNotifications)}
                            icon={Heart}
                            title={t('settings.notifications.matches')}
                            rightElement={<Toggle value={!!settings.matchNotifications} dark={dark} />}
                            dark={dark}
                        />
                    </Section>

                    {/* Content & Privacy */}
                    <Section title={t('settings.content.title')} dark={dark}>
                        <SettingItem
                            onClick={() => handleToggle('blurPhotos', !!settings.blurPhotos)}
                            icon={settings.blurPhotos ? EyeOff : Eye}
                            title={t('settings.content.blur_photos')}
                            description={t('settings.content.blur_description')}
                            rightElement={<Toggle value={!!settings.blurPhotos} dark={dark} />}
                            dark={dark}
                        />
                    </Section>

                    {/* Dangerous Zone */}
                    <Section title={t('settings.account.title')} dark={dark}>
                        <SettingItem
                            onClick={() => setIsDeleteModalOpen(true)}
                            icon={Trash2}
                            title={t('settings.account.delete_title')}
                            description={t('settings.account.delete_description')}
                            danger={true}
                            dark={dark}
                        />
                    </Section>

                    <div className="mt-12 text-center select-none">
                        <p className={`text-[9px] font-bold tracking-[0.3em] uppercase opacity-20 ${dark ? 'text-white' : 'text-gray-900'}`}>
                            CoolVibes Web v1.0.4
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Modals */}
            <LanguageSelectorModal
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    setIsDeleteModalOpen(false);
                    logout();
                    navigate('/landing');
                }}
                title={t('settings.account.delete_confirm_title')}
                message={t('settings.account.delete_confirm_message')}
                confirmText={t('settings.account.delete_button')}
                cancelText={t('app.cancel')}
                variant="danger"
                icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
            />
        </Container>
    );
}

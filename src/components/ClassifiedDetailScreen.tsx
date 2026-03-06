import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Send,
    MoreHorizontal,
    Share2,
    Calendar,
    ArrowLeft,
    MapPin,
    Clock,
    DollarSign,
    User,
    ArrowRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Container from './Container';

const MOCK_TOPICS = [
    {
        id: '1',
        type: 'hiring',
        category: 'Engineering',
        title: 'Senior Frontend Developer',
        description: 'Yeni nesil fintech projemiz için deneyimli bir React geliştirici arıyoruz. Modern tech stack ve yüksek otonomi.',
        details: 'Full-time • $4000 - $6000 • Remote',
        location: 'Remote',
        salary: '$4000 - $6000',
        workType: 'Full-time',
        author: {
            name: 'TechFlow Studio',
            role: 'Technology & Design Agency',
            avatar: 'https://i.pravatar.cc/150?u=techflow',
            isVerified: true
        },
        timestamp: '2 saat önce',
        requirements: [
            'En az 5 yıl profesyonel React deneyimi',
            'TypeScript ve Modern CSS (Tailwind) uzmanlığı',
            'Mikro-frontend ve performansa dayalı mimari bilgisi',
            'İyi derecede İngilizce (Yazılı/Sözlü)'
        ],
        perks: [
            'Rekabetçi maaş planı',
            'Haftalık 4 gün çalışma opsiyonu',
            'Sınırsız eğitim bütçesi ve konferans katılımı'
        ]
    },
    {
        id: '2',
        type: 'seeking',
        category: 'Design',
        title: 'Senior Product Designer',
        description: '5+ yıl deneyim. B2B SaaS ve mobil uygulama odaklı çalışıyorum. Yeni meydan okumalara hazırım.',
        details: 'Freelance/Full-time • İstanbul • Immediate',
        location: 'İstanbul / Remote',
        salary: 'Negotiable',
        workType: 'Freelance',
        author: {
            name: 'Can Demir',
            role: 'UI/UX Designer',
            avatar: 'https://i.pravatar.cc/150?u=can',
            isVerified: false
        },
        timestamp: '5 saat önce',
        requirements: [
            'Figma ve Adobe Creative Suite uzmanlığı',
            'B2B SaaS ürünlerinde deneyim',
            'Prototipleme ve kullanıcı araştırması yeteneği'
        ],
        perks: []
    }
];

export default function ClassifiedDetailScreen() {
    const { theme } = useTheme();
    const { id } = useParams();
    const navigate = useNavigate();
    const dark = theme === 'dark';

    const topic = useMemo(() => MOCK_TOPICS.find(t => t.id === id), [id]);

    if (!topic) return null;

    return (
        <Container className={`${dark ? 'bg-gray-950 text-white' : 'bg-white text-slate-900'}`}>
            {/* Premium Header - Persistent and Stylish */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${dark ? 'bg-gray-950/95 border-gray-900' : 'bg-white/95 border-slate-100'}`}>
                <div className="w-full h-14 md:h-16 px-4 md:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/classifieds')}
                            className={`p-2 rounded-full transition-all duration-200 mr-3 ${dark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className={`font-bold text-lg ${dark ? 'text-white' : 'text-gray-900'}`}>
                            İlan
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-gray-900 text-gray-500' : 'hover:bg-slate-50 text-slate-400'}`}>
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-gray-900 text-gray-500' : 'hover:bg-slate-50 text-slate-400'}`}>
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main
                className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12"
                style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col xl:flex-row gap-8 xl:gap-16"
                >

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Title Section */}
                        <div className="space-y-6 md:space-y-8">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${dark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                                    {topic.category}
                                </span>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${dark ? 'border-gray-800 text-gray-600' : 'border-slate-100 text-slate-400'}`}>
                                    #{topic.id}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] break-words">
                                {topic.title}
                            </h1>

                            {/* Responsive Metadata Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pt-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-indigo-500 uppercase tracking-widest text-[9px] font-black">
                                        <MapPin className="w-3 h-3" /> Lokasyon
                                    </div>
                                    <p className="text-xs md:text-sm font-bold font-mono uppercase truncate">{topic.location}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-emerald-500 uppercase tracking-widest text-[9px] font-black">
                                        <DollarSign className="w-3 h-3" /> Maaş
                                    </div>
                                    <p className="text-xs md:text-sm font-bold font-mono uppercase truncate">{topic.salary}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-amber-500 uppercase tracking-widest text-[9px] font-black">
                                        <Clock className="w-3 h-3" /> Çalışma
                                    </div>
                                    <p className="text-xs md:text-sm font-bold font-mono uppercase truncate">{topic.workType}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-purple-500 uppercase tracking-widest text-[9px] font-black">
                                        <Calendar className="w-3 h-3" /> Tarih
                                    </div>
                                    <p className="text-xs md:text-sm font-bold font-mono uppercase truncate">{topic.timestamp}</p>
                                </div>
                            </div>
                        </div>

                        <div className="my-10 md:my-14 h-px bg-gradient-to-r from-transparent via-gray-800/20 to-transparent" />

                        {/* Description Body */}
                        <div className="space-y-12 md:space-y-16">
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8 opacity-40">Hakkında</h3>
                                <p className={`text-lg md:text-xl lg:text-2xl leading-relaxed font-medium ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
                                    {topic.description}
                                </p>
                            </section>

                            {topic.requirements && (
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 md:mb-8 opacity-40">Beklentiler</h3>
                                    <div className="grid gap-4 md:gap-6">
                                        {topic.requirements.map((req, i) => (
                                            <div key={i} className={`flex items-start gap-5 p-5 md:p-6 rounded-[24px] border transition-colors ${dark ? 'border-gray-900 bg-gray-900/10 hover:border-gray-800' : 'border-slate-100 bg-slate-50/20 hover:border-slate-200'}`}>
                                                <div className="w-6 h-6 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                                                </div>
                                                <span className="text-sm md:text-base font-medium">{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area - Responsive Sticky */}
                    <div className="w-full xl:w-[360px] shrink-0">
                        <div className={`xl:sticky xl:top-24 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border ${dark ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex xl:flex-col items-center xl:text-center gap-5 xl:gap-0 xl:space-y-5 mb-8 md:mb-10">
                                <div className="relative shrink-0">
                                    <img src={topic.author.avatar} alt={topic.author.name} className="w-16 h-16 xl:w-28 xl:h-28 rounded-[24px] xl:rounded-[40px] grayscale border-2 border-slate-200" />
                                    {topic.author.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 xl:-bottom-2 xl:-right-2 bg-indigo-500 text-white p-1.5 rounded-lg xl:rounded-2xl border-4 border-gray-950">
                                            <ShieldCheck className="w-3 h-3 xl:w-5 xl:h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-base xl:text-xl uppercase tracking-tight truncate">{topic.author.name}</h4>
                                    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 ${dark ? 'text-gray-500' : 'text-slate-400'}`}>
                                        {topic.author.role}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                                <button className={`h-14 md:h-16 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${dark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}>
                                    <Send className="w-4 h-4" />
                                    Başvur
                                </button>
                                <button className={`h-14 md:h-16 rounded-2xl border flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-gray-800/10 ${dark ? 'border-gray-800 bg-gray-900/50' : 'border-slate-200 bg-transparent'}`}>
                                    <User className="w-4 h-4" />
                                    Profil
                                </button>
                            </div>

                            <div className={`mt-8 md:mt-12 pt-8 md:pt-10 border-t border-dashed ${dark ? 'border-gray-800' : 'border-slate-100'} space-y-4`}>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span>Hesap</span>
                                    <span className={dark ? 'text-white' : 'text-slate-900'}>Kurumsal</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span>İlanlar</span>
                                    <span className={dark ? 'text-white' : 'text-slate-900'}>12</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </Container>
    );
}

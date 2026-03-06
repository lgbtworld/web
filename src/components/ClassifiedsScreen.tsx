import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  X,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Send,
  MoreHorizontal,
  Globe,
  Briefcase
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Topic {
  id: string;
  type: 'seeking' | 'hiring';
  title: string;
  description: string;
  details: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  timestamp: string;
}

const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    type: 'hiring',
    title: 'Senior React Developer',
    description: 'Yeni nesil fintech projemiz için deneyimli bir React geliştirici arıyoruz. Modern tech stack ve yüksek otonomi.',
    details: 'Full-time • $4000 - $6000 • Remote',
    author: {
      name: 'TechFlow Studio',
      avatar: 'https://i.pravatar.cc/150?u=techflow',
      isVerified: true
    },
    timestamp: '12:45'
  },
  {
    id: '2',
    type: 'seeking',
    title: 'Senior Product Designer',
    description: '5+ yıl deneyim. B2B SaaS ve mobil uygulama odaklı çalışıyorum. Yeni meydan okumalara hazırım.',
    details: 'Freelance/Full-time • İstanbul • Immediate',
    author: {
      name: 'Can Demir',
      avatar: 'https://i.pravatar.cc/150?u=can',
      isVerified: false
    },
    timestamp: '14:20'
  }
];

export default function ClassifiedsScreen() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'seeking' | 'hiring'>('hiring');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = MOCK_TOPICS.filter(t => t.type === activeTab);

  return (
    <div className={`min-h-screen font-sans selection:bg-slate-900 selection:text-white ${dark ? 'bg-gray-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Professional Grid Header */}
      <header className={`sticky top-0 z-40 border-b ${dark ? 'bg-gray-950/80 backdrop-blur-md border-gray-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-4xl mx-auto flex items-stretch h-14">
          <div className={`flex items-center px-4 md:px-6 border-r ${dark ? 'border-gray-800' : 'border-slate-200'}`}>
            <Briefcase className="w-5 h-5" />
            <span className="ml-3 text-[10px] font-black uppercase tracking-widest hidden md:inline">İş Dünyası</span>
          </div>

          <div className="flex-1 flex items-center px-2 md:px-4 gap-1">
            <button
              onClick={() => { setActiveTab('hiring'); setSelectedTopic(null); }}
              className={`px-3 md:px-4 h-9 rounded text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'hiring'
                  ? dark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                  : dark ? 'text-gray-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              İş Veriyorum
            </button>
            <button
              onClick={() => { setActiveTab('seeking'); setSelectedTopic(null); }}
              className={`px-3 md:px-4 h-9 rounded text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'seeking'
                  ? dark ? 'bg-white text-black' : 'bg-slate-900 text-white'
                  : dark ? 'text-gray-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              İş Arıyorum
            </button>
          </div>

          <div className={`flex items-center px-2 md:px-4 border-l ${dark ? 'border-gray-800' : 'border-slate-200'}`}>
            <button
              onClick={() => setIsAddingTopic(true)}
              className={`h-9 px-3 md:px-4 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${dark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Konu Aç</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto relative lg:border-x lg:border-transparent">
        <AnimatePresence mode="wait">
          {!selectedTopic ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Search Bar - Integrated into Grid */}
              <div className={`border-b ${dark ? 'bg-gray-900/30 border-gray-800' : 'bg-slate-50/50 border-slate-200'}`}>
                <div className="relative flex items-center h-12 px-6">
                  <Search className={`w-4 h-4 ${dark ? 'text-gray-600' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    placeholder={`${activeTab === 'hiring' ? 'İlan' : 'Aday'} ara...`}
                    className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4 ${dark ? 'placeholder:text-gray-700 text-white' : 'placeholder:text-slate-300 text-slate-900'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className={`hidden md:flex items-center gap-2 text-[10px] font-mono uppercase ${dark ? 'text-gray-700' : 'text-slate-300'}`}>
                    <Globe className="w-3 h-3" />
                    Global Network
                  </div>
                </div>
              </div>

              {/* Feed - Structured List */}
              <div className={`divide-y ${dark ? 'divide-gray-800' : 'divide-slate-100'}`}>
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`group flex items-stretch transition-colors cursor-pointer ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                    >
                      {/* Time Column */}
                      <div className={`w-16 md:w-20 shrink-0 border-r flex flex-col items-center py-6 ${dark ? 'border-gray-800' : 'border-slate-100'}`}>
                        <span className={`text-[10px] font-mono font-bold ${dark ? 'text-gray-600' : 'text-slate-400'}`}>{topic.timestamp}</span>
                        <div className={`mt-2 w-px h-full ${dark ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-slate-100 group-hover:bg-slate-200'}`} />
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 p-5 md:p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className={`text-base font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{topic.title}</h3>
                              {topic.author.isVerified && <ShieldCheck className={`w-4 h-4 ${dark ? 'text-white' : 'text-slate-900'}`} />}
                            </div>
                            <div className="flex items-center gap-2">
                              <img src={topic.author.avatar} className="w-5 h-5 rounded-full grayscale" alt="" referrerPolicy="no-referrer" />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-gray-500' : 'text-slate-400'}`}>{topic.author.name}</span>
                            </div>
                          </div>
                          <button className={`p-2 transition-colors ${dark ? 'text-gray-600 hover:text-white' : 'text-slate-300 hover:text-slate-900'}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        <p className={`text-sm leading-relaxed max-w-2xl line-clamp-2 ${dark ? 'text-gray-400' : 'text-slate-600'}`}>
                          {topic.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-tighter px-2 py-1 rounded ${dark ? 'bg-gray-800 text-gray-400' : 'bg-slate-100 text-slate-400'}`}>
                              <MapPin className="w-3 h-3" />
                              {topic.details}
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform ${dark ? 'text-white' : 'text-slate-900'}`}>
                            Detayları Gör
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-32 text-center">
                    <MessageSquare className={`w-8 h-8 mx-auto mb-4 ${dark ? 'text-gray-800' : 'text-slate-200'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-gray-700' : 'text-slate-300'}`}>Henüz kayıt bulunamadı</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`min-h-[calc(100vh-3.5rem)] pb-20 ${dark ? 'bg-gray-950 text-white' : 'bg-white text-slate-900'}`}
            >
              {/* Detail Header */}
              <div className={`flex items-center h-12 px-6 border-b ${dark ? 'bg-gray-900/30 border-gray-800' : 'bg-slate-50/50 border-slate-100'}`}>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${dark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  <X className="w-3.5 h-3.5" />
                  Geri Dön
                </button>
                <div className={`mx-4 w-px h-4 ${dark ? 'bg-gray-800' : 'bg-slate-200'}`} />
                <span className={`text-[10px] font-mono font-bold uppercase ${dark ? 'text-gray-700' : 'text-slate-400'}`}>İş Detayı / {selectedTopic.id}</span>
              </div>

              <div className="p-6 md:p-10 space-y-10">
                {/* Author Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img src={selectedTopic.author.avatar} className="w-14 h-14 rounded-full grayscale" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-black uppercase tracking-widest ${dark ? 'text-white' : 'text-slate-900'}`}>{selectedTopic.author.name}</h4>
                        {selectedTopic.author.isVerified && <ShieldCheck className={`w-4 h-4 ${dark ? 'text-white' : 'text-slate-900'}`} />}
                      </div>
                      <p className={`text-[10px] font-mono font-bold uppercase mt-1 ${dark ? 'text-gray-600' : 'text-slate-400'}`}>Yayınlandı: {selectedTopic.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className={`h-10 px-6 border rounded text-[10px] font-black uppercase tracking-widest transition-colors ${dark ? 'border-gray-800 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                      Paylaş
                    </button>
                    <button className={`h-10 px-6 rounded text-[10px] font-black uppercase tracking-widest transition-colors ${dark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                      Mesaj Gönder
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                  <h2 className={`text-3xl md:text-4xl font-bold tracking-tighter leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedTopic.title}
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.details.split('•').map((tag, i) => (
                      <span key={i} className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase rounded ${dark ? 'bg-gray-900 text-gray-400' : 'bg-slate-100 text-slate-600'}`}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className={`prose max-w-none ${dark ? 'prose-invert' : 'prose-slate'}`}>
                    <p className={`text-lg leading-relaxed font-medium ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
                      {selectedTopic.description}
                    </p>
                    <div className={`mt-8 p-6 md:p-8 border rounded-lg ${dark ? 'border-gray-800 bg-gray-900/20' : 'border-slate-100 bg-slate-50/30'}`}>
                      <h5 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>Ek Bilgiler</h5>
                      <p className={`text-sm leading-relaxed ${dark ? 'text-gray-500' : 'text-slate-500'}`}>
                        Bu ilan topluluk kurallarına uygun olarak yayınlanmıştır. İletişime geçmek için yukarıdaki "Mesaj Gönder" butonunu kullanabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Professional Modal - No Shadows, Clean Borders */}
      <AnimatePresence>
        {isAddingTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className={`w-full max-w-lg border rounded-lg overflow-hidden ${dark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <div className={`flex items-center justify-between px-6 h-14 border-b ${dark ? 'bg-gray-950 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="text-xs font-black uppercase tracking-widest">
                  {activeTab === 'hiring' ? 'Yeni İş İlanı' : 'İş Arayışı Duyurusu'}
                </h3>
                <button
                  onClick={() => setIsAddingTopic(false)}
                  className={`p-2 transition-colors ${dark ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="p-6 md:p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddingTopic(false); }}>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-gray-600' : 'text-slate-400'}`}>Başlık</label>
                  <input
                    required
                    placeholder="Pozisyon veya yetenek özeti..."
                    className={`w-full h-12 px-4 border rounded focus:outline-none font-bold text-sm transition-colors ${dark
                        ? 'bg-gray-950 border-gray-800 focus:border-white text-white'
                        : 'bg-white border-slate-200 focus:border-slate-900 text-slate-900'
                      }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-gray-600' : 'text-slate-400'}`}>Açıklama</label>
                  <textarea
                    required
                    placeholder="Detaylı bilgi verin..."
                    className={`w-full p-4 border rounded focus:outline-none font-medium text-sm min-h-[120px] resize-none transition-colors ${dark
                        ? 'bg-gray-950 border-gray-800 focus:border-white text-white'
                        : 'bg-white border-slate-200 focus:border-slate-900 text-slate-900'
                      }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-gray-600' : 'text-slate-400'}`}>Metadata (Konum, Bütçe, Süre)</label>
                  <input
                    placeholder="örn: Remote • $5000 • Full-time"
                    className={`w-full h-12 px-4 border rounded focus:outline-none font-mono text-xs transition-colors ${dark
                        ? 'bg-gray-950 border-gray-800 focus:border-white text-white'
                        : 'bg-white border-slate-200 focus:border-slate-900 text-slate-900'
                      }`}
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className={`w-full h-14 text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 rounded ${dark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                  >
                    <Send className="w-4 h-4" />
                    Konuyu Yayınla
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

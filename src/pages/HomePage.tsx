import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLLECTIONS: string[] = [
  "bukhari", "muslim", "nasai", "abudawud", "tirmidhi", "ibnmajah", "malik"
];

const COLLECTION_NAMES: Record<string, Record<string, string>> = {
  bukhari:   { en: 'Bukhari',   ur: 'بخاری' },
  muslim:    { en: 'Muslim',     ur: 'مسلم' },
  nasai:     { en: 'Nasai',     ur: 'نسائی' },
  abudawud:  { en: 'Abu Dawud', ur: 'ابوداوود' },
  tirmidhi:  { en: 'Tirmidhi',  ur: 'ترمذی' },
  ibnmajah:  { en: 'Ibn Majah', ur: 'ابن ماجہ' },
  malik:     { en: 'Malik',     ur: 'مالک' },
};

const LANG_CONFIG = {
  en: { label: 'English', placeholder: 'Search hadiths... (e.g., patience, prayer, fasting)', btn: 'Search', helper: 'Leave all unchecked to search across all collections' },
  ur: { label: 'اردو', placeholder: 'احادیث تلاش کریں...', btn: 'تلاش کریں', helper: 'تمام پر چیک نہ کریں تو سب مجموعوں میں تلاش ہوگی' },
} as const;

function HomePage() {
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const navigate = useNavigate();

  const handleToggle = (col: string) => {
    setSelected(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const activeCollections = Object.keys(selected).filter(k => selected[k]);
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('lang', lang);
    if (activeCollections.length > 0) {
      params.set('collections', activeCollections.join(','));
    }
    navigate(`/search?${params.toString()}`);
  };

  const isRTL = lang === 'ur';
  const config = LANG_CONFIG[lang];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Logo / Title */}
      <div className="mb-8 sm:mb-12 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 006-2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Deen Companion
        </h1>
        <p className="text-gray-500 mt-2 text-xs sm:text-sm">Semantic Hadith Search across 7 collections</p>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center gap-1.5 mb-4 sm:mb-5">
        {(['en', 'ur'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              lang === l
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white/5 text-gray-500 border-white/10 hover:border-emerald-500/30 hover:text-gray-300'
            }`}
          >
            {LANG_CONFIG[l].label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl">
        <div className={`flex ${isRTL && "flex-row-reverse"} rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-[#12121a] focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] transition-all`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={config.placeholder}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex-1 px-4 py-3.5 sm:px-7 sm:py-4 outline-none text-sm sm:text-base text-white placeholder-gray-500 bg-transparent"
            style={{
              fontFamily: lang === 'ur'
                ? "'Noto Nastaliq', 'Noto Naskh Arabic', serif"
                : 'inherit',
              fontSize: lang === 'ur' ? '16px' : undefined
            }}
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-5 sm:px-8 text-sm sm:text-base font-semibold hover:bg-emerald-500 transition-colors"
          >
            {config.btn}
          </button>
        </div>
      </form>

      {/* Collection Pills */}
      <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-2xl px-4">
        {COLLECTIONS.map(col => (
          <button
            key={col}
            onClick={() => handleToggle(col)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all ${
              selected[col]
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-emerald-500/40 hover:text-gray-300'
            }`}
            style={lang === 'ur' ? { fontFamily: "'Noto Nastaliq', 'Noto Naskh Arabic', serif", fontSize: '13px' } : undefined}
          >
            {COLLECTION_NAMES[col][lang]}
          </button>
        ))}
      </div>

      <p className="mt-4 sm:mt-5 text-[11px] sm:text-xs text-gray-600"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={lang === 'ur' ? { fontFamily: "'Noto Nastaliq', 'Noto Naskh Arabic', serif", fontSize: '12px' } : undefined}
      >
        {config.helper}
      </p>
    </div>
  );
}

export default HomePage;
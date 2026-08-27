// ========== ResultsPage.tsx ==========
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

interface Hadith {
  collection: string;
  book_number: string;
  hadith_number: string;
  en: string | null;
  ar: string | null;
  ur: string | null;
  similarity_score: number;
  keyword_score: number;
  hybrid_score: number;
}

const COLLECTIONS: string[] = [
  "bukhari", "muslim", "nasai", "abudawud", "tirmidhi", "ibnmajah", "malik"
];

function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lang, setLang] = useState<'en' | 'ar' | 'ur'>('en');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const cols = searchParams.get('collections') || '';
    const map: Record<string, boolean> = {};
    if (cols) cols.split(',').forEach(c => { if (c) map[c] = true; });
    return map;
  });

  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdXR5cnVxa25pYWNlY2VkZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1Njg3MjYsImV4cCI6MjEwMzE0NDcyNn0.jNSojtF1MyFJH3sUR-z1SsgE5bmVU1G6lmT42OLLmC8";

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      const q = searchParams.get('q') || '';
      const collectionsString = searchParams.get('collections') || '';
      const collectionsArray = collectionsString
        ? collectionsString.split(',').filter(c => c.trim() !== '')
        : [];

      try {
        const response = await fetch(
          'https://nfutyruqkniacecederr.supabase.co/functions/v1/search-hadith',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ query: q, collections: collectionsArray })
          }
        );

        if (!response.ok) {
          setResults([]);
        } else {
          const data = await response.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  const handleReSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set('q', query);
    const activeCollections = Object.keys(selected).filter(k => selected[k]);
    if (activeCollections.length > 0) {
      params.set('collections', activeCollections.join(','));
    }
    setSearchParams(params);
     navigate(`/search?${params.toString()}`);
  };

  const handleToggle = (col: string) => {
    setSelected(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const getText = (hadith: Hadith) => {
    if (lang === 'ar') return hadith.ar;
    if (lang === 'ur') return hadith.ur;
    return hadith.en;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-400 hover:text-white shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <form onSubmit={handleReSearch} className="flex-1">
              <div className="flex rounded-xl border border-white/10 bg-[#12121a] overflow-hidden focus-within:border-emerald-500/50 transition-all">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 outline-none text-sm text-white bg-transparent"
                />
                <button type="submit" className="px-4 text-gray-400 hover:text-emerald-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Collection pills */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto">
            {COLLECTIONS.map(col => (
              <button
                key={col}
                onClick={() => handleToggle(col)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  selected[col]
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white/5 text-gray-500 border-white/10 hover:border-emerald-500/30 hover:text-gray-300'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 py-5">
        {/* Language Toggle */}
        <div className="flex items-center gap-1.5 mb-5">
          {(['en', 'ar', 'ur'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                lang === l
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white/5 text-gray-500 border-white/10 hover:border-emerald-500/30 hover:text-gray-300'
              }`}
            >
              {l === 'en' ? 'English' : l === 'ar' ? 'العربية' : 'اردو'}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-4 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#12121a] rounded-xl p-5 border border-white/5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 w-32 bg-white/5 rounded-full" />
                  <div className="h-4 w-10 bg-white/5 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                  <div className="h-3.5 w-5/6 bg-white/5 rounded" />
                  <div className="h-3.5 w-3/4 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-base">No hadiths found</p>
            <p className="text-gray-600 text-sm mt-1">Try different keywords</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((hadith, index) => {
              const text = getText(hadith);
              const semPct = Math.round(hadith.similarity_score * 100);
              const keyPct = Math.round(hadith.keyword_score * 100);
              const hybPct = Math.round(hadith.hybrid_score * 1000) / 10;
              return (
                <div
                  key={index}
                  className="bg-[#12121a] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                >
                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider">
                        {hadith.collection}
                      </span>
                      <span className="text-white/10">·</span>
                      <span className="text-gray-500 text-xs">
                        Book {hadith.book_number}, Hadith {hadith.hadith_number}
                      </span>
                    </div>
                  </div>

                  {/* Scores row */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <span className={`font-semibold ${semPct > 0 ? 'text-sky-400' : 'text-gray-700'}`}>{semPct}%</span>
                      <span className="text-gray-600">semantic</span>
                    </span>
                    <span className="text-white/10">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <span className={`font-semibold ${keyPct > 0 ? 'text-amber-400' : 'text-gray-700'}`}>{keyPct}%</span>
                      <span className="text-gray-600">keyword</span>
                    </span>
                    <span className="text-white/10">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <span className="font-semibold text-emerald-400">{hybPct}%</span>
                      <span className="text-gray-600">hybrid</span>
                    </span>
                  </div>

                  {/* Text */}
                  {text ? (
                    <p
                      className="text-gray-300 leading-relaxed text-[15px] group-hover:text-gray-200 transition-colors"
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      style={{ fontFamily: lang !== 'en' ? "'Amiri', 'Noto Naskh Arabic', serif" : 'inherit' }}
                    >
                      {text}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm italic">
                      Not available in {lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'Urdu'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;
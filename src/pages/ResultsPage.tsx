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

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdXR5cnVxa25pYWNlY2VkZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1Njg3MjYsImV4cCI6MjEwMzE0NDcyNn0.jNSojtF1MyFJH3sUR-z1SsgE5bmVU1G6lmT42OLLmC8";

function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [lang, setLang] = useState<'en' | 'ar' | 'ur'>(
    (searchParams.get('lang') as 'en' | 'ar' | 'ur') || 'en'
  );
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const cols = searchParams.get('collections') || '';
    const map: Record<string, boolean> = {};
    if (cols) cols.split(',').forEach(c => { if (c) map[c] = true; });
    return map;
  });

  const doFetch = async (targetPage: number, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setResults([]);
    }

    const q = searchParams.get('q') || '';
    const collectionsArray = (searchParams.get('collections') || '')
      .split(',').filter(c => c.trim() !== '');

    try {
      const response = await fetch(
        'https://nfutyruqkniacecederr.supabase.co/functions/v1/search-hadith',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ query: q, collections: collectionsArray, page: targetPage })
        }
      );

      if (!response.ok) {
        if (!append) setResults([]);
        setHasMore(false);
      } else {
        const data = await response.json();
        const newResults: Hadith[] = data.results || [];
        if (append) {
          setResults(prev => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }
        setHasMore(data.has_more || false);
        setPage(data.page || targetPage);
      }
    } catch {
      if (!append) setResults([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    const cols = searchParams.get('collections') || '';
    const map: Record<string, boolean> = {};
    if (cols) cols.split(',').forEach(c => { if (c) map[c] = true; });
    setSelected(map);
    setPage(1);
    setHasMore(false);
    doFetch(1, false);
    // eslint-disable-next-line
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
    navigate(`/search?${params.toString()}`);
    if (query == searchParams.get('q') && activeCollections.join(',') == searchParams.get('collections')) {
      params.set('refresh', Date.now().toString());
    }
    setSearchParams(params);
  };

  const handleToggle = (col: string) => {
    setSelected(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleLoadMore = () => {
    doFetch(page + 1, true);
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
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="text-gray-400 hover:text-white shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <form onSubmit={handleReSearch} className="flex-1">
              <div className="flex rounded-lg sm:rounded-xl border border-white/10 bg-[#12121a] overflow-hidden focus-within:border-emerald-500/50 transition-all">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 outline-none text-sm text-white bg-transparent"
                />
                <button type="submit" className="px-3 sm:px-4 text-gray-400 hover:text-emerald-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          <div className="flex gap-1 sm:gap-1.5 mt-2 overflow-x-auto pb-0.5 -mx-3 sm:-mx-4 px-3 sm:px-4">
            {COLLECTIONS.map(col => (
              <button
                key={col}
                onClick={() => handleToggle(col)}
                className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border transition-all ${
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
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-5">
        {/* Language Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5 mb-4 sm:mb-5">
          {(['en', 'ar', 'ur'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
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
          <div className="space-y-3 sm:space-y-4 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#12121a] rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/5 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 w-28 sm:w-32 bg-white/5 rounded-full" />
                  <div className="h-4 w-10 bg-white/5 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/5 rounded" />
                  <div className="h-3 w-5/6 bg-white/5 rounded" />
                  <div className="h-3 w-3/4 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-gray-500 text-sm sm:text-base">No hadiths found</p>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">Try different keywords</p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 sm:space-y-3">
              {results.map((hadith, index) => {
                const text = getText(hadith);
                const semPct = Math.round(hadith.similarity_score * 100);
                const keyPct = Math.round(hadith.keyword_score * 100);
                const hybPct = Math.round(hadith.hybrid_score * 1000) / 10;
                return (
                  <div
                    key={index}
                    className="bg-[#12121a] rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                  >
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">
                        {hadith.collection}
                      </span>
                      <span className="text-white/10">·</span>
                      <span className="text-gray-500 text-[11px] sm:text-xs">
                        Book {hadith.book_number}, Hadith {hadith.hadith_number}
                      </span>
                    </div>

                    {/* Scores row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px]">
                        <span className={`font-semibold ${semPct > 0 ? 'text-sky-400' : 'text-gray-700'}`}>{semPct}%</span>
                        <span className="text-gray-600">semantic</span>
                      </span>
                      <span className="text-white/10">·</span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px]">
                        <span className={`font-semibold ${keyPct > 0 ? 'text-amber-400' : 'text-gray-700'}`}>{keyPct}%</span>
                        <span className="text-gray-600">keyword</span>
                      </span>
                      <span className="text-white/10">·</span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px]">
                        <span className="font-semibold text-emerald-400">{hybPct}%</span>
                        <span className="text-gray-600">hybrid</span>
                      </span>
                    </div>

                    {/* Text */}
                    {text ? (
                      <p
                        className="text-gray-300 leading-relaxed text-sm sm:text-[15px] group-hover:text-gray-200 transition-colors"
                        dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}
                        style={{ fontFamily: lang === 'ar'
                            ? "'Amiri', 'Noto Naskh Arabic', serif"
                            : lang === 'ur'
                            ? "'Noto Nastaliq', 'Noto Naskh Arabic', serif"
                            : 'inherit', fontSize: lang !== 'en' ? '16px sm:17px' : undefined, lineHeight: lang === 'ur' ? '2' : lang === 'ar' ? '2.8' : undefined }}
                      >
                        {text}
                      </p>
                    ) : (
                      <p className="text-gray-600 text-xs sm:text-sm italic">
                        Not available in {lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'Urdu'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-5 sm:mt-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl text-sm font-medium border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ResultsPage;
// ========== HomePage.tsx ==========
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLLECTIONS: string[] = [
  "bukhari", "muslim", "nasai", "abudawud", "tirmidhi", "ibnmajah", "malik"
];

function HomePage() {
  const [query, setQuery] = useState<string>('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
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
    if (activeCollections.length > 0) {
      params.set('collections', activeCollections.join(','));
    }
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      {/* Logo / Title */}
      <div className="mb-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 006-2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Deen Companion
        </h1>
        <p className="text-gray-500 mt-2 text-sm">Semantic Hadith Search across 7 collections</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full max-w-2xl">
        <div className="flex rounded-2xl overflow-hidden border border-white/10 bg-[#12121a] focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] transition-all">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hadiths... (e.g., patience, prayer, fasting)"
            className="flex-1 px-7 py-4 outline-none text-base text-white placeholder-gray-500 bg-transparent"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-8 text-base font-semibold hover:bg-emerald-500 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Collection Pills */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl">
        {COLLECTIONS.map(col => (
          <button
            key={col}
            onClick={() => handleToggle(col)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              selected[col]
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-white/5 text-gray-400 border-white/10 hover:border-emerald-500/40 hover:text-gray-300'
            }`}
          >
            {col}
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs text-gray-600">
        Leave all unchecked to search across all collections
      </p>
    </div>
  );
}

export default HomePage;
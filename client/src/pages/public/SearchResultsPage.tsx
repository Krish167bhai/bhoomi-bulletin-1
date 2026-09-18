import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { PropertyCard } from '../../components/property/PropertyCard.js';
import { Search, Newspaper, Building2, Play } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';

  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<{
    properties: any[];
    articles: any[];
    videos: any[];
    total: number;
  }>({ properties: [], articles: [], videos: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runSearch = async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${typeFilter}`);
        if (res.data.success) {
          setResults({
            properties: res.data.properties || [],
            articles: res.data.articles || [],
            videos: res.data.videos || [],
            total: res.data.total || 0,
          });
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [query, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), type: typeFilter });
    }
  };

  const handleTypeChange = (newType: string) => {
    setSearchParams({ q: query, type: newType });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header Form */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div>
          <span className="text-red-400 font-bold text-xs uppercase tracking-wider block mb-1">
            Global Search
          </span>
          <h1 className="text-3xl font-extrabold font-['Outfit']">
            Search Bhoomi Bulletin
          </h1>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search properties, locations, news articles, video reports..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-800 text-white text-sm rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          <button
            type="submit"
            className="absolute right-2 top-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors uppercase tracking-wider"
          >
            Search
          </button>
        </form>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          {[
            { id: 'all', label: `All Results (${results.total})` },
            { id: 'properties', label: `Properties (${results.properties.length})` },
            { id: 'articles', label: `News & Articles (${results.articles.length})` },
            { id: 'videos', label: `Videos (${results.videos.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTypeChange(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === tab.id
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Rendering */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Searching across database...</div>
      ) : !query.trim() ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-600 font-medium">Type a search term above to find news, properties, and video reports.</p>
        </div>
      ) : results.total === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <h3 className="text-lg font-bold text-slate-800">No results found for "{query}"</h3>
          <p className="text-xs text-slate-500">Try using more generic keywords or check your spelling.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Properties Section */}
          {(typeFilter === 'all' || typeFilter === 'properties') && results.properties.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Building2 className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Matching Properties ({results.properties.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </section>
          )}

          {/* Articles Section */}
          {(typeFilter === 'all' || typeFilter === 'articles') && results.articles.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Newspaper className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  News &amp; Articles ({results.articles.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.articles.map((art) => (
                  <Link
                    key={art.id}
                    to={`/article/${art.slug}`}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        {art.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 mt-4 block">
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Videos Section */}
          {(typeFilter === 'all' || typeFilter === 'videos') && results.videos.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Play className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  Video News ({results.videos.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.videos.map((vid) => (
                  <Link
                    key={vid.id}
                    to={`/article/${vid.slug}`}
                    className="p-5 bg-slate-900 text-white rounded-2xl hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        Video Report
                      </span>
                      <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors line-clamp-2">
                        {vid.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {vid.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

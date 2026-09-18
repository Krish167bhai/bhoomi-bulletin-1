import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client.js';
import { Clock, ArrowRight, Filter } from 'lucide-react';

export const LatestNewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'ALL';
  const page = parseInt(searchParams.get('page') || '1');

  const [articles, setArticles] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const catParam = activeCategory !== 'ALL' ? `&category=${activeCategory}` : '';
        const res = await api.get(`/articles/published?page=${page}&limit=12${catParam}`);
        if (res.data.success) {
          setArticles(res.data.articles || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeCategory, page]);

  const categories = [
    { id: 'ALL', label: 'All News' },
    { id: 'NEWS', label: 'Breaking News' },
    { id: 'REAL_ESTATE', label: 'Real Estate Trends' },
    { id: 'ANNOUNCEMENT', label: 'Government & RERA' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Latest Real Estate News &amp; Market Intelligence
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Timely coverage of policy shifts, infrastructure corridors, RERA regulations, and Indian housing market analysis.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                if (cat.id === 'ALL') params.delete('category');
                else params.set('category', cat.id);
                params.set('page', '1');
                setSearchParams(params);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-600 font-semibold">No news articles found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div>
                <div className="h-52 w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={article.featuredImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center text-xs text-slate-400 space-x-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/article/${article.slug}`}>
                    <h2 className="font-bold text-base text-slate-900 line-clamp-2 hover:text-red-600 transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  to={`/article/${article.slug}`}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                setSearchParams(params);
              }}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                page === p ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

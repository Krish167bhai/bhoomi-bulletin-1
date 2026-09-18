import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { Clock, Eye, Share2, ArrowRight, User as UserIcon, Check } from 'lucide-react';

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/articles/slug/${slug}`);
        if (res.data.success && res.data.article) {
          setArticle(res.data.article);
          setRelated(res.data.related || []);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">Loading story...</div>;
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Article Not Found</h2>
        <Link to="/latest-news" className="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-lg text-xs font-semibold">
          Browse Latest News
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Category & Headline */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {article.category.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">|</span>
          <div className="flex items-center text-xs text-slate-500 space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-['Outfit'] leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            {article.excerpt}
          </p>
        )}

        {/* Author & Share Bar */}
        <div className="flex justify-between items-center py-3 border-y border-slate-200 text-xs text-slate-500">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {article.author?.name?.charAt(0) || 'B'}
            </div>
            <div>
              <span className="font-bold text-slate-800 block">{article.author?.name || 'Bhoomi Bulletin Editorial Team'}</span>
              <span className="text-[11px] text-slate-400">Special Real Estate Correspondent</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-slate-400">
              <Eye className="w-4 h-4" />
              <span>{article.viewsCount} reads</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center space-x-1 text-slate-700 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Media */}
      {article.category === 'VIDEO_NEWS' && article.videoUrl ? (
        <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video shadow-lg">
          {article.videoUrl.startsWith('http') && !article.videoUrl.startsWith('/uploads') ? (
            <iframe
              src={article.videoUrl.replace('watch?v=', 'embed/')}
              title={article.title}
              className="w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            <video src={article.videoUrl} controls className="w-full h-full object-cover" />
          )}
        </div>
      ) : article.featuredImage ? (
        <div className="rounded-2xl overflow-hidden bg-slate-100 shadow-sm max-h-[460px] w-full">
          <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      ) : null}

      {/* Main Body Content */}
      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
        {article.content}
      </div>

      {/* Related News Articles */}
      {related.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
            Related News &amp; Reports
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/article/${rel.slug}`}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-sm transition-all group"
              >
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                  {rel.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <div className="flex items-center text-xs font-semibold text-red-600 mt-2 space-x-1">
                  <span>Read full story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

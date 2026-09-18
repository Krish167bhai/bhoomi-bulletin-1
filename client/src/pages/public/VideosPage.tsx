import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { Play, Clock, ArrowRight, Video as VideoIcon } from 'lucide-react';

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await api.get('/articles/videos?limit=24');
        if (res.data.success) {
          setVideos(res.data.videos || []);
        }
      } catch (err) {
        console.error('Error loading video news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-2">
          <VideoIcon className="w-4 h-4" />
          <span>Broadcast &amp; Ground Reports</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Real Estate Video News &amp; Project Walkthroughs
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Watch comprehensive on-site inspections, infrastructure updates, developer interviews, and micro-market analysis videos.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-600">No video reports published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-md group flex flex-col justify-between"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={vid.featuredImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80'}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <Link
                  to={`/article/${vid.slug}`}
                  className="absolute inset-0 flex items-center justify-center bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 ml-0.5 fill-white" />
                  </div>
                </Link>
                <span className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-xs font-bold px-2.5 py-1 rounded">
                  Watch Report
                </span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center text-xs text-slate-400 space-x-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(vid.publishedAt || vid.createdAt).toLocaleDateString()}</span>
                </div>
                <Link to={`/article/${vid.slug}`}>
                  <h3 className="font-bold text-base text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                    {vid.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {vid.excerpt}
                </p>
                <div className="pt-2">
                  <Link
                    to={`/article/${vid.slug}`}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1"
                  >
                    <span>Watch Video &amp; Read Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

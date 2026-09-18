import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { PlusCircle, Edit, Trash2, ExternalLink, Eye } from 'lucide-react';

export const AdminNews: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/articles');
      if (res.data.success) {
        setArticles(res.data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await api.patch(`/admin/articles/${id}`, { isPublished: !current });
      fetchArticles();
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/admin/articles/${id}`);
      fetchArticles();
    } catch (err) {
      alert('Error deleting article.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            News &amp; Article Management
          </h1>
          <p className="text-xs text-slate-500">
            Publish, edit, and categorize breaking news, real estate trends, and video broadcasts.
          </p>
        </div>
        <Link
          to="/admin/create-post"
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg uppercase tracking-wider shadow"
        >
          + Create New Article
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No articles created yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Headline</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Views</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900 max-w-md truncate">
                    {art.title}
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                  </td>
                  <td className="p-4">{art.author?.name || 'Admin'}</td>
                  <td className="p-4 font-semibold">{art.viewsCount || 0}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        art.isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {art.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleTogglePublish(art.id, art.isPublished)}
                      className="px-2.5 py-1 border rounded text-[11px] font-semibold hover:bg-slate-100"
                    >
                      {art.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link
                      to={`/article/${art.slug}`}
                      target="_blank"
                      className="inline-block p-1 text-slate-500 hover:text-slate-900"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Video,
  FileText,
} from 'lucide-react';

export const AdminMediaLibrary: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media');
      if (res.data.success) {
        setMediaItems(res.data.media || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((f) => {
        formData.append('files', f);
      });

      const res = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        fetchMedia();
      }
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this media asset?')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      fetchMedia();
    } catch (err) {
      alert('Failed to delete media asset.');
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = mediaItems.filter((item) =>
    (item.originalName || item.filename).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <ImageIcon className="w-6 h-6 text-red-600" />
            <span>Persistent Media Library</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage high-resolution property photos, walkthrough videos, and banners stored persistently on disk.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider shadow cursor-pointer flex items-center space-x-1.5">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter media by filename..."
          className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading media library...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No media files uploaded yet. Click "Upload Media" above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              <div className="relative h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {item.mediaType === 'VIDEO' ? (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Video className="w-8 h-8 text-red-600 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Video</span>
                  </div>
                ) : item.mediaType === 'DOCUMENT' ? (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <FileText className="w-8 h-8 text-blue-600 mb-1" />
                    <span className="text-[10px] font-bold uppercase">PDF</span>
                  </div>
                ) : (
                  <img src={item.url} alt={item.originalName} className="w-full h-full object-cover" />
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    title="Copy URL"
                    className="p-1.5 bg-white rounded-full text-slate-800 hover:text-red-600 shadow"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete"
                    className="p-1.5 bg-white rounded-full text-slate-800 hover:text-red-600 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2 text-[10px] space-y-0.5">
                <div className="font-bold text-slate-800 truncate" title={item.originalName}>
                  {item.originalName}
                </div>
                <div className="text-slate-400">{(item.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

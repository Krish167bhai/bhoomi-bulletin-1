import React, { useState } from 'react';
import api from '../../api/client.js';
import { useBranding } from '../../context/BrandingContext.js';
import { Palette, Upload, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminBranding: React.FC = () => {
  const { branding, refreshBranding } = useBranding();

  const [desktopLogoFile, setDesktopLogoFile] = useState<File | null>(null);
  const [mobileLogoFile, setMobileLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const [previewDesktop, setPreviewDesktop] = useState<string>(branding.logoDesktop || '/logo.svg');
  const [previewMobile, setPreviewMobile] = useState<string>(branding.logoMobile || '/logo.svg');
  const [previewFavicon, setPreviewFavicon] = useState<string>(branding.favicon || '/favicon.ico');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDesktopLogoFile(file);
      setPreviewDesktop(URL.createObjectURL(file));
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMobileLogoFile(file);
      setPreviewMobile(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      setPreviewFavicon(URL.createObjectURL(file));
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      let uploadedUrls: Record<string, string> = {};

      // 1. Upload files if selected
      if (desktopLogoFile || mobileLogoFile || faviconFile) {
        const formData = new FormData();
        if (desktopLogoFile) formData.append('logoDesktop', desktopLogoFile);
        if (mobileLogoFile) formData.append('logoMobile', mobileLogoFile);
        if (faviconFile) formData.append('favicon', faviconFile);

        const uploadRes = await api.post('/upload/branding', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data.success) {
          uploadedUrls = uploadRes.data.urls || {};
        }
      }

      // 2. Update site settings table
      const updates: Record<string, string> = {};
      if (uploadedUrls.logoDesktop) updates.site_logo_desktop = uploadedUrls.logoDesktop;
      if (uploadedUrls.logoMobile) updates.site_logo_mobile = uploadedUrls.logoMobile;
      if (uploadedUrls.favicon) updates.site_favicon = uploadedUrls.favicon;

      if (Object.keys(updates).length > 0) {
        await api.post('/admin/settings', updates);
      }

      // 3. Immediately refresh branding context throughout entire website without code restart!
      await refreshBranding();
      setSuccess(true);
    } catch (err) {
      alert('Failed to save branding updates.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Reset branding back to default SVG logo?')) return;
    setSaving(true);
    try {
      await api.post('/admin/settings', {
        site_logo_desktop: '/logo.svg',
        site_logo_mobile: '/logo.svg',
        site_favicon: '/favicon.ico',
      });
      await refreshBranding();
      setPreviewDesktop('/logo.svg');
      setPreviewMobile('/logo.svg');
      setPreviewFavicon('/favicon.ico');
      setSuccess(true);
    } catch (err) {
      alert('Error resetting branding.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Palette className="w-6 h-6 text-red-600" />
          <span>Logo &amp; Dynamic Branding Management</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload and preview desktop logos, mobile logos, and favicons. Changes apply across the website instantly with zero code rebuild.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-800 flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>Branding updated successfully! The new logo is now active throughout the entire website.</span>
        </div>
      )}

      <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* 1. Desktop Logo */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Desktop Website Logo</h3>
              <p className="text-[11px] text-slate-400">Used in main desktop header navigation (Recommended: SVG or Transparent PNG, 400x80)</p>
            </div>
            <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-1.5 shadow">
              <Upload className="w-3.5 h-3.5" />
              <span>Replace Logo</span>
              <input type="file" accept="image/*" onChange={handleDesktopChange} className="hidden" />
            </label>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
            <img src={previewDesktop} alt="Desktop Logo Preview" className="h-14 max-w-full object-contain" />
          </div>
        </div>

        {/* 2. Mobile Logo */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Mobile Menu Logo</h3>
              <p className="text-[11px] text-slate-400">Displayed on smartphone headers and drawer navigation</p>
            </div>
            <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-1.5 shadow">
              <Upload className="w-3.5 h-3.5" />
              <span>Replace Mobile Logo</span>
              <input type="file" accept="image/*" onChange={handleMobileChange} className="hidden" />
            </label>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
            <img src={previewMobile} alt="Mobile Logo Preview" className="h-10 max-w-full object-contain" />
          </div>
        </div>

        {/* 3. Favicon */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Browser Favicon</h3>
              <p className="text-[11px] text-slate-400">Displayed in browser tabs and bookmark shortcuts (.ico or .png, 32x32)</p>
            </div>
            <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-1.5 shadow">
              <Upload className="w-3.5 h-3.5" />
              <span>Replace Favicon</span>
              <input type="file" accept="image/*,.ico" onChange={handleFaviconChange} className="hidden" />
            </label>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-4">
            <img src={previewFavicon} alt="Favicon Preview" className="w-8 h-8 object-contain bg-white rounded shadow-sm border p-1" />
            <span className="text-xs text-slate-500 font-medium">Favicon preview as it appears in browser tabs</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default Logo</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? 'Uploading & Updating...' : 'Save & Publish Branding'}
          </button>
        </div>
      </form>
    </div>
  );
};

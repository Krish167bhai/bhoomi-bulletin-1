import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Globe,
  Share2,
  Search,
  CreditCard,
  Puzzle,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import api from '../../api/client.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsMap {
  [key: string]: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

type TabId = 'general' | 'social' | 'seo' | 'payments' | 'integrations';

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InputProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

const Field: React.FC<InputProps> = ({ label, id, value, onChange, type = 'text', placeholder, hint, disabled }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
    />
    {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
  </div>
);

interface MaskedFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}

const MaskedField: React.FC<MaskedFieldProps> = ({ label, id, value, onChange, placeholder, hint }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={revealed ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••••••••••••••'}
          className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-300"
        />
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={revealed ? 'Hide value' : 'Reveal value'}
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
};

interface ToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
    <div>
      <p className="text-xs font-semibold text-slate-800">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-red-600' : 'bg-slate-300'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

interface ToastBannerProps {
  toast: Toast | null;
}

const ToastBanner: React.FC<ToastBannerProps> = ({ toast }) => {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-medium border ${
        isSuccess
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      )}
      <span>{toast.message}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // ── General Settings ──
  const [siteName, setSiteName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');

  // ── Social Links ──
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState('');

  // ── SEO ──
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [gaId, setGaId] = useState('');

  // ── Payment Gateway ──
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  // ── SMS Provider ──
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioEnabled, setTwilioEnabled] = useState(false);

  // ── Map Settings ──
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [defaultLat, setDefaultLat] = useState('');
  const [defaultLng, setDefaultLng] = useState('');

  // ─── Load Settings ────────────────────────────────────────────────────────

  const populateFromMap = useCallback((data: SettingsMap) => {
    setSiteName(data.site_name ?? '');
    setTagline(data.site_tagline ?? '');
    setContactEmail(data.contact_email ?? '');
    setContactPhone(data.contact_phone ?? '');
    setAddress(data.contact_address ?? '');

    setFacebook(data.social_facebook ?? '');
    setTwitter(data.social_twitter ?? '');
    setInstagram(data.social_instagram ?? '');
    setYoutube(data.social_youtube ?? '');
    setLinkedin(data.social_linkedin ?? '');

    setMetaDescription(data.seo_meta_description ?? '');
    setMetaKeywords(data.seo_meta_keywords ?? '');
    setGaId(data.seo_ga_id ?? '');

    setRazorpayKeyId(data.payment_razorpay_key_id ?? '');
    setRazorpayEnabled(data.payment_razorpay_enabled === 'true');

    setTwilioSid(data.sms_twilio_account_sid ?? '');
    setTwilioEnabled(data.sms_twilio_enabled === 'true');

    setMapsApiKey(data.maps_google_api_key ?? '');
    setDefaultLat(data.maps_default_lat ?? '');
    setDefaultLng(data.maps_default_lng ?? '');
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        // API may return { settings: {...} } or directly an object
        const raw: SettingsMap = res.data?.settings ?? res.data ?? {};
        populateFromMap(raw);
      } catch {
        showToast('error', 'Failed to load settings from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [populateFromMap]);

  // ─── Toast Helper ─────────────────────────────────────────────────────────

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Save Handlers ────────────────────────────────────────────────────────

  const saveTab = async (updates: SettingsMap) => {
    setSaving(true);
    try {
      await api.put('/settings', updates);
      showToast('success', 'Settings saved successfully.');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save settings. Please try again.';
      showToast('error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) { showToast('error', 'Site name is required.'); return; }
    if (!contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      showToast('error', 'A valid contact email is required.'); return;
    }
    saveTab({
      site_name: siteName,
      site_tagline: tagline,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      contact_address: address,
    });
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    saveTab({
      social_facebook: facebook,
      social_twitter: twitter,
      social_instagram: instagram,
      social_youtube: youtube,
      social_linkedin: linkedin,
    });
  };

  const handleSaveSEO = (e: React.FormEvent) => {
    e.preventDefault();
    saveTab({
      seo_meta_description: metaDescription,
      seo_meta_keywords: metaKeywords,
      seo_ga_id: gaId,
    });
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    if (razorpayEnabled && !razorpayKeyId.trim()) {
      showToast('error', 'Razorpay Key ID is required when payment gateway is enabled.'); return;
    }
    saveTab({
      payment_razorpay_key_id: razorpayKeyId,
      payment_razorpay_enabled: String(razorpayEnabled),
    });
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    if (twilioEnabled && !twilioSid.trim()) {
      showToast('error', 'Twilio Account SID is required when SMS is enabled.'); return;
    }
    if (defaultLat && isNaN(Number(defaultLat))) {
      showToast('error', 'Default latitude must be a valid number.'); return;
    }
    if (defaultLng && isNaN(Number(defaultLng))) {
      showToast('error', 'Default longitude must be a valid number.'); return;
    }
    saveTab({
      sms_twilio_account_sid: twilioSid,
      sms_twilio_enabled: String(twilioEnabled),
      maps_google_api_key: mapsApiKey,
      maps_default_lat: defaultLat,
      maps_default_lng: defaultLng,
    });
  };

  // ─── Tab Config ───────────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'social', label: 'Social', icon: <Share2 className="w-3.5 h-3.5" /> },
    { id: 'seo', label: 'SEO', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Puzzle className="w-3.5 h-3.5" /> },
  ];

  const SaveButton = () => (
    <div className="pt-4 border-t border-slate-100 flex justify-end">
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-md transition-all"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        <span>{saving ? 'Saving…' : 'Save Changes'}</span>
      </button>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Settings className="w-6 h-6 text-red-600" />
          <span>Site Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your website's global configuration, integrations, and appearance settings.
        </p>
      </div>

      {/* Toast */}
      <ToastBanner toast={toast} />

      {/* Tab Bar */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">

        {/* ── General ── */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Site Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Site Name"
                id="site_name"
                value={siteName}
                onChange={setSiteName}
                placeholder="Bhoomi Bulletin"
                hint="Displayed in the browser tab and various headings"
              />
              <Field
                label="Tagline"
                id="site_tagline"
                value={tagline}
                onChange={setTagline}
                placeholder="Your trusted real estate platform"
              />
              <Field
                label="Contact Email"
                id="contact_email"
                value={contactEmail}
                onChange={setContactEmail}
                type="email"
                placeholder="admin@example.com"
              />
              <Field
                label="Contact Phone"
                id="contact_phone"
                value={contactPhone}
                onChange={setContactPhone}
                placeholder="+91 98765 43210"
              />
            </div>
            <Field
              label="Address"
              id="contact_address"
              value={address}
              onChange={setAddress}
              placeholder="123 Main St, City, State, PIN"
              hint="Shown in the footer and contact page"
            />
            <SaveButton />
          </form>
        )}

        {/* ── Social ── */}
        {activeTab === 'social' && (
          <form onSubmit={handleSaveSocial} className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Social Media Links
            </h2>
            <p className="text-[11px] text-slate-400">
              Enter full URLs including <code className="bg-slate-100 px-1 rounded">https://</code>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Facebook" id="facebook" value={facebook} onChange={setFacebook} placeholder="https://facebook.com/yourpage" />
              <Field label="Twitter / X" id="twitter" value={twitter} onChange={setTwitter} placeholder="https://twitter.com/yourhandle" />
              <Field label="Instagram" id="instagram" value={instagram} onChange={setInstagram} placeholder="https://instagram.com/yourprofile" />
              <Field label="YouTube" id="youtube" value={youtube} onChange={setYoutube} placeholder="https://youtube.com/@yourchannel" />
              <Field label="LinkedIn" id="linkedin" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/company/yourpage" />
            </div>
            <SaveButton />
          </form>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <form onSubmit={handleSaveSEO} className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              SEO Defaults
            </h2>
            <div className="space-y-1.5">
              <label htmlFor="meta_description" className="block text-xs font-semibold text-slate-700">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                maxLength={160}
                placeholder="A concise description for search engine results (max 160 characters)"
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-300 resize-none"
              />
              <p className="text-[11px] text-slate-400 text-right">{metaDescription.length}/160</p>
            </div>
            <Field
              label="Meta Keywords"
              id="meta_keywords"
              value={metaKeywords}
              onChange={setMetaKeywords}
              placeholder="real estate, properties, buy, sell, rent"
              hint="Comma-separated keywords (limited SEO value in modern search engines)"
            />
            <Field
              label="Google Analytics Measurement ID"
              id="ga_id"
              value={gaId}
              onChange={setGaId}
              placeholder="G-XXXXXXXXXX"
              hint="Paste your GA4 Measurement ID to enable site analytics tracking"
            />
            <SaveButton />
          </form>
        )}

        {/* ── Payments ── */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSavePayments} className="space-y-5">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Payment Gateway — Razorpay
            </h2>
            <Toggle
              label="Enable Razorpay Payments"
              description="Accept online payments for listings, subscriptions, and featured ads"
              enabled={razorpayEnabled}
              onToggle={() => setRazorpayEnabled((p) => !p)}
            />
            <MaskedField
              label="Razorpay Key ID"
              id="razorpay_key_id"
              value={razorpayKeyId}
              onChange={setRazorpayKeyId}
              placeholder="rzp_live_••••••••••••"
              hint="Your Razorpay live/test Key ID from the Razorpay Dashboard"
            />
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
              <strong>Security note:</strong> Store your Razorpay Key Secret in a server-side environment variable, never here.
            </div>
            <SaveButton />
          </form>
        )}

        {/* ── Integrations ── */}
        {activeTab === 'integrations' && (
          <form onSubmit={handleSaveIntegrations} className="space-y-6">
            {/* SMS */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>SMS Provider — Twilio</span>
              </h2>
              <Toggle
                label="Enable SMS Notifications"
                description="Send OTP, alerts, and listing updates via Twilio SMS"
                enabled={twilioEnabled}
                onToggle={() => setTwilioEnabled((p) => !p)}
              />
              <MaskedField
                label="Twilio Account SID"
                id="twilio_sid"
                value={twilioSid}
                onChange={setTwilioSid}
                placeholder="AC••••••••••••••••••••••••••••"
                hint="Found in your Twilio Console dashboard"
              />
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800">
                Keep your Twilio Auth Token in a server environment variable for security.
              </div>
            </div>

            {/* Maps */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Map Settings — Google Maps</span>
              </h2>
              <MaskedField
                label="Google Maps API Key"
                id="maps_api_key"
                value={mapsApiKey}
                onChange={setMapsApiKey}
                placeholder="AIza••••••••••••••••••••••••"
                hint="Enable 'Maps JavaScript API' and 'Places API' in Google Cloud Console"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Default Map Center — Latitude"
                  id="default_lat"
                  value={defaultLat}
                  onChange={setDefaultLat}
                  placeholder="28.6139"
                  hint="Decimal degrees (e.g., 28.6139 for New Delhi)"
                />
                <Field
                  label="Default Map Center — Longitude"
                  id="default_lng"
                  value={defaultLng}
                  onChange={setDefaultLng}
                  placeholder="77.2090"
                  hint="Decimal degrees (e.g., 77.2090 for New Delhi)"
                />
              </div>
            </div>

            <SaveButton />
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  Monitor,
  Activity,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Smartphone,
  Globe,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/client.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Toast {
  type: 'success' | 'error';
  message: string;
}

interface Session {
  id: string;
  deviceType: string;
  userAgent: string;
  ipAddress: string;
  lastActive: string;
  isCurrent?: boolean;
}

interface LoginEvent {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success?: boolean;
}

type SectionId = 'password' | 'sessions' | '2fa' | 'activity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const truncateUA = (ua: string, max = 60): string =>
  ua.length > max ? ua.slice(0, max) + '…' : ua;

// ─── Sub-components ───────────────────────────────────────────────────────────

const ToastBanner: React.FC<{ toast: Toast | null }> = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div
      className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-medium border ${
        ok ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      )}
      <span>{toast.message}</span>
    </div>
  );
};

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ id, label, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••••••'}
          className={`w-full text-xs border rounded-xl px-4 py-2.5 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-300 ${
            error ? 'border-red-400' : 'border-slate-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
};

// ─── Section: Change Password ─────────────────────────────────────────────────

const ChangePasswordSection: React.FC<{ onToast: (t: Toast) => void }> = ({ onToast }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!current.trim()) e.current = 'Current password is required.';
    if (!next.trim()) {
      e.next = 'New password is required.';
    } else if (next.length < 8) {
      e.next = 'New password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(next)) {
      e.next = 'New password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(next)) {
      e.next = 'New password must contain at least one number.';
    }
    if (!confirm.trim()) {
      e.confirm = 'Please confirm your new password.';
    } else if (next !== confirm) {
      e.confirm = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: current,
        newPassword: next,
      });
      onToast({ type: 'success', message: 'Password changed successfully. Please keep it safe.' });
      setCurrent('');
      setNext('');
      setConfirm('');
      setErrors({});
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to change password. Check your current password and try again.';
      onToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const strengthLevel = (): { label: string; color: string; width: string } => {
    if (next.length === 0) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (next.length >= 8) score++;
    if (/[A-Z]/.test(next)) score++;
    if (/[0-9]/.test(next)) score++;
    if (/[^A-Za-z0-9]/.test(next)) score++;
    if (next.length >= 14) score++;
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: '40%' };
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: 'bg-green-400', width: '80%' };
    return { label: 'Very Strong', color: 'bg-green-600', width: '100%' };
  };

  const strength = strengthLevel();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordInput
        id="current_password"
        label="Current Password"
        value={current}
        onChange={setCurrent}
        error={errors.current}
      />
      <PasswordInput
        id="new_password"
        label="New Password"
        value={next}
        onChange={setNext}
        placeholder="Min. 8 chars, 1 uppercase, 1 number"
        error={errors.next}
      />
      {next.length > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: strength.width }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Password strength: <span className="font-semibold">{strength.label}</span>
          </p>
        </div>
      )}
      <PasswordInput
        id="confirm_password"
        label="Confirm New Password"
        value={confirm}
        onChange={setConfirm}
        error={errors.confirm}
      />
      <div className="pt-2 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider shadow-md transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          <span>{saving ? 'Updating…' : 'Update Password'}</span>
        </button>
      </div>
    </form>
  );
};

// ─── Section: Active Sessions ─────────────────────────────────────────────────

const ActiveSessionsSection: React.FC<{ onToast: (t: Toast) => void }> = ({ onToast }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/sessions');
        setSessions(res.data?.sessions ?? res.data ?? []);
      } catch {
        // Sessions endpoint may not be implemented — treat as empty list
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Revoke this session? The device will be signed out immediately.')) return;
    setRevoking(sessionId);
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      onToast({ type: 'success', message: 'Session revoked successfully.' });
    } catch {
      onToast({ type: 'error', message: 'Failed to revoke session. Please try again.' });
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Monitor className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-xs font-medium">No active sessions found.</p>
        <p className="text-[11px] mt-1">Session management may not be enabled on the server yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-center justify-between p-4 rounded-xl border ${
            session.isCurrent
              ? 'bg-green-50 border-green-200'
              : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-start space-x-3 min-w-0">
            <div className="mt-0.5 flex-shrink-0">
              {session.deviceType === 'mobile' ? (
                <Smartphone className="w-4 h-4 text-slate-500" />
              ) : (
                <Monitor className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {session.ipAddress || 'Unknown IP'}
                </p>
                {session.isCurrent && (
                  <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">{truncateUA(session.userAgent)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(session.lastActive)}</span>
              </p>
            </div>
          </div>
          {!session.isCurrent && (
            <button
              onClick={() => handleRevoke(session.id)}
              disabled={revoking === session.id}
              className="ml-4 flex-shrink-0 inline-flex items-center space-x-1 text-[11px] font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {revoking === session.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span>Revoke</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Section: 2FA Placeholder ─────────────────────────────────────────────────

const TwoFactorSection: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-6 h-6 text-slate-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Add an extra layer of security to your admin account using an authenticator app (TOTP).
        </p>
      </div>
    </div>
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
      <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div className="text-[11px] text-blue-800 space-y-1">
        <p className="font-semibold">Coming Soon</p>
        <p>
          Two-factor authentication via TOTP (Google Authenticator / Authy) is being integrated into Bhoomi Bulletin.
          Once enabled, you'll be required to enter a 6-digit verification code on every admin login.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { step: '1', title: 'Install App', desc: 'Download Google Authenticator or Authy on your phone' },
        { step: '2', title: 'Scan QR Code', desc: 'Scan the QR code generated by Bhoomi Bulletin admin panel' },
        { step: '3', title: 'Enter Code', desc: 'Enter the 6-digit OTP at login to verify your identity' },
      ].map((item) => (
        <div key={item.step} className="p-4 bg-white border border-slate-100 rounded-xl space-y-1 opacity-60">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">
            {item.step}
          </div>
          <p className="text-xs font-semibold text-slate-700">{item.title}</p>
          <p className="text-[11px] text-slate-400">{item.desc}</p>
        </div>
      ))}
    </div>
    <button
      type="button"
      disabled
      className="inline-flex items-center space-x-2 bg-slate-200 text-slate-400 font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider cursor-not-allowed"
    >
      <ShieldCheck className="w-4 h-4" />
      <span>Enable 2FA — Coming Soon</span>
    </button>
  </div>
);

// ─── Section: Login Activity Log ──────────────────────────────────────────────

const LoginActivitySection: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/analytics/events', {
          params: { type: 'LOGIN', limit: 20 },
        });
        const raw = res.data?.events ?? res.data?.data ?? res.data ?? [];
        setEvents(Array.isArray(raw) ? raw : []);
      } catch {
        setError('Unable to load login activity. The analytics endpoint may not be available.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-xs font-medium">No login activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wide text-[10px]">
            <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
            <th className="px-4 py-3 whitespace-nowrap">IP Address</th>
            <th className="px-4 py-3">User Agent</th>
            <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {events.map((ev, idx) => (
            <tr key={ev.id ?? idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                {formatDate(ev.timestamp)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="inline-flex items-center space-x-1 text-slate-700">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>{ev.ipAddress || '—'}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                {truncateUA(ev.userAgent || '—', 70)}
              </td>
              <td className="px-4 py-3 text-center">
                {ev.success === false ? (
                  <span className="inline-flex items-center space-x-1 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3" />
                    <span>Failed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Success</span>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminSecurity: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('password');
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4500);
  };

  const sections: { id: SectionId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'password', label: 'Change Password', icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: 'sessions', label: 'Active Sessions', icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: '2fa', label: '2FA', icon: <ShieldCheck className="w-3.5 h-3.5" />, badge: 'Soon' },
    { id: 'activity', label: 'Login Activity', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Lock className="w-6 h-6 text-red-600" />
          <span>Password &amp; Security</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your admin account security: change your password, review active sessions, and monitor login activity.
        </p>
      </div>

      {/* Toast */}
      <ToastBanner toast={toast} />

      {/* Section Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === s.id
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s.icon}
            <span>{s.label}</span>
            {s.badge && (
              <span className="bg-slate-300 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section Panels */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {activeSection === 'password' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Change Password</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Use a strong password with at least 8 characters, one uppercase letter, and one number.
              </p>
            </div>
            <ChangePasswordSection onToast={showToast} />
          </div>
        )}

        {activeSection === 'sessions' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-slate-500" />
                <span>Active Sessions</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                These are all devices currently signed in to your admin account. Revoke any sessions you don't recognize.
              </p>
            </div>
            <ActiveSessionsSection onToast={showToast} />
          </div>
        )}

        {activeSection === '2fa' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Two-Factor Authentication</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Secure your account with a second verification step at login.
              </p>
            </div>
            <TwoFactorSection />
          </div>
        )}

        {activeSection === 'activity' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <span>Login Activity Log</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Last 20 login attempts to your admin account. If you see unfamiliar activity, change your password immediately.
              </p>
            </div>
            <LoginActivitySection />
          </div>
        )}
      </div>
    </div>
  );
};

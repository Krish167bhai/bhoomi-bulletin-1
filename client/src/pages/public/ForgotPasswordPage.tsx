import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState<{ message: string; resetUrl?: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setResetData({
          message: res.data.message,
          resetUrl: res.data.resetUrl,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
            Password Recovery
          </h1>
          <p className="text-xs text-slate-500">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetData ? (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{resetData.message}</p>

            {resetData.resetUrl && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Development / Instant Reset Link:</span>
                <Link
                  to={resetData.resetUrl}
                  className="text-red-600 font-mono break-all hover:underline block"
                >
                  {window.location.origin + resetData.resetUrl}
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-red-600 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Generating Link...' : 'Send Password Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-red-600">
                Cancel and return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

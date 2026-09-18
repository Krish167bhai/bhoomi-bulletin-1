import React from 'react';
import { ShieldCheck, Newspaper, Building2, Users, Award, TrendingUp } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          About Bhoomi Bulletin
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-['Outfit']">
          Empowering Indian Real Estate with Integrity &amp; Speed
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Bhoomi Bulletin is India's dedicated real-estate news, verified property listing, and advertising ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-['Outfit']">Daily Market Journalism</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In-depth reporting on RERA enforcement, infra expressway corridors, REIT performance, and city-wise price index trends.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-['Outfit']">Strict Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every advertiser, broker, and listing undergoes documentary review before displaying the official 🔵 Verified badge.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-['Outfit']">Direct Lead Delivery</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct connections between genuine buyers and owners via call, WhatsApp, and structured lead pipelines.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold font-['Outfit']">Our Vision</h2>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          To eradicate fraudulent property advertisements and opaque real estate transactions across tier-1, tier-2, and growing industrial hubs in India. By combining timely journalistic reporting with verified property marketplaces, we provide homebuyers and commercial investors with the transparency they deserve.
        </p>
      </div>
    </div>
  );
};

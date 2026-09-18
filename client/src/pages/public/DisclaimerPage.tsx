import React from 'react';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">Legal Disclaimer</h1>
        <p className="text-xs text-slate-500 mt-1">Real Estate Regulatory Information</p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
        <p>
          <strong>Bhoomi Bulletin</strong> operates as a digital real estate news publication, advertising medium, and lead facilitation platform.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">1. Independent Legal Due Diligence</h3>
        <p>
          While Bhoomi Bulletin exercises reasonable editorial diligence and manual review of property advertisements and broker credentials, we do not guarantee the title validity, municipal sanction completeness, or encumbrance status of any listed property. Potential purchasers are strictly advised to engage independent advocates to verify RERA certificates, title chains, and municipal occupancy certificates prior to executing any financial transaction.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">2. Market Intelligence &amp; News Content</h3>
        <p>
          Articles and market research published on this portal represent journalistic reporting and expert opinions. They do not constitute financial, investment, or legal advice.
        </p>
      </div>
    </div>
  );
};

import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">Terms &amp; Conditions</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
        <p>
          Welcome to <strong>Bhoomi Bulletin</strong>. By accessing our website, reading news articles, or submitting property advertisements, you agree to comply with and be bound by the following Terms and Conditions.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">1. Editorial Approval &amp; Non-Instant Publishing</h3>
        <p>
          In accordance with our anti-fraud policy (Requirement 17), users and brokers never publish advertisements directly to the public website. Every submission enters an administrative review queue where our verification team assesses property details and documentation before granting publication.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">2. Accuracy of Advertisements</h3>
        <p>
          Advertisers warrant that all uploaded photographs, videos, pricing information, and location coordinates are genuine and accurately represent the physical property. Fraudulent listings, copyright infringement, or misleading price claims will result in immediate termination and blacklisting.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">3. Advertisement Duration &amp; Expiry</h3>
        <p>
          Advertisements remain active for the duration selected upon submission (from 1 week to 2 years). Upon reaching the scheduled expiry timestamp, advertisements automatically transition to inactive history and will not appear in public search results unless renewed.
        </p>
      </div>
    </div>
  );
};

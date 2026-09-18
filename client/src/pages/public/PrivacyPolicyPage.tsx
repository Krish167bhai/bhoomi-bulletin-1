import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit']">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: September 2026</p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
        <p>
          At <strong>Bhoomi Bulletin</strong>, we are committed to protecting the privacy, confidentiality, and security of our visitors, property advertisers, and registered brokers.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">1. Information We Collect</h3>
        <p>
          We collect personal identification details (such as full name, verified email address, and mobile phone number) strictly when you voluntarily submit property advertisements, register an account, send direct inquiries, or subscribe to saved search alerts.
        </p>

        <h3 className="text-base font-bold text-slate-900 mt-4">2. Purpose of Processing</h3>
        <p>
          Collected information is utilized to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Authenticate user access and administer personal dashboard features.</li>
          <li>Facilitate direct communication between property advertisers and interested buyers.</li>
          <li>Transmit instant notifications regarding advertisement approval, lead generation, and expiry.</li>
          <li>Analyze aggregated platform traffic trends to continually improve our search performance.</li>
        </ul>

        <h3 className="text-base font-bold text-slate-900 mt-4">3. Data Security &amp; Retention</h3>
        <p>
          All passwords are encrypted utilizing industry-standard cryptographic hashing (bcrypt). We enforce role-based access control and never sell, barter, or expose your private contact details to unverified third-party telemarketers.
        </p>
      </div>
    </div>
  );
};

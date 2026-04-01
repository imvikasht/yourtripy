
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20 max-w-3xl text-left">
        <h1 className="text-4xl font-black mb-8 text-brand-heading">Privacy Policy</h1>
        <p className="text-brand-slate text-sm mb-12">Last Updated: October 2024</p>
        
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-brand-heading">1. Data We Collect</h2>
            <p className="text-brand-slate">We collect information you provide directly to us when you create a trip, such as destination preferences and interaction logs with our AI co-pilot.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4 text-brand-heading">2. How We Use AI</h2>
            <p className="text-brand-slate">Your travel preferences are used to improve the Gemini co-pilot suggestions for your specific account. We do not sell your personal data to third-party travel agencies.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4 text-brand-heading">3. Your Rights</h2>
            <p className="text-brand-slate">You have the right to request a copy of your data or ask for the deletion of your account and all associated itineraries at any time.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

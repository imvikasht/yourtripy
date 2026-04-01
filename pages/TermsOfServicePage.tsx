
import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20 max-w-3xl text-left">
        <h1 className="text-4xl font-black mb-8 text-brand-heading">Terms of Service</h1>
        <p className="text-brand-slate text-sm mb-12">Effective Date: October 2024</p>
        
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-brand-heading">1. Acceptable Use</h2>
            <p className="text-brand-slate">You agree to use YourTripy solely for personal travel planning. Automated scraping of our AI-generated content is strictly prohibited.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4 text-brand-heading">2. Limitation of Liability</h2>
            <p className="text-brand-slate">While our AI co-pilot attempts to provide accurate business hours and routes, we are not responsible for closed businesses, missed flights, or travel delays.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

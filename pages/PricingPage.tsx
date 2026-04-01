
import React from 'react';
import Pricing from '../components/Pricing';

const PricingPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="py-20">
        <div className="container mx-auto px-4 text-center mb-12">
          <h1 className="text-5xl font-black mb-6 text-brand-heading">Plans for Every Journey</h1>
          <p className="text-xl text-brand-slate">Choose the co-pilot that fits your travel style.</p>
        </div>
        <Pricing />
        <div className="container mx-auto px-4 mt-20 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-brand-heading">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            {[
              { q: "Can I cancel my Pro subscription?", a: "Yes, you can cancel anytime. You will retain Pro access until the end of your billing cycle." },
              { q: "What is 'Partial Regeneration'?", a: "It's our unique feature that lets you tell the AI to re-plan just a specific morning, afternoon, or evening without changing the rest of your trip." },
              { q: "How many friends can I invite?", a: "The Free plan allows sharing a view-only link. Pro allows up to 5 collaborators with full edit access." }
            ].map((item, i) => (
              <div key={i} className="bg-brand-dark p-6 rounded-2xl border border-brand-primary/10">
                <h4 className="font-bold text-brand-heading mb-2">{item.q}</h4>
                <p className="text-brand-slate text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

import React from 'react';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Explorer",
      price: "$0",
      description: "For the occasional wanderer.",
      features: ["1 Active trip", "Basic AI generation", "Standard routes", "PDF Export"],
      cta: "Get Started",
      isPopular: false
    },
    {
      name: "Pro Pilot",
      price: "$12",
      description: "For those who never stop.",
      features: ["Unlimited trips", "Partial regeneration", "Real-time transit sync", "5 Collaborators", "Offline Maps"],
      cta: "Upgrade to Pro",
      isPopular: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-brand-deep border-y border-brand-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h3 className="text-3xl md:text-5xl font-black text-brand-heading tracking-tight mb-4">Simple, honest pricing.</h3>
          <p className="text-brand-slate font-medium">Free for individuals, pro for power travelers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`p-10 rounded-[2.5rem] bg-brand-dark border transition-all ${
                plan.isPopular 
                  ? 'border-brand-primary shadow-xl shadow-brand-primary/5 scale-105 z-10' 
                  : 'border-brand-primary/10'
              }`}
            >
              <div className="mb-10">
                <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${plan.isPopular ? 'text-brand-primary' : 'text-brand-slate'}`}>
                  {plan.name}
                </h4>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-brand-heading">{plan.price}</span>
                  <span className="text-brand-slate font-bold">/mo</span>
                </div>
                <p className="text-brand-slate text-sm font-medium">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <Check className={`w-4 h-4 ${plan.isPopular ? 'text-brand-primary' : 'text-brand-slate/20'}`} />
                    <span className="text-brand-heading text-sm font-bold">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                plan.isPopular 
                  ? 'bg-brand-primary text-white hover:bg-[#FF9A3C]' 
                  : 'bg-brand-deep text-brand-heading border border-brand-primary/10 hover:bg-brand-primary/5'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
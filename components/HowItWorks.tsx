import React from 'react';
import { MousePointer2, Sparkles, Layout } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <MousePointer2 className="w-6 h-6" />,
      title: "Tell AI your Vibe",
      description: "Don't just say 'Paris'. Tell us you love hidden jazz bars, hate early mornings, and want to walk exactly 10k steps a day."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "The Co-pilot Drafts",
      description: "Our AI builds a logical route, checks opening times, and suggests spots based on real-time data and your specific tastes."
    },
    {
      icon: <Layout className="w-6 h-6" />,
      title: "Refine & Perfect",
      description: "This is where you take over. Swap hotels, regenerate specific time blocks, or drag-and-drop until it's perfect."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-brand-deep border-y border-brand-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-brand-primary tracking-[0.3em] uppercase mb-3">Simple Logic</h2>
          <h3 className="text-4xl md:text-6xl font-black text-brand-heading tracking-tighter">The Journey Engine</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group p-10 bg-brand-dark rounded-[3rem] border border-brand-primary/10 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all duration-500">
              <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                {step.icon}
              </div>
              <div className="absolute top-8 right-10 text-7xl font-black text-brand-heading/5 select-none group-hover:text-brand-primary/10 transition-colors">
                0{idx + 1}
              </div>
              <h4 className="text-2xl font-black text-brand-heading mb-4 tracking-tight">{step.title}</h4>
              <p className="text-brand-slate font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
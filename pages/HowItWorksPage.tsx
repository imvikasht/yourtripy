import React from 'react';
import { MousePointer2, Sparkles, Layout, ArrowRight } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: <MousePointer2 />,
      title: "Set Your Intentions",
      desc: "Tell YourTripy about your trip. Not just destination and dates, but your 'vibe'—adventure, relaxation, food-focus, or budget-conscious.",
      detail: "Our natural language processing understands complex requests like 'I want to see the sunset but avoid crowds'."
    },
    {
      icon: <Sparkles />,
      title: "AI Co-pilot Drafting",
      desc: "Gemini AI analyzes thousands of data points, routes, and opening hours to craft a logical first draft that maximizes your time.",
      detail: "Unlike basic planners, we verify that transit times are realistic and that the flow of your day makes sense."
    },
    {
      icon: <Layout />,
      title: "Refine on the Canvas",
      desc: "This is where you stay in control. Drag activities to different slots, swap restaurants, or use 'Partial Regen' for specific time blocks.",
      detail: "The AI updates the entire trip logic instantly as you make changes."
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <section className="py-20 bg-brand-deep">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-brand-heading mb-6">Master Your Journey</h1>
          <p className="text-xl text-brand-slate max-w-2xl mx-auto mb-12">
            Most AI planners give you a static list. YourTripy gives you an interactive engine to build the trip of your dreams.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="bg-brand-dark p-8 rounded-3xl border border-brand-primary/10 hover:border-brand-primary transition-all group shadow-sm">
                <div className="w-12 h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,122,24,0.3)]">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-brand-heading">{step.title}</h3>
                <p className="text-brand-slate mb-6 leading-relaxed">{step.desc}</p>
                <div className="pt-6 border-t border-brand-primary/10 text-sm text-brand-slate italic font-medium">
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-brand-primary rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12 shadow-sm">
            <div className="flex-1 text-left">
              <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to see it in action?</h2>
              <p className="text-white/80 text-lg mb-8 font-medium">Start your first draft today. It takes less than 30 seconds to get a professional itinerary.</p>
              <a href="#home" className="inline-flex items-center gap-2 bg-brand-deep text-brand-heading px-8 py-4 rounded-2xl font-bold shadow-sm hover:bg-[#FF9A3C] hover:text-white transition-all">
                Plan My First Trip <ArrowRight />
              </a>
            </div>
            <div className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/40">
              <div className="space-y-4">
                <div className="h-4 bg-brand-deep/10 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-brand-deep/10 rounded w-1/2 animate-pulse" />
                <div className="h-12 bg-brand-deep/20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
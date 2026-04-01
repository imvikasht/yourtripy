import React from 'react';
import { Sparkles, Map, Zap, Share2, Clock, Navigation } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Contextual AI",
      description: "Suggestions based on mood, diet, and energy."
    },
    {
      icon: <Navigation className="w-5 h-5" />,
      title: "Smart Routing",
      description: "Optimized transit with neighborhood clustering."
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Quick Swap",
      description: "Regenerate time blocks without affecting shifts."
    },
    {
      icon: <Map className="w-5 h-5" />,
      title: "Interactive Canvas",
      description: "Drag-and-drop with automated time logic."
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Team Sync",
      description: "Invite friends to vote and edit in real-time."
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Offline Ready",
      description: "Export to PDF, Wallet, or Google Docs."
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-brand-deep">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="p-10 rounded-[3rem] border border-brand-primary/10 bg-brand-dark hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group flex items-start gap-8 shadow-sm hover:shadow-xl">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <div className="text-left">
                <h4 className="text-2xl font-black text-brand-heading mb-3 tracking-tight">{feature.title}</h4>
                <p className="text-brand-slate text-sm leading-relaxed font-medium">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
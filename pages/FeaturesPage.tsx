import React from 'react';
import { Sparkles, Zap, Map as MapIcon, Share2, Clock, ShieldCheck, Search, Navigation } from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const features = [
    { title: "Contextual AI", desc: "Our co-pilot understands your specific mood, dietary needs, and energy levels.", icon: <Sparkles /> },
    { title: "Smart Routing", desc: "Optimization of transit times using real-time traffic and public transport data.", icon: <Navigation /> },
    { title: "Partial Regeneration", desc: "Don't like Tuesday afternoon? One click regenerates that block only.", icon: <Zap /> },
    { title: "Interactive Maps", desc: "Live mapping with walking routes and navigation links built-in.", icon: <MapIcon /> },
    { title: "Collaboration", desc: "Invite friends to edit, comment, or vote on activities for group trips.", icon: <Share2 /> },
    { title: "Offline Access", desc: "Export to Apple Wallet, PDF, or Google Docs for no-signal exploration.", icon: <Clock /> },
    { title: "Safety Scores", desc: "Integration of safety data and neighborhood ratings for peace of mind.", icon: <ShieldCheck /> },
    { title: "Advanced Search", desc: "Search through your saved spots and the AI co-pilot's suggestions instantly.", icon: <Search /> }
  ];

  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black mb-6 text-brand-heading">Built for Modern Travel</h1>
          <p className="text-xl text-brand-slate max-w-3xl mx-auto font-medium">Every feature is designed to solve a specific friction point in the planning process.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 border border-brand-primary/10 rounded-3xl bg-brand-dark hover:bg-brand-primary/5 hover:border-brand-primary/30 hover:shadow-md transition-all group text-left">
              <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-brand-heading">{f.title}</h3>
              <p className="text-brand-slate text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
import React from 'react';
import { Sparkles, Users, Globe, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl font-black text-brand-heading mb-8">Travel is personal. <br/><span className="text-brand-primary italic">So is our AI.</span></h1>
          <p className="text-xl text-brand-slate leading-relaxed font-medium">
            YourTripy was founded in 2024 by a team of travel enthusiasts and engineers who were tired of "one-size-fits-all" itineraries. We believe that AI shouldn't tell you what to do—it should help you do what you love, more efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8 text-left">
            <h2 className="text-3xl font-black text-brand-heading">Our Philosophy</h2>
            <div className="flex gap-6 group">
              <div className="shrink-0 w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-[0_0_15px_rgba(255,122,24,0.1)]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-brand-heading">User-Centric Co-piloting</h3>
                <p className="text-brand-slate leading-relaxed font-medium">We prioritize human intent. Our models are trained to suggest, not dictate.</p>
              </div>
            </div>
            <div className="flex gap-6 group">
              <div className="shrink-0 w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-[0_0_15px_rgba(255,122,24,0.1)]">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-brand-heading">Verified Reliability</h3>
                <p className="text-brand-slate leading-relaxed font-medium">We cross-reference AI suggestions with real-world data like current business hours and transit schedules.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-sm border border-brand-primary/10 relative group">
            <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" alt="Our Team" className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
          </div>
        </div>

        <div className="bg-brand-dark rounded-3xl p-12 text-center border border-brand-primary/10">
          <Globe className="w-12 h-12 text-brand-primary mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4 text-brand-heading">A Global Perspective</h2>
          <p className="text-brand-slate max-w-2xl mx-auto font-medium leading-relaxed">
            From the bustling streets of Tokyo to the quiet fjords of Norway, our AI understands local nuances that typical search engines miss.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
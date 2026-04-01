import React from 'react';
import Hero from './components/Hero';
import BookingGrid from './components/BookingGrid';
import { ViewType } from './App';
import { Sparkles, Navigation, Zap } from 'lucide-react';

interface LandingPageProps {
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
  user: any;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigateTo, user }) => {
  return (
    <div className="relative overflow-x-hidden bg-brand-deep">
      <main>
        <Hero navigateTo={navigateTo} user={user} />
        
        <section className="py-16 bg-brand-deep border-b border-brand-dark">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center max-w-5xl mx-auto">
              {[
                { icon: <Sparkles className="w-6 h-6" />, title: "AI Drafting", desc: "Itineraries built in seconds with Gemini." },
                { icon: <Zap className="w-6 h-6" />, title: "Smart Swap", desc: "Change plans without breaking your route." },
                { icon: <Navigation className="w-6 h-6" />, title: "Travel Logic", desc: "Automatic verification of hours and transit." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center shadow-sm border border-brand-primary/20">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-black text-brand-heading leading-none">{item.title}</h3>
                  <p className="text-brand-slate text-sm font-medium leading-relaxed max-w-[240px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BookingGrid navigateTo={navigateTo} />
        
        <section className="py-32 bg-brand-deep border-y border-brand-dark">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 max-w-7xl mx-auto gap-8">
              <div className="text-left">
                <h2 className="text-5xl md:text-7xl font-black mb-6 text-brand-heading tracking-tighter">Travel Journal</h2>
                <p className="text-xl text-brand-slate font-medium">Stories, tips, and insights from the co-pilot community.</p>
              </div>
              <button 
                onClick={() => navigateTo('blog')}
                className="px-8 py-4 bg-brand-dark text-brand-heading font-black rounded-full border border-brand-primary/10 hover:bg-brand-primary/5 transition-all outline-none whitespace-nowrap"
              >
                View All Stories
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
              {[
                {
                  title: 'The Future of AI in Travel Planning',
                  category: 'Technology',
                  image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
                  date: 'Mar 21, 2026'
                },
                {
                  title: '10 Hidden Gems in Kyoto You Must Visit',
                  category: 'Destination',
                  image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
                  date: 'Mar 18, 2026'
                },
                {
                  title: 'Sustainable Travel: A Guide for 2026',
                  category: 'Lifestyle',
                  image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                  date: 'Mar 15, 2026'
                }
              ].map((post, i) => (
                <div 
                  key={i} 
                  onClick={() => navigateTo('blog')}
                  className="bg-brand-dark rounded-[3rem] overflow-hidden border border-brand-primary/10 hover:border-brand-primary/20 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-10 text-left">
                    <h3 className="text-2xl font-black text-brand-heading mb-6 group-hover:text-brand-primary transition-colors leading-tight tracking-tight line-clamp-2">{post.title}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-brand-slate text-[10px] font-black uppercase tracking-[0.2em]">{post.date}</p>
                      <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Read →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 relative overflow-hidden bg-brand-deep">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/5 via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-brand-heading mb-8 tracking-tight leading-tight text-balanced">
              Don't just travel. <br/><span className="text-brand-primary">Navigate with logic.</span>
            </h2>
            <p className="text-brand-slate text-xl md:text-2xl max-w-xl mx-auto mb-12 font-medium">
              Take back control of your journey with the co-pilot that works for your schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => navigateTo('planner')}
                className="px-12 py-6 bg-brand-primary text-white font-black rounded-full shadow-xl hover:bg-[#FF9A3C] hover:scale-105 transition-all w-full sm:w-auto outline-none"
              >
                Start Free Plan
              </button>
              <button 
                onClick={() => navigateTo('how-it-works')}
                className="px-12 py-6 bg-brand-dark text-brand-heading font-black rounded-full border border-brand-primary/10 hover:bg-brand-primary/5 transition-all w-full sm:w-auto outline-none"
              >
                How It Works
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
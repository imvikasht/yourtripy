import React from 'react';
import { Play, MessageSquare, MapPin, MoreHorizontal, Heart, Sparkles } from 'lucide-react';
import { ViewType } from '../App';

interface HeroProps {
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
  user: any;
}

const MonumentCard = ({
  src,
  title,
  location,
  userImg,
  userName,
  delay,
  className,
  type = "arch",
  size = "md"
}: {
  src: string;
  title: string;
  location: string;
  userImg: string;
  userName: string;
  delay: string;
  className: string;
  type?: "arch" | "rect" | "circle";
  size?: "sm" | "md" | "lg";
}) => {
  const shapeClass = {
    arch: "rounded-t-full",
    rect: "rounded-[3.5rem]",
    circle: "rounded-full aspect-square"
  }[type];

  const scaleClass = {
    sm: "scale-75",
    md: "scale-100",
    lg: "scale-110"
  }[size];

  return (
    <div className={`absolute z-20 animate-float transition-all duration-700 hover:scale-[1.03] group ${className} ${scaleClass}`} style={{ animationDelay: delay }}>
      <div className={`relative overflow-hidden border-[8px] border-brand-dark shadow-xl ${shapeClass} bg-brand-dark transition-all`}>
        <img src={src} alt={title} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100 grayscale-[0.2] group-hover:grayscale-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 via-transparent to-transparent opacity-50"></div>

        <div className="absolute top-5 right-5 w-11 h-11 bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 shadow-sm group-hover:bg-brand-primary transition-colors">
          <Heart className="w-5 h-5 text-white fill-current group-hover:scale-110 group-hover:text-white transition-all animate-pulse" />
        </div>
      </div>

      <div className="absolute -bottom-6 -right-12 z-30 group-hover:-translate-y-2 transition-transform duration-500">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl flex items-center gap-4 w-64 border border-brand-primary/10">
          <img src={userImg} className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-primary" alt={userName} />
          <div className="flex-1 text-left">
            <p className="text-[12px] font-black text-brand-heading leading-none mb-1.5">{userName}</p>
            <div className="flex items-center gap-1.5 text-[9px] text-brand-primary font-black uppercase tracking-[0.1em]">
              <MapPin className="w-3 h-3" /> {location}
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-brand-slate/30" />
        </div>
      </div>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ navigateTo, user }) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-brand-deep pt-16">
      {/* Light Background Environment */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-primary/5 via-brand-deep to-brand-deep"></div>
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-brand-primary/5 perspective-floor border-t border-brand-primary/5"></div>

        {/* Cinematic Orbs */}
        <div className="absolute top-1/4 left-1/3 w-[800px] h-[800px] bg-brand-primary/5 blur-[180px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-accent/5 blur-[140px] rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-10 min-h-[85vh] py-12 lg:py-0">

          {/* Main Content */}
          <div className="flex-1 text-center lg:text-left max-w-3xl lg:max-w-2xl mx-auto lg:mx-0 lg:pr-12">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-brand-dark border border-brand-primary/10 text-brand-primary font-black text-[10px] sm:text-[11px] tracking-[0.25em] uppercase mb-8 lg:mb-12 shadow-sm">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>AI Powered</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-brand-heading mb-8 lg:mb-10 leading-[0.85] lg:leading-[0.78] text-balanced">
              Travel<br />
              <span className="text-brand-primary italic relative">
                differently.
                <div className="absolute -bottom-2 lg:-bottom-4 left-0 w-full h-4 lg:h-8 bg-brand-primary/5 -rotate-1 -z-10 blur-xl"></div>
              </span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-brand-slate mb-10 lg:mb-16 max-w-xl mx-auto lg:mx-0 leading-tight font-medium px-4 sm:px-0">
              Precision trip planning with a high-performance AI co-pilot that knows your <span className="text-brand-heading font-black">true vibe</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-10 px-4 sm:px-0">
              <button
                onClick={() => navigateTo('planner')}
                className="px-8 py-4 sm:px-14 sm:py-7 bg-brand-primary text-white font-black rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center gap-4 hover:scale-105 hover:bg-[#FF9A3C] transition-all shadow-xl active:scale-95 text-lg sm:text-xl tracking-tight w-full sm:w-auto"
              >
                Plan my trip <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              {user && (
                <button
                  onClick={() => navigateTo('trips')}
                  className="px-8 py-4 sm:px-14 sm:py-7 bg-brand-dark text-brand-heading font-black rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center gap-4 border border-brand-primary/10 hover:bg-brand-primary/5 transition-all shadow-sm active:scale-95 text-lg sm:text-xl tracking-tight w-full sm:w-auto"
                >
                  My Trips
                </button>
              )}
            </div>
          </div>

          {/* Visual Monument Stacks */}
          <div className="flex-1 relative w-full h-[500px] md:h-[750px] lg:h-[850px] hidden lg:block select-none perspective-[3000px]">
            <MonumentCard
              type="arch"
              size="lg"
              src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800"
              title="Taj Mahal"
              location="Agra, India"
              userName="Zara Ahmed"
              userImg="https://i.pravatar.cc/100?u=zara"
              delay="0s"
              className="top-0 right-16 w-[360px] h-[520px]"
            />
            <MonumentCard
              type="rect"
              size="md"
              src="https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=600"
              title="Hawa Mahal"
              location="Jaipur, India"
              userName="Rohan Gupta"
              userImg="https://i.pravatar.cc/100?u=rohan"
              delay="2s"
              className="bottom-24 left-4 w-[280px] h-[380px] -rotate-3"
            />
            <MonumentCard
              type="circle"
              size="sm"
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=600"
              title="Qutub Minar"
              location="Delhi, India"
              userName="Siddharth K."
              userImg="https://i.pravatar.cc/100?u=sid"
              delay="3.5s"
              className="top-[45%] right-[40%] w-[210px] h-[210px] z-10"
            />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-brand-primary/5 rounded-full -z-10 animate-spin-slow"></div>

            <div className="absolute top-10 left-1/4 z-20 animate-bounce-slow">
              <div className="px-7 py-4 bg-white/90 backdrop-blur-3xl rounded-full border border-brand-primary/10 flex items-center gap-5 shadow-xl">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=trav${i}`} className="w-10 h-10 rounded-full border-2 border-brand-dark shadow-sm" alt="User" />
                  ))}
                </div>
                <span className="text-[12px] text-brand-heading font-black uppercase tracking-[0.2em] whitespace-nowrap">24.5k Exploring Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-40px) rotate(calc(var(--rot, 0deg) + 2deg)); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 60s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .-rotate-3 { --rot: -3deg; }
      `}} />
    </section>
  );
};

export default Hero;
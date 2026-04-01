import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, User as UserIcon, LogOut, Settings, Map, ShieldCheck } from 'lucide-react';
import { ViewType, User } from '../App';

interface NavbarProps {
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
  currentView: ViewType;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigateTo, currentView, user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks: { name: string; view: ViewType }[] = [
    { name: 'How it Works', view: 'how-it-works' },
    { name: 'Features', view: 'features' },
    { name: 'Blog', view: 'blog' },
  ];

  const handleAction = (view: ViewType) => {
    navigateTo(view);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass-morphism py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => handleAction('home')} 
            className="flex items-center gap-3 cursor-pointer group outline-none"
          >
            <span className="text-2xl font-black tracking-tight text-brand-heading">
              YourTripy
            </span>
          </button>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button 
                key={link.name}
                onClick={() => handleAction(link.view)}
                className={`text-[13px] font-black uppercase tracking-[0.15em] transition-all outline-none ${
                  currentView === link.view 
                    ? 'text-brand-primary border-b-2 border-brand-primary pb-0.5' 
                    : 'text-brand-slate hover:text-brand-primary'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 p-1.5 pl-4 pr-1 bg-brand-dark hover:bg-brand-primary/5 rounded-full transition-all border border-brand-primary/10"
                >
                  <span className="text-sm font-black text-brand-heading">{user.name.split(' ')[0]}</span>
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm" alt="Profile" />
                  ) : (
                    <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-black text-xs">
                      {user.name[0]}
                    </div>
                  )}
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass-morphism rounded-3xl shadow-2xl py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-brand-primary/10">
                    <button onClick={() => handleAction('profile')} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-brand-heading hover:bg-brand-primary hover:text-white transition-colors">
                      <UserIcon className="w-4 h-4" /> My Profile
                    </button>
                    <button onClick={() => handleAction('trips')} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-brand-heading hover:bg-brand-primary hover:text-white transition-colors">
                      <Map className="w-4 h-4" /> My Trips
                    </button>
                    <button onClick={() => handleAction('planner')} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-brand-heading hover:bg-brand-primary hover:text-white transition-colors">
                      <Sparkles className="w-4 h-4" /> Trip Hub
                    </button>
                    {user.email === 'iritvik3@gmail.com' && (
                      <button onClick={() => handleAction('admin')} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-brand-heading hover:bg-brand-primary hover:text-white transition-colors">
                        <ShieldCheck className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-colors border-t border-brand-dark">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleAction('login')} 
                  className="px-5 py-2.5 text-sm font-black uppercase tracking-widest text-brand-slate hover:text-brand-primary transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleAction('signup')}
                  className="px-8 py-4 bg-brand-primary text-white text-[13px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 hover:bg-[#FF9A3C] transition-all active:scale-95"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-brand-heading">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-morphism p-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <button key={link.name} onClick={() => handleAction(link.view)} className="text-xl font-black text-left text-brand-heading">{link.name}</button>
          ))}
          {user ? (
            <>
              <button onClick={() => handleAction('profile')} className="text-xl font-black text-left text-brand-heading flex items-center gap-3">
                <UserIcon className="w-6 h-6" /> My Profile
              </button>
              <button onClick={() => handleAction('planner')} className="text-xl font-black text-left text-brand-heading flex items-center gap-3">
                <Map className="w-6 h-6" /> Trip Hub
              </button>
            </>
          ) : null}
          {user?.email === 'iritvik3@gmail.com' && (
            <button onClick={() => handleAction('admin')} className="text-xl font-black text-left text-brand-primary flex items-center gap-3">
              <ShieldCheck className="w-6 h-6" /> Admin Panel
            </button>
          )}
          <div className="h-px bg-brand-dark my-2" />
          <button onClick={() => handleAction('login')} className="w-full py-4 text-center font-black text-brand-heading rounded-2xl border border-brand-primary/20">Log In</button>
          <button onClick={() => handleAction('signup')} className="w-full py-4 text-center font-black text-white bg-brand-primary rounded-2xl">Start Free</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
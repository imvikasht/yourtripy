import React from 'react';
import { Sparkles, Twitter, Github, Linkedin } from 'lucide-react';
import { ViewType } from '../App';

interface FooterProps {
  navigateTo: (view: ViewType) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  return (
    <footer className="bg-brand-deep pt-20 pb-10 border-t border-brand-dark transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-xs space-y-6 text-left">
            <button onClick={() => navigateTo('home')} className="flex items-center gap-2 outline-none group">
              <div className="bg-brand-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-brand-heading">YourTripy</span>
            </button>
            <p className="text-brand-slate text-sm font-medium leading-relaxed">
              Premium AI travel planning for the modern explorer. Experience intelligence on every journey. Standard edition is free forever.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-brand-primary/10 flex items-center justify-center text-brand-slate hover:bg-brand-primary hover:text-white transition-all outline-none">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-10 text-left text-brand-heading">
            <div className="space-y-4">
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-slate/40">Product</h5>
              <ul className="space-y-3 text-sm font-bold">
                <li><button onClick={() => navigateTo('features')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Features</button></li>
                <li><button onClick={() => navigateTo('how-it-works')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Guide</button></li>
                <li><button onClick={() => navigateTo('planner')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Workspace</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-slate/40">Resources</h5>
              <ul className="space-y-3 text-sm font-bold">
                <li><button onClick={() => navigateTo('blog')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Journal</button></li>
                <li><button onClick={() => navigateTo('support')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Support</button></li>
                <li><button onClick={() => navigateTo('community')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Community</button></li>
              </ul>
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-slate/40">Legal</h5>
              <ul className="space-y-3 text-sm font-bold">
                <li><button onClick={() => navigateTo('privacy')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Privacy</button></li>
                <li><button onClick={() => navigateTo('terms')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Terms</button></li>
                <li><button onClick={() => navigateTo('contact')} className="text-brand-slate hover:text-brand-primary outline-none transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-dark flex justify-between items-center">
          <p className="text-brand-slate/20 text-[10px] font-bold uppercase tracking-widest">© 2026 YOURTRIPY AI INC.</p>
          <p className="text-brand-slate/20 text-[10px] font-bold uppercase tracking-widest">BUILT FOR THE ROAD</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
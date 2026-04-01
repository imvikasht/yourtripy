import React from 'react';
import { Search, Book, HelpCircle, LifeBuoy } from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-black mb-8 text-brand-heading">How can we help?</h1>
        <div className="max-w-2xl mx-auto relative mb-20">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-slate" />
          <input 
            type="text" 
            className="w-full py-6 pl-16 pr-6 rounded-2xl bg-brand-dark border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium placeholder:text-brand-slate/40 shadow-sm" 
            placeholder="Search for answers..." 
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {[
            { icon: <Book />, title: "Getting Started", desc: "Learn the basics of creating and editing your first AI itinerary." },
            { icon: <HelpCircle />, title: "Billing & Pro", desc: "Manage your subscription, invoices, and professional features." },
            { icon: <LifeBuoy />, title: "Troubleshooting", desc: "Technical issues? Find solutions for app syncing and offline maps." }
          ].map((item, i) => (
            <div key={i} className="bg-brand-dark p-8 rounded-3xl border border-brand-primary/10 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all group shadow-sm">
              <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all">
                {item.icon}
              </div>
              <h3 className="font-black text-xl mb-4 tracking-tight text-brand-heading">{item.title}</h3>
              <p className="text-brand-slate text-sm mb-6 leading-relaxed font-medium">{item.desc}</p>
              <button className="text-brand-primary text-sm font-black hover:underline uppercase tracking-widest">Read articles &rarr;</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
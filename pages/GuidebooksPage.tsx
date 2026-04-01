import React from 'react';
import { Download } from 'lucide-react';

const GuidebooksPage: React.FC = () => {
  const guides = [
    { title: "The Ultimate Tokyo Manual", pages: 42, img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400" },
    { title: "Rome on a Budget", pages: 30, img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400" },
    { title: "Iceland Road Trip Guru", pages: 55, img: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=400" }
  ];

  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-black text-center mb-6 tracking-tighter text-brand-heading">Manual Guides</h1>
        <p className="text-xl text-brand-slate text-center mb-20 font-medium">Curated analog logic to supplement your digital co-pilot.</p>
        <div className="grid md:grid-cols-3 gap-16 max-w-7xl mx-auto">
          {guides.map((g, i) => (
            <div key={i} className="text-left group cursor-pointer">
              <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-8 shadow-sm border border-brand-primary/10 group-hover:border-brand-primary/30 transition-all">
                <img src={g.img} alt={g.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
              </div>
              <h3 className="text-2xl font-black text-brand-heading mb-3 tracking-tight">{g.title}</h3>
              <p className="text-brand-slate text-sm mb-6 font-medium">{g.pages} pages of tactical intelligence</p>
              <button className="flex items-center gap-3 text-brand-primary font-black uppercase text-xs tracking-widest hover:gap-5 transition-all outline-none">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuidebooksPage;
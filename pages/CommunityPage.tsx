import React from 'react';
import { MessageCircle, Users, Trophy } from 'lucide-react';

const CommunityPage: React.FC = () => {
  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-black mb-8 leading-tight text-brand-heading">Tripy Community</h1>
        <p className="text-brand-slate text-xl max-w-2xl mx-auto mb-16 font-medium">Connect with fellow explorers, share your best itineraries, and win travel prizes.</p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: <MessageCircle />, title: "Itinerary Hub", count: "12k+", desc: "Browse trips shared by our community members." },
            { icon: <Users />, title: "Travel Groups", count: "450", desc: "Join groups based on your interests or destination." },
            { icon: <Trophy />, title: "Challenges", count: "Monthly", desc: "Share your best route to win Pro memberships." }
          ].map((item, i) => (
            <div key={i} className="bg-brand-dark backdrop-blur-md border border-brand-primary/10 p-8 rounded-3xl hover:border-brand-primary/30 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,122,24,0.2)]">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-brand-heading">{item.title}</h3>
              <div className="text-brand-primary font-black text-sm uppercase mb-4 tracking-widest">{item.count}</div>
              <p className="text-brand-slate text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-primary text-white p-12 rounded-[3rem] inline-block shadow-xl">
          <h2 className="text-3xl font-black mb-6">Ready to join the club?</h2>
          <button className="px-12 py-4 bg-brand-heading text-white font-bold rounded-2xl hover:bg-[#FF9A3C] transition-all">Create Free Account</button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
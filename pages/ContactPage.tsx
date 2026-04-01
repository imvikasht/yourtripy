import React from 'react';
import { Mail, MessageSquare, MapPin, ArrowLeft, Send, Globe, Twitter, Linkedin } from 'lucide-react';
import { ViewType } from '../App';

interface ContactPageProps {
  navigateTo: (view: ViewType) => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ navigateTo }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message received! Our team will reach out to you within 24 hours.");
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      value: "hello@yourtripy.com",
      desc: "For general inquiries and support."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      value: "Available 24/7",
      desc: "Instant help from our co-pilot experts."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global HQ",
      value: "San Francisco, CA",
      desc: "Our engineering and design hub."
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-brand-deep transition-colors duration-300">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <button 
          onClick={() => navigateTo('home')}
          className="group flex items-center gap-2 text-brand-slate font-bold text-sm mb-12 hover:text-brand-primary transition-colors outline-none uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return home
        </button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-black text-brand-heading mb-6 leading-tight">
              Let's build the <br/>
              <span className="text-brand-primary italic">future of travel</span>.
            </h1>
            <p className="text-lg md:text-xl text-brand-slate mb-12 max-w-lg leading-relaxed font-medium">
              Have questions about the co-pilot? Want to partner with us? We'd love to hear your story.
            </p>
            
            <div className="grid sm:grid-cols-1 gap-8">
              {contactMethods.map((method, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="shrink-0 w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all shadow-[0_0_15px_rgba(255,122,24,0.1)]">
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-heading mb-1 text-xl">{method.title}</h4>
                    <p className="text-brand-primary font-black mb-1">{method.value}</p>
                    <p className="text-brand-slate text-sm font-medium leading-relaxed">{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-brand-primary/10 flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate">Social Logic</span>
              <div className="flex gap-4">
                {[Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="p-3 bg-brand-dark border border-brand-primary/10 rounded-xl text-brand-slate hover:text-brand-primary transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-brand-dark p-8 md:p-12 rounded-[2.5rem] border border-brand-primary/10 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">First Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all placeholder:text-brand-slate/20 font-medium" 
                      placeholder="Alex" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all placeholder:text-brand-slate/20 font-medium" 
                      placeholder="Smith" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Work Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full p-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all placeholder:text-brand-slate/20 font-medium" 
                    placeholder="alex@company.com" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Your Message</label>
                  <textarea 
                    required 
                    rows={4} 
                    className="w-full p-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all placeholder:text-brand-slate/20 font-medium resize-none" 
                    placeholder="Tell us what's on your mind..." 
                  />
                </div>
                <button className="w-full py-5 bg-brand-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand-primary/10 hover:bg-[#FF9A3C] transform hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                  Send Command <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
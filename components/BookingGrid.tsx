import React from 'react';
import { ViewType } from '../App';
import { Hotel, Car, Plane, Utensils, Shapes, UserCircle2, Train, BusFront } from 'lucide-react';

interface BookingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isComingSoon?: boolean;
  onClick?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ icon, title, description, isComingSoon, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-brand-dark p-12 rounded-[4rem] border border-brand-primary/10 flex flex-col items-start text-left transition-all hover:bg-brand-primary/5 hover:border-brand-primary/30 hover:shadow-xl group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className="flex items-center justify-between w-full mb-10">
      <div className="text-brand-primary group-hover:scale-110 transition-transform bg-brand-deep p-5 rounded-[2rem] shadow-sm border border-brand-primary/10">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7' }) : icon}
      </div>
      {isComingSoon && (
        <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-[0.15em]">
          Soon
        </span>
      )}
    </div>
    <h3 className="text-2xl font-black text-brand-heading mb-5 tracking-tight group-hover:text-brand-primary transition-colors">{title}</h3>
    <p className="text-[15px] text-brand-slate font-medium leading-relaxed">
      {description}
    </p>
  </div>
);

const BookingGrid: React.FC<{ navigateTo: (view: ViewType) => void }> = ({ navigateTo }) => {
  const items = [
    {
      icon: <Hotel />,
      title: "Hotels",
      description: "Secure the best boutiques and retreats with pre-negotiated co-pilot rates.",
      isComingSoon: true
    },
    {
      icon: <Car />,
      title: "Car Rentals",
      description: "Seamlessly integrate ground transport into your logical route planning.",
      isComingSoon: true
    },
    {
      icon: <Plane />,
      title: "Flight Sync",
      description: "Connect your air travel for automatic arrival/departure buffer logic.",
      isComingSoon: true
    },
    {
      icon: <Train />,
      title: "Railways",
      description: "Experience the most scenic city-to-city connections globally.",
      isComingSoon: true,
      onClick: () => navigateTo('railways')
    },
    {
      icon: <BusFront />,
      title: "Coach travel",
      description: "Optimized budget options for short-range regional exploration.",
      isComingSoon: true
    },
    {
      icon: <Utensils />,
      title: "Dining",
      description: "Reserved tables at spots that match your palette and energy.",
      isComingSoon: false
    },
    {
      icon: <Shapes />,
      title: "Activities",
      description: "Book curated experiences directly from your interactive canvas.",
      isComingSoon: false
    },
    {
      icon: <UserCircle2 />,
      title: "Pro Tours",
      description: "Private guides vetted for deep local knowledge and storytelling.",
      isComingSoon: true
    }
  ];

  return (
    <section className="py-32 bg-brand-deep">
      <div className="container mx-auto px-4">
        <div className="text-center mb-28 max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black text-brand-heading tracking-tighter leading-[0.9] mb-8">
            Manage your entire <br/><span className="text-brand-primary italic drop-shadow-sm">travel stack.</span>
          </h2>
          <p className="text-xl text-brand-slate font-medium max-w-2xl mx-auto">From high-speed transit to intimate dining, everything is synced and logically verified.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <BookingCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookingGrid;
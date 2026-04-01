import React, { useState, useEffect } from 'react';
import { Map, Calendar, MapPin, ArrowRight, Plus, Search, Filter, Trash2, ExternalLink } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { ViewType, User } from '../App';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  style: string;
  image?: string;
  status: 'upcoming' | 'past';
  createdAt: any;
}

interface MyTripsPageProps {
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
  user: User | null;
}

const MyTripsPage: React.FC<MyTripsPageProps> = ({ navigateTo, user }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (!user) {
      navigateTo('login');
      return;
    }

    const fetchTrips = async () => {
      try {
        const tripsRef = collection(db, 'trips');
        const q = query(
          tripsRef, 
          where('userId', '==', auth.currentUser?.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedTrips: Trip[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedTrips.push({
            id: doc.id,
            destination: data.destination,
            startDate: data.startDate || 'TBD',
            endDate: data.endDate || 'TBD',
            days: data.days || 0,
            style: data.style || 'Moderate',
            image: data.image || `https://picsum.photos/seed/${encodeURIComponent(data.destination || 'trip')}/800/600`,
            status: data.status || 'upcoming',
            createdAt: data.createdAt
          });
        });
        setTrips(fetchedTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
        // If it's a permission error, it might be because the collection doesn't exist yet or rules are strict
        // We'll handle it gracefully for now
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [user, navigateTo]);

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trips/${tripId}`);
    }
  };

  const toggleTripStatus = async (e: React.MouseEvent, tripId: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'upcoming' ? 'past' : 'upcoming';
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, { status: newStatus });
      setTrips(trips.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error("Error updating trip status:", error);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || trip.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep">
        <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-brand-heading tracking-tight mb-2">My Trips</h1>
            <p className="text-brand-slate font-medium">Your collection of planned adventures and memories.</p>
          </div>
          <button 
            onClick={() => navigateTo('planner')}
            className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Plan New Trip
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-brand-dark p-6 rounded-[2rem] border border-brand-primary/10 mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search your trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-xl bg-brand-deep border border-brand-primary/5 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'bg-brand-deep text-brand-slate hover:bg-brand-primary/5 border border-brand-primary/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map((trip) => (
              <div 
                key={trip.id}
                onClick={() => navigateTo('planner', '', trip.id)}
                className="group bg-brand-dark rounded-[2.5rem] overflow-hidden border border-brand-primary/10 hover:border-brand-primary/30 transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={trip.image} 
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => toggleTripStatus(e, trip.id, trip.status)}
                      className="px-3 py-1 bg-brand-dark/80 backdrop-blur-md text-brand-heading text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-brand-primary hover:text-white transition-colors border border-brand-primary/20"
                    >
                      {trip.status === 'upcoming' ? 'Mark Past' : 'Mark Upcoming'}
                    </button>
                    <button 
                      onClick={(e) => handleDeleteTrip(e, trip.id)}
                      className="p-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-6 flex gap-2">
                    <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                      {trip.style}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full text-white ${trip.status === 'upcoming' ? 'bg-green-500' : 'bg-gray-500'}`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-brand-heading tracking-tight mb-1">{trip.destination}</h3>
                      <div className="flex items-center gap-2 text-brand-slate text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.startDate} - {trip.endDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-brand-primary/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-brand-heading uppercase tracking-widest">{trip.days} Days</span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-primary font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-brand-dark rounded-[3rem] p-20 text-center border border-brand-primary/10">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Map className="w-12 h-12 text-brand-primary" />
            </div>
            <h2 className="text-3xl font-black text-brand-heading mb-4">No trips found</h2>
            <p className="text-brand-slate max-w-md mx-auto mb-10 font-medium">
              You haven't planned any trips yet. Let our AI co-pilot help you build your next dream adventure.
            </p>
            <button 
              onClick={() => navigateTo('planner')}
              className="px-10 py-5 bg-brand-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              Plan Your First Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage;

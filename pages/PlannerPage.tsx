import React, { useState, useEffect } from 'react';
import { 
  GripVertical, Plus, Trash2, MapPin, Navigation, 
  Calendar, Loader2, 
  Sparkles, RefreshCcw, Send, ArrowLeft, Clock, Map as MapIcon, X, Info, Pencil,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { ViewType } from '../App';
import MapComponent from '../components/MapComponent';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

interface Activity {
  id: string;
  time: string;
  title: string;
  category: string;
  duration: string;
  location: string;
  description: string;
  recommendationReason?: string;
  tips: string[];
  bestTimeToVisit: string;
  imageUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  travelTimeFromPrevious: string;
  nearbyFood: { name: string; rating: number }[];
}

interface DayPlan {
  day: number;
  activities: Activity[];
}

interface TripPlan {
  tripSummary: {
    destination: string;
    totalDays: number;
    travelStyle: string;
    budgetAmount?: string;
    preferences: string[];
    imageUrl: string;
  };
  hotelSuggestion: {
    area: string;
    reason: string;
  };
  transportOptions: {
    type: string;
    duration: string;
    estimatedCost: string;
    recommendationScore: number;
  }[];
  days: DayPlan[];
  budgetBreakdown: {
    stay: string;
    food: string;
    transport: string;
    activities: string;
    totalEstimate: string;
  };
}

interface PlannerPageProps {
  initialQuery?: string;
  tripId?: string | null;
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
}

const PREFERENCE_CATEGORIES = [
  {
    name: 'Adventure & Outdoors',
    items: [
      { id: 'adventure', label: 'Adventure', icon: '🧗' },
      { id: 'nature', label: 'Nature', icon: '🌿' },
      { id: 'trekking', label: 'Trekking', icon: '🥾' },
      { id: 'wildlife', label: 'Wildlife', icon: '🐘' },
      { id: 'beaches', label: 'Beaches', icon: '🏖️' },
    ]
  },
  {
    name: 'Culture & History',
    items: [
      { id: 'history', label: 'History', icon: '📜' },
      { id: 'museum', label: 'Museums', icon: '🏛️' },
      { id: 'temples', label: 'Temples', icon: '🛕' },
      { id: 'art', label: 'Art Galleries', icon: '🎨' },
      { id: 'architecture', label: 'Architecture', icon: '🏗️' },
    ]
  },
  {
    name: 'Food & Lifestyle',
    items: [
      { id: 'foodie', label: 'Foodie', icon: '🍜' },
      { id: 'streetfood', label: 'Street Food', icon: '🍢' },
      { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
      { id: 'shopping', label: 'Shopping', icon: '🛍️' },
      { id: 'wellness', label: 'Wellness', icon: '🧖' },
    ]
  },
  {
    name: 'Vibe & Mood',
    items: [
      { id: 'romantic', label: 'Romantic', icon: '💖' },
      { id: 'family', label: 'Family Friendly', icon: '👨‍👩-👧‍👦' },
      { id: 'spiritual', label: 'Spiritual', icon: '🧘' },
      { id: 'luxury', label: 'Luxury', icon: '💎' },
      { id: 'offbeat', label: 'Offbeat', icon: '🗺️' },
    ]
  }
];

const ALL_PREFERENCES = PREFERENCE_CATEGORIES.flatMap(cat => cat.items);

const PlannerPage: React.FC<PlannerPageProps> = ({ initialQuery, tripId, navigateTo }) => {
  const [activeDay, setActiveDay] = useState<number | 'overview'>(1);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery || '');
  const [showForm, setShowForm] = useState(!initialQuery && !tripId);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{ activity: Activity | null, day: number } | null>(null);
  const [isTripEditModalOpen, setIsTripEditModalOpen] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    travelStyle: 'Moderate',
    budgetAmount: '',
    selectedPrefs: [] as string[]
  });

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.destination.length > 2 && showSuggestions) {
        fetchLocationSuggestions(formData.destination);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.destination]);

  const fetchLocationSuggestions = async (input: string) => {
    setIsSearchingLocations(true);
    try {
      // Added addressdetails=1 and bounded=1 to improve search accuracy
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5&polygon_geojson=0&dedupe=1`);
      const data = await response.json();
      const suggestions = data.map((item: any) => item.display_name);
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      generateAITrip({ destination: initialQuery, days: 3, travelStyle: 'Moderate', preferences: [] });
    } else if (tripId) {
      fetchExistingTrip(tripId);
    }
  }, [initialQuery, tripId]);

  const fetchExistingTrip = async (id: string) => {
    setIsLoading(true);
    try {
      const tripRef = doc(db, 'trips', id);
      const tripSnap = await getDoc(tripRef);
      
      if (tripSnap.exists()) {
        const data = tripSnap.data();
        const plan: TripPlan = {
          tripSummary: {
            destination: data.destination,
            totalDays: data.days,
            travelStyle: data.style,
            budgetAmount: data.budgetAmount,
            preferences: data.preferences || [],
            imageUrl: data.image || ''
          },
          hotelSuggestion: data.hotelSuggestion,
          transportOptions: data.transportOptions || [],
          days: data.daysData || [],
          budgetBreakdown: data.budgetBreakdown || {
            stay: '₹0',
            food: '₹0',
            transport: '₹0',
            activities: '₹0',
            totalEstimate: '₹0'
          }
        };
        setTripPlan(plan);
        setActiveDay('overview');
      } else {
        alert("Trip not found.");
        navigateTo('trips');
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      handleFirestoreError(error, OperationType.GET, `trips/${id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAITrip = async (params: { destination: string, days: number, travelStyle: string, budgetAmount?: string, preferences: string[] }) => {
    const { destination, days, travelStyle, budgetAmount, preferences } = params;
    if (!destination) return;
    
    setIsLoading(true);
    setShowForm(false);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prefString = preferences.length > 0 ? `Preferences: ${preferences.join(', ')}` : '';
      const budgetString = budgetAmount ? `Budget Amount: ₹${budgetAmount} (Indian Rupees)` : '';
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert AI Travel Planning Engine.
All currency values MUST be in Indian Rupees (INR) using the ₹ symbol.

Your role is to act as an intelligent system that:
1. Plans highly personalized, practical, and optimized trips.
2. Uses real-world data for locations, routes, and travel times.
3. Structures all outputs into strict JSON for UI rendering.
4. **CRITICAL:** For EVERY location in the itinerary, you MUST use the 'googleSearch' tool to find a direct, high-resolution, authentic image URL.
   - The URL MUST end in .jpg, .jpeg, or .png.
   - DO NOT use placeholder services (like picsum.photos).
   - DO NOT use generic search result pages.
   - If you cannot find a direct image URL, do not invent one; return an empty string.
5. **CRITICAL:** For EVERY activity, provide a compelling 'recommendationReason' explaining WHY this specific location is a must-visit, focusing on its unique value (e.g., historical significance, local experience, breathtaking view).

---
## CORE OBJECTIVE
Given a user query (destination: ${destination}, days: ${days}, style: ${travelStyle}, ${budgetString}, ${prefString}), generate a COMPLETE, PRACTICAL, and HIGHLY OPTIMIZED travel plan.

---
## OUTPUT RULES (STRICT)
* Output ONLY valid JSON.
* No explanation text.
* No markdown.
* No extra commentary.

---
## JSON STRUCTURE
{
  "tripSummary": {
    "destination": "string",
    "totalDays": number,
    "travelStyle": "budget | moderate | luxury",
    "budgetAmount": "string (e.g. ₹1,25,000)",
    "preferences": ["string"],
    "imageUrl": "string (A direct, high-resolution, authentic image URL of the destination. MUST end in .jpg, .jpeg, or .png. Use googleSearch to find this.)"
  },
  "budgetBreakdown": {
    "stay": "string",
    "food": "string",
    "transport": "string",
    "activities": "string",
    "totalEstimate": "string"
  },
  "hotelSuggestion": {
    "area": "string",
    "reason": "string"
  },
  "transportOptions": [
    {
      "type": "flight | train | bus | car",
      "duration": "string",
      "estimatedCost": "string",
      "recommendationScore": number
    }
  ],
  "days": [
    {
      "day": number,
      "activities": [
        {
          "time": "string",
          "title": "string",
          "category": "sightseeing | food | travel | rest",
          "duration": "string",
          "location": "string",
          "description": "string (detailed description)",
          "recommendationReason": "string (A compelling reason WHY this location is a must-visit, focusing on its unique value.)",
          "tips": ["string (useful insider tips)"],
          "bestTimeToVisit": "string",
          "imageUrl": "string (A direct, high-resolution, authentic image URL of THIS SPECIFIC location. MUST end in .jpg, .jpeg, or .png. Use googleSearch to find this.)",
          "coordinates": {
            "lat": number,
            "lng": number
          },
          "travelTimeFromPrevious": "string",
          "nearbyFood": [
            {
              "name": "string",
              "rating": number
            }
          ]
        }
      ]
    }
  ]
}

---
## PLANNING RULES (STRICT)
* Create a logical, optimized route to minimize travel time.
* Use only real-world, highly-rated locations.
* Ensure realistic timing (no impossible schedules).
* Include food stops naturally.
* Add accurate travel time between each activity.
* Suggest the best area to stay based on the travel style.
* Balance activities (not too packed, not too empty).
* Prioritize unique, authentic experiences over generic tourist traps.
* Mix popular landmarks with hidden gems and local favorites.
* Ensure a diverse range of experiences (e.g., mix of culture, nature, adventure, and relaxation).

---
## FINAL INSTRUCTION
Return ONLY JSON for the following query: ${destination} for ${days} days with interests in ${preferences.join(', ')} and a ${travelStyle} budget. The frontend depends strictly on this structure.`,
        config: {
          systemInstruction: "You are a backend API. Return ONLY raw JSON without any markdown formatting, conversational filler, or explanation text.",
          tools: [{ googleSearch: {} }],
        },
      });

      let rawText = response.text || '{}';
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        rawText = jsonMatch[1];
      } else {
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          rawText = rawText.substring(firstBrace, lastBrace + 1);
        }
      }
      
      const data = JSON.parse(rawText);
      console.log("AI Trip Data:", data);
      // Add IDs to activities for React keys
      if (data.days) {
        data.days = data.days.map((day: any) => ({
          ...day,
          activities: day.activities.map((act: any) => ({
            ...act,
            id: Math.random().toString(36).substr(2, 9)
          }))
        }));
      }
      setTripPlan(data);
      setActiveDay('overview');
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Co-pilot encountered an error.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentDayPlan = activeDay === 'overview' 
    ? null 
    : tripPlan?.days.find(d => d.day === activeDay);

  const allActivities = tripPlan?.days.flatMap(d => d.activities) || [];

  const togglePreference = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPrefs: prev.selectedPrefs.includes(id)
        ? prev.selectedPrefs.filter(p => p !== id)
        : [...prev.selectedPrefs, id]
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAITrip({
      destination: formData.destination,
      days: isNaN(formData.days) ? 3 : formData.days,
      travelStyle: formData.travelStyle,
      budgetAmount: formData.budgetAmount,
      preferences: formData.selectedPrefs.map(id => ALL_PREFERENCES.find(p => p.id === id)?.label || id)
    });
  };

  const handleCreateCustomTrip = () => {
    const daysCount = isNaN(formData.days) ? 3 : formData.days;
    const newTrip: TripPlan = {
      tripSummary: {
        destination: formData.destination || 'My Custom Trip',
        totalDays: daysCount,
        travelStyle: formData.travelStyle,
        budgetAmount: formData.budgetAmount || '₹0',
        preferences: formData.selectedPrefs.map(id => ALL_PREFERENCES.find(p => p.id === id)?.label || id),
        imageUrl: `https://picsum.photos/seed/${formData.destination}/800/600`
      },
      hotelSuggestion: { area: 'Not specified', reason: 'Custom trip' },
      transportOptions: [],
      days: Array.from({ length: daysCount }, (_, i) => ({
        day: i + 1,
        activities: []
      })),
      budgetBreakdown: {
        stay: '₹0',
        food: '₹0',
        transport: '₹0',
        activities: '₹0',
        totalEstimate: '₹0'
      }
    };
    setTripPlan(newTrip);
    setActiveDay(1);
    setShowForm(false);
  };

  const handleAddActivity = (day: number) => {
    setEditingActivity({ activity: null, day });
    setIsActivityModalOpen(true);
  };

  const handleEditActivity = (activity: Activity, day: number) => {
    setEditingActivity({ activity, day });
    setIsActivityModalOpen(true);
  };

  const handleDeleteActivity = (activityId: string, day: number) => {
    if (!tripPlan) return;
    const updatedDays = tripPlan.days.map(d => {
      if (d.day === day) {
        return {
          ...d,
          activities: d.activities.filter(a => a.id !== activityId)
        };
      }
      return d;
    });
    setTripPlan({ ...tripPlan, days: updatedDays });
  };

  const handleSaveActivity = (activity: Activity, day: number) => {
    if (!tripPlan) return;
    
    const updatedDays = tripPlan.days.map(d => {
      if (d.day === day) {
        const existingIndex = d.activities.findIndex(a => a.id === activity.id);
        if (existingIndex > -1) {
          // Update
          const newActivities = [...d.activities];
          newActivities[existingIndex] = activity;
          return { ...d, activities: newActivities };
        } else {
          // Add
          return { ...d, activities: [...d.activities, activity] };
        }
      }
      return d;
    });

    setTripPlan({ ...tripPlan, days: updatedDays });
    setIsActivityModalOpen(false);
    setEditingActivity(null);
  };

  const handleUpdateTripSummary = (summary: TripPlan['tripSummary']) => {
    if (!tripPlan) return;
    
    // If days changed, we need to adjust the days array
    let updatedDays = [...tripPlan.days];
    if (summary.totalDays > tripPlan.tripSummary.totalDays) {
      for (let i = tripPlan.tripSummary.totalDays + 1; i <= summary.totalDays; i++) {
        updatedDays.push({ day: i, activities: [] });
      }
    } else if (summary.totalDays < tripPlan.tripSummary.totalDays) {
      updatedDays = updatedDays.slice(0, summary.totalDays);
    }

    setTripPlan({
      ...tripPlan,
      tripSummary: summary,
      days: updatedDays
    });
    setIsTripEditModalOpen(false);
  };

  const handleSaveTripToFirestore = async () => {
    if (!tripPlan) return;
    if (!auth.currentUser) {
      alert("Please login to save your trip.");
      navigateTo('login');
      return;
    }

    setIsSavingTrip(true);
    setSaveMessage(null);

    try {
      const tripData: any = {
        destination: tripPlan.tripSummary.destination,
        userId: auth.currentUser.uid,
        days: tripPlan.tripSummary.totalDays,
        style: tripPlan.tripSummary.travelStyle,
        budgetAmount: tripPlan.tripSummary.budgetAmount || '₹0',
        preferences: tripPlan.tripSummary.preferences,
        hotelSuggestion: tripPlan.hotelSuggestion,
        transportOptions: tripPlan.transportOptions,
        daysData: tripPlan.days, // Store the full itinerary
        budgetBreakdown: tripPlan.budgetBreakdown,
        updatedAt: serverTimestamp(),
        startDate: 'TBD', // Could be added to form
        endDate: 'TBD',
        image: tripPlan.tripSummary.imageUrl || `https://picsum.photos/seed/${tripPlan.tripSummary.destination}/800/600`
      };

      if (tripId) {
        await updateDoc(doc(db, 'trips', tripId), tripData);
        setSaveMessage({ type: 'success', text: 'Trip updated successfully!' });
      } else {
        tripData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'trips'), tripData);
        setSaveMessage({ type: 'success', text: 'Trip saved to your Hub!' });
      }
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, tripId ? `trips/${tripId}` : 'trips');
      setSaveMessage({ type: 'error', text: 'Failed to save trip.' });
    } finally {
      setIsLoading(false);
      setIsSavingTrip(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-brand-deep flex flex-col relative">
      {/* New Trip Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-brand-deep/80 backdrop-blur-xl">
          <div className="min-h-full flex items-center justify-center p-2 md:p-6">
            <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[4rem] shadow-2xl border border-brand-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300 my-4 md:my-8">
              <div className="p-5 md:p-16">
              <button 
                onClick={() => {
                  if (tripPlan) {
                    setShowForm(false);
                  } else {
                    navigateTo('home');
                  }
                }}
                className="flex items-center gap-2 text-brand-slate hover:text-brand-primary transition-colors mb-8 group outline-none"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Back</span>
              </button>

              <div className="flex items-center justify-between mb-6 md:mb-12">
                <div>
                  <h2 className="text-xl md:text-4xl font-black text-brand-heading tracking-tighter">New Journey</h2>
                  <p className="text-brand-slate font-medium mt-1 md:mt-2 text-xs md:text-base">Configure your AI co-pilot for the perfect trip.</p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 md:space-y-10">
                <div className="space-y-2 md:space-y-4">
                  <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary ml-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 text-brand-primary" />
                    <input 
                      required
                      type="text" 
                      placeholder="Where to? (e.g. Kyoto, Japan)"
                      className="w-full pl-12 md:pl-16 pr-5 md:pr-8 py-3.5 md:py-6 bg-brand-dark border-2 border-transparent focus:border-brand-primary rounded-[1rem] md:rounded-[2rem] text-sm md:text-lg transition-all outline-none text-brand-heading font-bold placeholder:text-brand-slate/30"
                      value={formData.destination}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, destination: e.target.value }));
                        setShowSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onFocus={() => formData.destination.length > 2 && setShowSuggestions(true)}
                    />
                    {showSuggestions && (locationSuggestions.length > 0 || isSearchingLocations) && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-brand-primary/10 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                        {isSearchingLocations ? (
                          <div className="p-4 flex items-center justify-center gap-3 text-brand-slate">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest">Searching...</span>
                          </div>
                        ) : (
                          locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, destination: suggestion }));
                                setLocationSuggestions([]);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-6 py-4 hover:bg-brand-dark transition-colors border-b border-brand-primary/5 last:border-0 flex items-start gap-3 group"
                            >
                              <MapPin className="w-4 h-4 mt-0.5 text-brand-slate group-hover:text-brand-primary transition-colors shrink-0" />
                              <span className="text-xs md:text-sm font-bold text-brand-heading line-clamp-2">{suggestion}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
                  <div className="space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary ml-2">Duration (Days)</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 text-brand-primary" />
                      <input 
                        required
                        type="number" 
                        min="1"
                        max="30"
                        className="w-full pl-12 md:pl-16 pr-5 md:pr-8 py-3.5 md:py-6 bg-brand-dark border-2 border-transparent focus:border-brand-primary rounded-[1rem] md:rounded-[2rem] text-sm md:text-lg transition-all outline-none text-brand-heading font-bold"
                        value={isNaN(formData.days) ? '' : formData.days}
                        onChange={(e) => {
                          const val = e.target.value === '' ? NaN : parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, days: val }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary ml-2">Travel Style</label>
                    <div className="flex gap-2">
                      {['Budget', 'Moderate', 'Luxury'].map(style => (
                        <button 
                          key={style}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, travelStyle: style }))}
                          className={`flex-1 py-3.5 md:py-6 rounded-[1rem] md:rounded-[2rem] text-[10px] md:text-sm font-black transition-all border-2 ${
                            formData.travelStyle === style 
                              ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                              : 'bg-brand-dark text-brand-slate border-transparent hover:border-brand-primary/30'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary ml-2">Budget Amount (INR)</label>
                    <div className="relative">
                      <div className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-sm md:text-base">₹</div>
                      <input 
                        type="text" 
                        placeholder="e.g. 1,50,000"
                        className="w-full pl-10 md:pl-12 pr-5 md:pr-8 py-3.5 md:py-6 bg-brand-dark border-2 border-transparent focus:border-brand-primary rounded-[1rem] md:rounded-[2rem] text-sm md:text-lg transition-all outline-none text-brand-heading font-bold placeholder:text-brand-slate/30"
                        value={formData.budgetAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary ml-2">Interests & Vibes</label>
                  <div className="space-y-6 md:space-y-10">
                    {PREFERENCE_CATEGORIES.map(category => (
                      <div key={category.name} className="space-y-3 md:space-y-4">
                        <h5 className="text-[8px] md:text-[10px] font-black text-brand-slate uppercase tracking-[0.2em] ml-2 opacity-50">{category.name}</h5>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {category.items.map(pref => (
                            <button
                              key={pref.id}
                              type="button"
                              onClick={() => togglePreference(pref.id)}
                              className={`px-4 md:px-6 py-2.5 md:py-4 rounded-[1rem] md:rounded-[1.5rem] text-[10px] md:text-sm font-bold transition-all flex items-center gap-2 md:gap-3 border-2 ${
                                formData.selectedPrefs.includes(pref.id)
                                  ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.05]'
                                  : 'bg-brand-dark border-transparent text-brand-slate hover:border-brand-primary/30'
                              }`}
                            >
                              <span className="text-sm md:text-lg">{pref.icon}</span>
                              {pref.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      if (tripPlan) {
                        setShowForm(false);
                      } else {
                        navigateTo('home');
                      }
                    }}
                    className="flex-1 py-4 md:py-8 bg-brand-dark text-brand-heading text-base md:text-xl font-black uppercase tracking-[0.2em] rounded-[1rem] md:rounded-[2.5rem] hover:bg-brand-primary/5 transition-all outline-none"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 md:py-8 bg-brand-primary text-white text-base md:text-xl font-black uppercase tracking-[0.2em] rounded-[1rem] md:rounded-[2.5rem] shadow-2xl hover:bg-[#FF9A3C] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 outline-none"
                  >
                    {isLoading ? 'Igniting AI Engine...' : 'Generate My Trip'}
                  </button>
                </div>
                {!isLoading && (
                  <button 
                    type="button"
                    onClick={handleCreateCustomTrip}
                    className="w-full py-3 md:py-6 bg-brand-dark text-brand-slate text-[10px] md:text-sm font-black uppercase tracking-[0.2em] rounded-[1rem] md:rounded-[2rem] hover:bg-brand-primary/10 transition-all outline-none border border-brand-primary/10"
                  >
                    Or Create Custom Trip Manually
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-3xl border-b border-brand-primary/10 sticky top-16 z-30 px-3 md:px-8 py-3 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-8 shadow-sm">
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => navigateTo('home')} 
            className="flex items-center gap-2 px-2 md:px-4 py-2 md:py-3 hover:bg-brand-dark rounded-[0.8rem] md:rounded-[1.5rem] transition-all outline-none group"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-brand-slate group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-slate">Back</span>
          </button>
          <div className="text-left">
            <h1 
              onClick={() => setIsTripEditModalOpen(true)}
              className="text-lg md:text-3xl font-black text-brand-heading flex items-center gap-2 md:gap-3 capitalize tracking-tight cursor-pointer hover:text-brand-primary transition-colors"
            >
              <MapPin className="w-5 h-5 md:w-8 md:h-8 text-brand-primary" />
              <span className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
                {tripPlan?.tripSummary.destination || formData.destination || 'New Trip'}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
              <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-md">
                {tripPlan?.tripSummary.travelStyle || 'AI'}
              </span>
              <p className="text-[8px] md:text-[11px] text-brand-primary font-black uppercase tracking-[0.25em]">
                • {tripPlan?.tripSummary.totalDays || 0} Days
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <button 
            onClick={() => setShowForm(true)}
            className="px-3 md:px-8 py-2.5 md:py-5 bg-brand-dark text-brand-heading text-[8px] md:text-[11px] font-black uppercase tracking-widest rounded-[0.8rem] md:rounded-[2rem] border border-brand-primary/10 hover:bg-brand-primary/5 transition-all"
          >
            New
          </button>
          <div className="relative group flex-grow md:w-[300px] lg:w-[400px]">
            <input 
              type="text" 
              placeholder="Refine trip..."
              className="w-full pl-4 md:pl-7 pr-10 md:pr-16 py-2.5 md:py-5 bg-brand-dark border-2 border-transparent focus:border-brand-primary rounded-[0.8rem] md:rounded-[2rem] text-[10px] md:text-sm transition-all outline-none text-brand-heading font-bold placeholder:text-brand-slate/40"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateAITrip({ 
                destination: query, 
                days: tripPlan?.tripSummary.totalDays || 3, 
                travelStyle: tripPlan?.tripSummary.travelStyle || 'Moderate', 
                budgetAmount: tripPlan?.tripSummary.budgetAmount,
                preferences: [] 
              })}
            />
            <button onClick={() => generateAITrip({ 
              destination: query, 
              days: tripPlan?.tripSummary.totalDays || 3, 
              travelStyle: tripPlan?.tripSummary.travelStyle || 'Moderate', 
              budgetAmount: tripPlan?.tripSummary.budgetAmount,
              preferences: [] 
            })} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-slate hover:text-brand-primary outline-none transition-colors p-1">
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsTripEditModalOpen(true)}
            disabled={!tripPlan}
            className="flex items-center gap-2 hidden sm:flex px-6 md:px-10 py-3 md:py-5 bg-brand-dark border border-brand-primary/20 text-brand-heading text-[11px] md:text-[13px] font-black uppercase tracking-widest rounded-[1rem] md:rounded-[2rem] hover:bg-brand-primary/5 transition-all outline-none disabled:opacity-50"
          >
            <Pencil className="w-4 h-4" /> Edit Trip
          </button>
          <button 
            onClick={handleSaveTripToFirestore} 
            disabled={isSavingTrip || !tripPlan}
            className="hidden sm:block px-6 md:px-10 py-3 md:py-5 bg-brand-primary text-white text-[11px] md:text-[13px] font-black uppercase tracking-widest rounded-[1rem] md:rounded-[2rem] shadow-xl hover:bg-[#FF9A3C] transition-all outline-none disabled:opacity-50"
          >
            {isSavingTrip ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`fixed top-24 right-8 z-[60] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 ${
          saveMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {saveMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-black uppercase tracking-widest">{saveMessage.text}</span>
        </div>
      )}

      <div className="flex-grow flex flex-col lg:flex-row container mx-auto px-4 md:px-6 py-8 md:py-16 gap-8 md:gap-12 max-w-[1400px]">
        {/* Sidebar */}
        <aside className="lg:w-[320px] space-y-4 md:space-y-10">
          {/* Timeline */}
          <div className="bg-brand-dark p-4 md:p-12 rounded-[1.5rem] md:rounded-[4rem] border border-brand-primary/10 shadow-sm">
            <h4 className="font-black text-brand-heading/20 uppercase text-[9px] md:text-[11px] tracking-[0.4em] mb-4 md:mb-12 flex items-center justify-between">Timeline <Calendar className="w-4 h-4" /></h4>
            <div className="flex lg:flex-col gap-2 md:gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <button 
                onClick={() => setActiveDay('overview')}
                className={`flex-shrink-0 lg:w-full text-left px-4 md:px-7 py-3 md:py-6 rounded-[1rem] md:rounded-[2rem] text-[10px] md:text-sm font-black transition-all flex items-center justify-between outline-none ${
                  activeDay === 'overview' ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 lg:scale-[1.05]' : 'text-brand-slate hover:bg-brand-primary/5'
                }`}
              >
                Overview
              </button>
              {tripPlan?.days.map(day => (
                <button 
                  key={day.day} 
                  onClick={() => setActiveDay(day.day)}
                  className={`flex-shrink-0 lg:w-full text-left px-4 md:px-7 py-3 md:py-6 rounded-[1rem] md:rounded-[2rem] text-[10px] md:text-sm font-black transition-all flex items-center justify-between outline-none ${
                    activeDay === day.day ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 lg:scale-[1.05]' : 'text-brand-slate hover:bg-brand-primary/5'
                  }`}
                >
                  Day {day.day}
                </button>
              )) || [1, 2, 3].map(d => (
                <div key={d} className="flex-shrink-0 w-20 lg:w-full h-10 md:h-16 bg-white/5 rounded-[1rem] md:rounded-[2rem] animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Hotel Suggestion */}
          {tripPlan && (
            <div className="bg-white rounded-[1.5rem] md:rounded-[4rem] p-5 md:p-12 text-brand-heading shadow-xl border border-brand-primary/10">
              <h4 className="font-black flex items-center gap-3 mb-3 md:mb-6 uppercase text-[9px] md:text-[11px] tracking-[0.4em] text-brand-primary">Stay Recommendation</h4>
              <div className="space-y-3 md:space-y-4">
                <div className="p-4 md:p-6 bg-brand-dark rounded-[1rem] md:rounded-[2rem]">
                  <p className="text-base md:text-xl font-black text-brand-heading mb-1 md:mb-2">{tripPlan.hotelSuggestion.area}</p>
                  <p className="text-[9px] md:text-xs text-brand-slate leading-relaxed">{tripPlan.hotelSuggestion.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transport */}
          {tripPlan && (
            <div className="bg-brand-dark rounded-[1.5rem] md:rounded-[4rem] p-5 md:p-12 text-brand-heading shadow-sm border border-brand-primary/10">
              <h4 className="font-black flex items-center gap-3 mb-4 md:mb-8 uppercase text-[9px] md:text-[11px] tracking-[0.4em] text-brand-primary/40">Transport Options</h4>
              <div className="space-y-3 md:space-y-4">
                {tripPlan.transportOptions.map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-white/5 rounded-[1rem] md:rounded-[1.5rem] border border-white/5">
                    <div>
                      <p className="text-xs md:text-sm font-black text-brand-heading capitalize">{opt.type}</p>
                      <p className="text-[8px] md:text-[10px] text-brand-slate uppercase tracking-widest">{opt.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-black text-brand-primary">{opt.estimatedCost}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${j < opt.recommendationScore ? 'bg-brand-primary' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-4 md:space-y-10">
          <div className={`bg-brand-dark rounded-[1.5rem] md:rounded-[5rem] shadow-sm border border-brand-primary/10 min-h-[300px] md:min-h-[800px] flex flex-col transition-all duration-700 ${isLoading ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
            <div className="px-5 md:px-16 py-6 md:py-14 border-b border-brand-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 bg-white/5">
              <div className="text-left">
                <h2 className="text-2xl md:text-5xl font-black text-brand-heading tracking-tighter">
                  {activeDay === 'overview' ? 'Trip Overview' : `Day ${activeDay}`}
                </h2>
                <p className="text-brand-slate text-[10px] md:text-sm font-bold mt-1 md:mt-2">
                  {activeDay === 'overview' 
                    ? 'A bird\'s eye view of your entire journey across all locations.' 
                    : 'Precision-crafted itinerary for your journey.'}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {activeDay !== 'overview' && (
                  <button 
                    onClick={() => handleAddActivity(activeDay as number)}
                    className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-brand-dark text-brand-heading hover:bg-brand-primary/5 transition-all rounded-[0.8rem] md:rounded-[1.5rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] w-full sm:w-auto border border-brand-primary/10"
                  >
                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Add Activity
                  </button>
                )}
                <button onClick={() => generateAITrip({ 
                  destination: tripPlan?.tripSummary.destination || '', 
                  days: tripPlan?.tripSummary.totalDays || 3, 
                  travelStyle: tripPlan?.tripSummary.travelStyle || 'Moderate', 
                  budgetAmount: tripPlan?.tripSummary.budgetAmount,
                  preferences: tripPlan?.tripSummary.preferences || [] 
                })} className="flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-brand-primary text-white hover:bg-[#FF9A3C] transition-all rounded-[0.8rem] md:rounded-[1.5rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] w-full sm:w-auto">
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  Regen
                </button>
              </div>
            </div>

            {/* Map Section */}
            {(activeDay === 'overview' ? allActivities.length > 0 : (currentDayPlan && currentDayPlan.activities.length > 0)) && (
              <div className="px-3 md:px-16 pt-4 md:pt-10">
                <div className="h-[200px] md:h-[500px] w-full rounded-[1rem] md:rounded-[3rem] overflow-hidden border border-brand-primary/10">
                  <MapComponent 
                    days={activeDay === 'overview' ? tripPlan?.days : undefined}
                    activities={activeDay === 'overview' ? undefined : (currentDayPlan?.activities || [])} 
                  />
                </div>
              </div>
            )}

            <div className="px-4 md:px-16 py-6 md:py-16 space-y-6 md:space-y-10">
              {activeDay === 'overview' ? (
                <div className="space-y-8 md:space-y-16">
                  {tripPlan?.days.map(day => (
                    <div key={day.day} className="space-y-4 md:space-y-8">
                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-primary rounded-xl md:rounded-3xl flex items-center justify-center text-white text-lg md:text-2xl font-black shadow-lg shadow-brand-primary/20">
                          {day.day}
                        </div>
                        <div>
                          <h3 className="text-xl md:text-3xl font-black text-brand-heading">Day {day.day}</h3>
                          <p className="text-brand-slate font-bold text-[10px] md:text-sm">{day.activities.length} Activities planned</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                        {day.activities.map(activity => (
                          <div 
                            key={activity.id} 
                            onClick={() => setSelectedActivity(activity)}
                            className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border border-brand-primary/5 flex items-center gap-3 md:gap-6 shadow-sm hover:border-brand-primary/20 hover:scale-[1.02] transition-all cursor-pointer group"
                          >
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-brand-dark rounded-lg md:rounded-2xl flex items-center justify-center text-brand-primary font-black text-[9px] md:text-xs group-hover:bg-brand-primary group-hover:text-white transition-colors">
                              {activity.time}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-black text-brand-heading text-sm md:text-lg leading-tight truncate">{activity.title}</p>
                              <p className="text-[8px] md:text-[10px] text-brand-slate font-black uppercase tracking-widest mt-0.5 md:mt-1 truncate">{activity.location}</p>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditActivity(activity, day.day);
                                }}
                                className="p-1.5 md:p-2 text-brand-slate hover:text-brand-primary transition-colors"
                                title="Edit Activity"
                              >
                                <Pencil className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                              <Info className="w-4 h-4 md:w-5 md:h-5 text-slate-200 group-hover:text-brand-primary transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentDayPlan ? (
                <div className="space-y-6 md:space-y-12">
                  {currentDayPlan.activities.map((item, idx) => (
                    <div key={item.id} className="group relative">
                      <div className="flex gap-3 md:gap-10">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 md:w-16 md:h-16 bg-brand-dark rounded-xl md:rounded-3xl flex items-center justify-center text-brand-primary font-black text-[10px] md:text-sm shadow-inner">
                            {item.time}
                          </div>
                          {idx !== currentDayPlan.activities.length - 1 && (
                            <div className="w-0.5 md:w-1 flex-grow bg-gradient-to-b from-brand-primary/20 to-transparent my-2 md:my-4 rounded-full" />
                          )}
                        </div>
                        
                        <div 
                          onClick={() => setSelectedActivity(item)}
                          className="flex-grow bg-white p-4 md:p-12 rounded-[1.5rem] md:rounded-[4rem] shadow-xl border border-brand-primary/5 hover:border-brand-primary/20 transition-all cursor-pointer group/card"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-4 md:mb-8">
                            <div>
                              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                <span className="px-2 md:px-3 py-0.5 md:py-1 bg-brand-primary/10 text-brand-primary text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full">
                                  {item.category}
                                </span>
                                <span className="flex items-center gap-1 md:gap-1.5 text-brand-slate text-[9px] md:text-[10px] font-bold">
                                  <Clock className="w-2.5 h-2.5 md:w-3 h-3" /> {item.duration}
                                </span>
                              </div>
                              <h3 className="text-lg md:text-4xl font-black text-brand-heading tracking-tight mb-1 md:mb-2 group-hover/card:text-brand-primary transition-colors">{item.title}</h3>
                              <p className="text-brand-slate font-medium flex items-center gap-1.5 md:gap-2 text-xs md:text-base">
                                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand-primary" /> {item.location}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 md:gap-4">
                              {item.travelTimeFromPrevious && idx > 0 && (
                                <div className="bg-brand-dark px-3 md:px-6 py-2 md:py-4 rounded-[1rem] md:rounded-[1.5rem] border border-brand-primary/10">
                                  <p className="text-[7px] md:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-0.5 md:mb-1">Travel Time</p>
                                  <p className="text-[10px] md:text-sm font-black text-brand-heading flex items-center gap-1.5 md:gap-2">
                                    <Navigation className="w-2.5 h-2.5 md:w-3 h-3" /> {item.travelTimeFromPrevious}
                                  </p>
                                </div>
                              )}
                              <div className="p-2.5 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl text-brand-primary group-hover/card:bg-brand-primary group-hover/card:text-white transition-all">
                                <Info className="w-4 h-4 md:w-6 md:h-6" />
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditActivity(item, activeDay as number);
                                }}
                                className="p-2.5 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl text-brand-slate hover:text-brand-primary transition-all"
                                title="Edit Activity"
                              >
                                <Pencil className="w-4 h-4 md:w-6 md:h-6" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 md:space-y-6">
                            <h4 className="text-[8px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Local Flavors Nearby</h4>
                            <div className="flex flex-wrap gap-1.5 md:gap-3">
                              {item.nearbyFood.map((food, fidx) => (
                                <div key={fidx} className="px-2.5 md:px-4 py-1.5 md:py-2 bg-brand-dark rounded-full text-[8px] md:text-[10px] font-bold text-brand-slate flex items-center gap-1.5 md:gap-2 border border-brand-primary/5">
                                  <Sparkles className="w-2.5 h-2.5 md:w-3 h-3 text-brand-primary" />
                                  {food.name} • ⭐ {food.rating}
                                </div>
                              ))}
                            </div>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteActivity(item.id, activeDay as number);
                            }}
                            className="absolute top-2 md:top-8 right-2 md:right-8 p-2 md:p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[0.8rem] md:rounded-[1.5rem] md:opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4 md:w-6 md:h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 md:py-40 text-center opacity-10">
                  <Navigation className="w-20 h-20 md:w-32 md:h-32 mb-6 md:mb-10 text-brand-heading" />
                  <p className="font-black text-xl md:text-3xl text-brand-heading uppercase tracking-[0.5em]">Canvas empty</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget Breakdown */}
          {tripPlan && (
            <div className="bg-white rounded-[2rem] md:rounded-[5rem] p-8 md:p-16 shadow-xl border border-brand-primary/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <h3 className="text-2xl md:text-4xl font-black text-brand-heading tracking-tighter">Budget Intelligence</h3>
                <div className="md:text-right">
                  <p className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">Total Estimate</p>
                  <p className="text-2xl md:text-3xl font-black text-brand-heading">{tripPlan.budgetBreakdown.totalEstimate}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[
                  { label: 'Accommodation', value: tripPlan.budgetBreakdown.stay, icon: <Calendar className="w-5 h-5" /> },
                  { label: 'Dining', value: tripPlan.budgetBreakdown.food, icon: <Sparkles className="w-5 h-5" /> },
                  { label: 'Transport', value: tripPlan.budgetBreakdown.transport, icon: <Navigation className="w-5 h-5" /> },
                  { label: 'Activities', value: tripPlan.budgetBreakdown.activities, icon: <Clock className="w-5 h-5" /> },
                ].map((item, i) => (
                  <div key={i} className="bg-brand-dark p-6 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border border-brand-primary/5">
                    <div className="text-brand-primary mb-3 md:mb-4">{item.icon}</div>
                    <p className="text-[9px] md:text-[10px] font-black text-brand-slate uppercase tracking-[0.2em] mb-1 md:mb-2">{item.label}</p>
                    <p className="text-lg md:text-xl font-black text-brand-heading">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedActivity && (
        <PlaceDetailModal 
          activity={selectedActivity} 
          onClose={() => setSelectedActivity(null)} 
        />
      )}

      {isActivityModalOpen && (
        <ActivityEditModal 
          activity={editingActivity?.activity || null}
          day={editingActivity?.day || 1}
          onClose={() => {
            setIsActivityModalOpen(false);
            setEditingActivity(null);
          }}
          onSave={handleSaveActivity}
        />
      )}

      {isTripEditModalOpen && tripPlan && (
        <TripEditModal 
          summary={tripPlan.tripSummary}
          onClose={() => setIsTripEditModalOpen(false)}
          onSave={handleUpdateTripSummary}
        />
      )}
    </div>
  );
};

const ActivityEditModal = ({ activity, day, onClose, onSave }: { 
  activity: Activity | null, 
  day: number, 
  onClose: () => void, 
  onSave: (activity: Activity, day: number) => void 
}) => {
  const [formData, setFormData] = useState<Activity>(activity || {
    id: Math.random().toString(36).substr(2, 9),
    time: '09:00 AM',
    title: '',
    category: 'sightseeing',
    duration: '2 hours',
    location: '',
    description: '',
    tips: [],
    bestTimeToVisit: '',
    imageUrl: '',
    coordinates: { lat: 0, lng: 0 },
    travelTimeFromPrevious: '',
    nearbyFood: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, day);
  };

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-brand-deep/80 backdrop-blur-xl">
      <div className="min-h-full flex items-center justify-center p-3 md:p-6">
        <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[4rem] shadow-2xl border border-brand-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300 my-4 md:my-8">
          <div className="p-6 md:p-16">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-4xl font-black text-brand-heading tracking-tighter">
                {activity ? 'Edit Activity' : 'Add Activity'}
              </h2>
            <button onClick={onClose} className="p-2 hover:bg-brand-dark rounded-xl transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Time</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Duration</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Title</label>
              <input 
                required
                type="text" 
                className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Location Name</label>
              <input 
                required
                type="text" 
                className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Latitude</label>
                <input 
                  required
                  type="number" 
                  step="any"
                  className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                  value={formData.coordinates.lat}
                  onChange={e => setFormData({ ...formData, coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) } })}
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Longitude</label>
                <input 
                  required
                  type="number" 
                  step="any"
                  className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                  value={formData.coordinates.lng}
                  onChange={e => setFormData({ ...formData, coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) } })}
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Description</label>
              <textarea 
                required
                rows={3}
                className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold resize-none text-xs md:text-base"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="w-full py-4 md:py-6 bg-brand-primary text-white font-black uppercase tracking-widest rounded-2xl md:rounded-3xl shadow-xl hover:bg-[#FF9A3C] transition-all text-xs md:text-base">
              Save Activity
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};

const TripEditModal = ({ summary, onClose, onSave }: { 
  summary: TripPlan['tripSummary'], 
  onClose: () => void, 
  onSave: (summary: TripPlan['tripSummary']) => void 
}) => {
  const [formData, setFormData] = useState(summary);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-brand-deep/80 backdrop-blur-xl">
      <div className="min-h-full flex items-center justify-center p-3 md:p-6">
        <div className="bg-white w-full max-w-2xl rounded-[1.5rem] md:rounded-[4rem] shadow-2xl border border-brand-primary/10 overflow-hidden animate-in fade-in zoom-in duration-300 my-4 md:my-8">
          <div className="p-6 md:p-16">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-4xl font-black text-brand-heading tracking-tighter">Edit Trip Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-brand-dark rounded-xl transition-colors">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Destination</label>
              <input 
                required
                type="text" 
                className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                value={formData.destination}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Duration (Days)</label>
              <input 
                required
                type="number" 
                min="1"
                max="30"
                className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                value={formData.totalDays}
                onChange={e => setFormData({ ...formData, totalDays: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-brand-primary">Budget Amount</label>
              <input 
                type="text" 
                className="w-full p-3 md:p-4 bg-brand-dark rounded-xl md:rounded-2xl outline-none border-2 border-transparent focus:border-brand-primary font-bold text-xs md:text-base"
                value={formData.budgetAmount}
                onChange={e => setFormData({ ...formData, budgetAmount: e.target.value })}
              />
            </div>

            <button type="submit" className="w-full py-4 md:py-6 bg-brand-primary text-white font-black uppercase tracking-widest rounded-2xl md:rounded-3xl shadow-xl hover:bg-[#FF9A3C] transition-all text-xs md:text-base">
              Update Trip
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};

const LocationImage = ({ activity, className }: { activity: Activity, className: string }) => {
  const [imgSrc, setImgSrc] = useState(activity.imageUrl || `https://picsum.photos/seed/${activity.title.replace(/\s+/g, '-')}/1200/800`);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Attempt to fetch real image from Wikipedia
    const fetchWikiImage = async () => {
      try {
        const query = `${activity.title} ${activity.location}`;
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&origin=*`);
        const data = await res.json();
        if(data?.query?.pages) {
          const pageId = Object.keys(data.query.pages)[0];
          if (pageId && data.query.pages[pageId].original) {
            setImgSrc(data.query.pages[pageId].original.source);
          }
        }
      } catch(e) { console.error("Wiki search failed", e); }
    };
    fetchWikiImage();
  }, [activity.title, activity.location]);

  return (
    <img 
      src={imgSrc} 
      alt={activity.title}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (!hasError) {
          setHasError(true);
          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${activity.title.replace(/\s+/g, '-')}/1200/800`;
        }
      }}
    />
  );
};

const PlaceDetailModal = ({ activity, onClose }: { activity: Activity, onClose: () => void }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-8 bg-brand-dark/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[1.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-10 md:right-10 z-10 p-2.5 md:p-4 bg-white/80 backdrop-blur-md rounded-xl md:rounded-3xl text-brand-heading hover:bg-brand-primary hover:text-white transition-all shadow-lg"
        >
          <X className="w-4 h-4 md:w-6 md:h-6" />
        </button>

        <div className="overflow-y-auto flex-1 scrollbar-hide">
          {/* Hero Image */}
          <div className="relative h-[200px] md:h-[450px] w-full bg-brand-dark">
            <LocationImage 
              activity={activity} 
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 md:bottom-16 md:left-16 right-4 md:right-16">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <span className="px-3 md:px-4 py-1 md:py-1.5 bg-brand-primary text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  {activity.category}
                </span>
                <span className="flex items-center gap-1 md:gap-1.5 text-white/80 text-[8px] md:text-[10px] font-bold">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" /> {activity.duration}
                </span>
              </div>
              <h2 className="text-xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2 md:mb-4">{activity.title}</h2>
              <p className="text-white/70 font-medium flex items-center gap-1.5 md:gap-2 text-xs md:text-lg">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" /> {activity.location}
              </p>
            </div>
          </div>

          <div className="p-5 md:p-16 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              <section>
                <h3 className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 md:mb-6">Why Visit</h3>
                <p className="text-brand-slate text-sm md:text-xl leading-relaxed font-medium mb-8">
                  {activity.recommendationReason}
                </p>
                <h3 className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 md:mb-6">The Experience</h3>
                <p className="text-brand-slate text-sm md:text-xl leading-relaxed font-medium">
                  {activity.description}
                </p>
              </section>

              <section>
                <h3 className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 md:mb-6">Insider Tips</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {activity.tips.map((tip, idx) => (
                    <div key={idx} className="p-4 md:p-5 bg-brand-dark rounded-xl md:rounded-3xl border border-brand-primary/5 flex gap-3 md:gap-4">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-brand-primary shrink-0" />
                      <p className="text-xs md:text-sm text-brand-slate font-bold leading-snug">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8 md:space-y-12">
              <section>
                <h3 className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 md:mb-6">Best Time</h3>
                <div className="p-5 md:p-6 bg-brand-dark rounded-2xl md:rounded-3xl border border-brand-primary/5 flex items-center gap-3 md:gap-4">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
                  <div>
                    <p className="text-[10px] md:text-xs font-black text-brand-heading uppercase tracking-widest">Recommended</p>
                    <p className="text-xs md:text-sm font-bold text-brand-slate">{activity.bestTimeToVisit}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 md:mb-6">Local Flavors</h3>
                <div className="space-y-2 md:space-y-3">
                  {activity.nearbyFood.map((food, idx) => (
                    <div key={idx} className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-dark rounded-lg flex items-center justify-center text-brand-primary">
                          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                        <span className="text-xs md:text-sm font-black text-brand-heading">{food.name}</span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-brand-primary">⭐ {food.rating}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 md:mb-6">Map Location</h3>
                <div className="h-[150px] md:h-[200px] rounded-2xl md:rounded-3xl overflow-hidden border border-brand-primary/10">
                  <MapComponent activities={[activity]} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
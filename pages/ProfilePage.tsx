import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, MapPin, Globe, BookOpen, Save, Plus, X, Camera, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ViewType, User } from '../App';

interface ProfilePageProps {
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
  user: User | null;
  updateUser?: (updates: Partial<User>) => void;
}

interface ProfileData {
  bio: string;
  location: string;
  website: string;
  interests: string[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigateTo, user, updateUser }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    location: '',
    website: '',
    interests: []
  });
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [newInterest, setNewInterest] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      navigateTo('login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, `users/${auth.currentUser?.uid}/profile`, 'main');
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfileData(profileSnap.data() as ProfileData);
        }

        // Fetch real trip count
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, where('userId', '==', auth.currentUser?.uid));
        const snapshot = await getCountFromServer(q);
        setTripCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigateTo]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      // 1. Update Firebase Auth Profile (Display Name)
      if (displayName !== user?.name) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
        if (updateUser) {
          updateUser({ name: displayName });
        }
      }

      // 2. Update Firestore Profile Details
      const profileRef = doc(db, `users/${auth.currentUser.uid}/profile`, 'main');
      await setDoc(profileRef, profileData, { merge: true });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}/profile/main`);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(i => i !== interest)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep">
        <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar / Avatar Section */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-brand-dark rounded-[2.5rem] p-8 border border-brand-primary/10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-brand-primary/20 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="relative inline-block mb-6">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-brand-primary shadow-2xl" alt="Profile" />
                  ) : (
                    <div className="w-32 h-32 bg-brand-primary rounded-full flex items-center justify-center text-white font-black text-4xl border-4 border-brand-primary shadow-2xl">
                      {user?.name[0]}
                    </div>
                  )}
                  <button className="absolute bottom-1 right-1 bg-brand-primary p-2 rounded-full text-white shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <h2 className="text-2xl font-black text-brand-heading mb-1">{user?.name}</h2>
                <p className="text-brand-slate text-sm font-medium mb-4">{user?.email}</p>
                
                {user?.email === 'iritvik3@gmail.com' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Administrator
                  </div>
                )}
              </div>
            </div>

            <div className="bg-brand-dark rounded-[2.5rem] p-8 border border-brand-primary/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-slate/60 mb-6">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-slate">Trips Planned</span>
                  <span className="text-sm font-black text-brand-primary">{tripCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-slate">Countries Visited</span>
                  <span className="text-sm font-black text-brand-primary">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-slate">Member Since</span>
                  <span className="text-sm font-black text-brand-primary">March 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Section */}
          <div className="w-full md:w-2/3 space-y-6">
            <div className="bg-brand-dark rounded-[2.5rem] p-10 border border-brand-primary/10">
              <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl font-black text-brand-heading tracking-tight">Edit Profile</h1>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>

              {message && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Display Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate w-4 h-4" />
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Email (Read Only)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate/40 w-4 h-4" />
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/5 text-brand-slate/40 outline-none font-medium cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Bio</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-4 text-brand-slate w-4 h-4" />
                    <textarea 
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about your travel style..."
                      className="w-full pl-12 pr-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium resize-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate w-4 h-4" />
                      <input 
                        type="text" 
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="e.g. London, UK"
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate w-4 h-4" />
                      <input 
                        type="url" 
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        placeholder="https://yourblog.com"
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium" 
                      />
                    </div>
                  </div>
                </div>

                {/* Interests (Add/Remove Details) */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Travel Interests</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.interests.map((interest) => (
                      <span 
                        key={interest} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-xs font-bold border border-brand-primary/20"
                      >
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="hover:text-brand-heading transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {profileData.interests.length === 0 && (
                      <p className="text-brand-slate/40 text-xs italic py-2">No interests added yet.</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="Add an interest (e.g. Hiking, Foodie)"
                      className="flex-grow px-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all font-medium" 
                    />
                    <button 
                      onClick={addInterest}
                      className="p-4 bg-brand-primary text-white rounded-2xl hover:bg-[#FF9A3C] transition-colors shadow-lg shadow-brand-primary/20"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

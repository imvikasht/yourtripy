import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { ViewType, User } from '../App';

interface LoginPageProps {
  navigateTo: (view: ViewType) => void;
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      onLogin({
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=FACC15&color=020617`
      });
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "Failed to sign in. Please check your credentials.";
      
      if (err.code === 'auth/invalid-credential') {
        message = "Incorrect email or password. If you haven't created an account yet, please sign up.";
      } else if (err.code === 'auth/user-not-found') {
        message = "No account found with this email. Please sign up first.";
      } else if (err.code === 'auth/wrong-password') {
        message = "Incorrect password. Please try again or reset your password.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Too many failed login attempts. Please try again later.";
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-brand-deep transition-colors flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <button 
          onClick={() => navigateTo('home')}
          className="group flex items-center gap-2 text-brand-slate font-bold text-xs mb-8 hover:text-brand-primary transition-colors uppercase tracking-widest outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Return Home
        </button>

        <div className="bg-brand-dark rounded-[2.5rem] p-10 shadow-sm border border-brand-primary/10">
          <div className="flex justify-center mb-8">
            <div className="bg-brand-primary p-3 rounded-2xl shadow-xl shadow-brand-primary/20">
              <Sparkles className="text-white w-6 h-6 fill-current" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-brand-heading text-center mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-brand-slate text-sm text-center mb-8 font-medium">Continue your journey with YourTripy AI.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <Sparkles className="w-4 h-4 shrink-0 fill-current" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="explorer@yourtripy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all placeholder:text-brand-slate/20 font-medium" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-slate/60">Password</label>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-brand-heading transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-brand-deep border border-brand-primary/10 text-brand-heading focus:border-brand-primary outline-none transition-all placeholder:text-brand-slate/20 font-medium" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-slate hover:text-brand-heading transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-brand-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-brand-primary/10 hover:bg-[#FF9A3C] transform hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-brand-primary/10 text-center">
            <p className="text-brand-slate text-sm font-medium">
              New explorer? <button onClick={() => navigateTo('signup')} className="text-brand-primary font-black hover:underline underline-offset-4">Create Account</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
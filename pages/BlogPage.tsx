import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Loader2, FileText, ArrowLeft, Clock, User, Calendar, Edit3, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { onAuthStateChanged } from 'firebase/auth';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: any;
  category: string;
  image: string;
  excerpt: string;
  author: string;
  authorId?: string;
}

const MOCK_POSTS: BlogPost[] = [
  {
    id: 'mock-1',
    title: 'The Future of AI in Travel Planning',
    content: `
# The Future of AI in Travel Planning

Travel planning has always been a complex puzzle. From finding the best flights to discovering hidden gems in a new city, the process can be overwhelming. But with the rise of Artificial Intelligence, specifically Large Language Models like Gemini, the game is changing.

## Personalized Itineraries
Imagine a co-pilot that knows your preferences better than you do. AI can analyze thousands of data points to suggest a route that perfectly balances your love for history with your need for relaxation.

## Real-time Adjustments
The true power of AI isn't just in the planning; it's in the execution. If a museum is unexpectedly closed, your AI co-pilot can instantly suggest an alternative that fits your schedule and location.

## Conclusion
We are just at the beginning of this journey. At YourTripy, we're committed to building the most logical and intuitive travel assistant for the modern explorer.
    `,
    date: new Date(),
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Discover how AI is revolutionizing the way we explore the world.',
    author: 'YourTripy Team'
  },
  {
    id: 'mock-2',
    title: '10 Hidden Gems in Kyoto You Must Visit',
    content: `
# 10 Hidden Gems in Kyoto You Must Visit

Kyoto is famous for its grand temples and bustling markets, but there's a quieter side to the city that many tourists miss.

## 1. Otagi Nenbutsu-ji
A temple with 1,200 unique stone figures, each with a different expression. It's a bit off the beaten path but absolutely worth the trip.

## 2. Gio-ji Temple
Known as the "Moss Temple," this small, serene spot is perfect for quiet reflection away from the crowds.

## 3. Pontocho Alley at Dawn
While famous for its nightlife, walking through Pontocho at sunrise offers a completely different, peaceful perspective of old Kyoto.
    `,
    date: new Date(),
    category: 'Destination',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Escape the crowds and discover the secret side of Japan\'s ancient capital.',
    author: 'Kyoto Explorer'
  }
];

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Travel',
    image: '',
    content: ''
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setCurrentUser(user));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'blogs'), 
          where('published', '==', true),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        
        if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
        } else {
          setPosts(MOCK_POSTS);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts(MOCK_POSTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isComposing]); // Refetch when returning from composing

  const handlePublish = async () => {
    if (!currentUser) return alert("You must be logged in to publish.");
    if (!newPost.title || !newPost.content || !newPost.image) return alert("Please fill all required fields.");
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'blogs'), {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        image: newPost.image,
        excerpt: newPost.content.substring(0, 150) + '...',
        author: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous Explorer',
        authorId: currentUser.uid,
        date: serverTimestamp(),
        published: true
      });
      setIsComposing(false);
      setNewPost({ title: '', category: 'Travel', image: '', content: '' });
    } catch (err: any) {
      alert("Failed to publish: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (selectedPost) {
    return (
      <div className="pt-24 min-h-screen bg-brand-deep animate-in fade-in duration-500">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <button 
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-brand-slate hover:text-brand-primary font-black uppercase tracking-widest text-[10px] mb-12 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
          </button>

          <div className="space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {selectedPost.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-brand-heading tracking-tighter leading-tight">
                {selectedPost.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-brand-slate text-[10px] font-black uppercase tracking-widest border-b border-brand-primary/10 pb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-primary" /> {selectedPost.author || 'YourTripy Team'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-primary" /> {formatDate(selectedPost.date)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-primary" /> 5 min read
                </div>
              </div>
            </div>

            <div className="w-full h-[300px] md:h-[500px] rounded-[3rem] overflow-hidden border-4 border-brand-dark shadow-2xl">
              <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
            </div>

            <div className="prose prose-invert max-w-none prose-headings:text-brand-heading prose-p:text-brand-slate prose-p:text-lg prose-p:leading-relaxed prose-strong:text-brand-primary prose-a:text-brand-primary">
              <div className="markdown-body">
                <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-brand-deep">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 max-w-7xl mx-auto gap-4">
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-brand-heading tracking-tighter">Travel Journal</h1>
            <p className="text-xl text-brand-slate font-medium">Stories, tips, and insights from the co-pilot community.</p>
          </div>
          <button 
            onClick={() => {
              if(!currentUser) {
                alert("Please log in from the main menu to write a story!");
                return;
              }
              setIsComposing(true);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all outline-none whitespace-nowrap"
          >
            <Edit3 className="w-5 h-5" /> Write a Story
          </button>
        </div>

        {isComposing ? (
          <div className="max-w-4xl mx-auto bg-brand-dark p-8 md:p-12 rounded-[3rem] border border-brand-primary/10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-brand-heading">Compose Story</h2>
              <button onClick={() => setIsComposing(false)} className="text-brand-slate hover:text-white transition-colors font-bold text-sm">
                Cancel
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate mb-2">Title</label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full bg-brand-deep rounded-2xl border border-brand-primary/10 p-4 text-brand-heading outline-none focus:border-brand-primary/50 text-xl font-bold transition-all"
                  placeholder="The Future of Travel..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate mb-2">Category</label>
                  <select 
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full bg-brand-deep rounded-2xl border border-brand-primary/10 p-4 text-brand-heading outline-none focus:border-brand-primary/50 font-medium transition-all"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Technology">Technology</option>
                    <option value="Destination">Destination</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Tips">Tips & Hacks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate mb-2">Cover Image URL</label>
                  <input 
                    type="text" 
                    value={newPost.image}
                    onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                    className="w-full bg-brand-deep rounded-2xl border border-brand-primary/10 p-4 text-brand-heading outline-none focus:border-brand-primary/50 font-medium transition-all"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate mb-2 flex justify-between">
                  <span>Content (Markdown)</span>
                  <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-brand-primary hover:underline">Formatting Guide</a>
                </label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full bg-brand-deep rounded-2xl border border-brand-primary/10 p-4 text-brand-heading outline-none focus:border-brand-primary/50 h-80 font-mono text-sm resize-y leading-relaxed"
                  placeholder="# My Amazing Trip&#10;&#10;Let me tell you about..."
                />
              </div>

              <button 
                onClick={handlePublish}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-6 bg-brand-primary text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#FF9A3C] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-sm"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSubmitting ? 'Publishing...' : 'Publish Story'}
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-brand-slate space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
            <p className="font-black uppercase tracking-widest text-[10px]">Loading stories...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center max-w-7xl mx-auto">
            <FileText className="w-16 h-16 text-brand-slate/20 mx-auto mb-6" />
            <p className="text-xl font-black text-brand-heading">The journal is empty</p>
            <p className="text-brand-slate font-medium mt-2">Check back soon for new travel stories.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="bg-brand-dark rounded-[3rem] overflow-hidden border border-brand-primary/10 hover:border-brand-primary/20 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="h-64 overflow-hidden relative">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">{post.category}</span>
                  </div>
                </div>
                <div className="p-10 text-left">
                  <h3 className="text-2xl font-black text-brand-heading mb-6 group-hover:text-brand-primary transition-colors leading-tight tracking-tight line-clamp-2">{post.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-brand-slate text-[10px] font-black uppercase tracking-[0.2em]">{formatDate(post.date)}</p>
                    <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Read More →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
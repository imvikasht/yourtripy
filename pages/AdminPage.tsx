import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, 
  LayoutDashboard, FileText, Settings, 
  LogOut, ShieldCheck, Loader2, Image as ImageIcon
} from 'lucide-react';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, 
  query, orderBy, Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ViewType, User } from '../App';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;
  author: string;
  date: any;
  published: boolean;
}

interface AdminPageProps {
  navigateTo: (view: ViewType, query?: string, tripId?: string | null) => void;
  user: User | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ navigateTo, user }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blogs' | 'settings'>('blogs');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.email === 'iritvik3@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => navigateTo('home'), 3000);
      return () => clearTimeout(timer);
    }
    fetchBlogs();
  }, [isAdmin]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedBlogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setBlogs(fetchedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!editingBlog?.title || !editingBlog?.content || !editingBlog?.image || !editingBlog?.category) {
      setMessage({ type: 'error', text: 'Please fill in all required fields (Title, Content, Category, and Image URL).' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    try {
      const { id, ...dataToSave } = editingBlog;
      const blogData = {
        ...dataToSave,
        date: editingBlog.date || Timestamp.now(),
        published: editingBlog.published ?? false,
        author: user?.name || 'Admin'
      };

      if (id) {
        const blogRef = doc(db, 'blogs', id);
        await updateDoc(blogRef, blogData);
        setMessage({ type: 'success', text: 'Blog post updated successfully!' });
      } else {
        await addDoc(collection(db, 'blogs'), blogData);
        setMessage({ type: 'success', text: 'Blog post created successfully!' });
      }
      
      setTimeout(() => {
        setEditingBlog(null);
        setMessage(null);
        fetchBlogs();
      }, 1500);
    } catch (error) {
      console.error("Error saving blog:", error);
      handleFirestoreError(error, OperationType.WRITE, editingBlog.id ? `blogs/${editingBlog.id}` : 'blogs');
      setMessage({ type: 'error', text: 'Failed to save blog post. Please check your permissions.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteDoc(doc(db, 'blogs', id));
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-deep p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-brand-heading tracking-tight">Access Denied</h1>
          <p className="text-brand-slate font-medium">You do not have administrative privileges to access this section. Redirecting you to home...</p>
          <button 
            onClick={() => navigateTo('home')}
            className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            Go Home Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-deep flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-brand-dark border-r border-brand-primary/10 p-8 flex flex-col">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-brand-heading leading-none">Admin</h2>
            <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mt-1">Control Center</p>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-brand-slate hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'blogs' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-brand-slate hover:bg-white/5'}`}
          >
            <FileText className="w-5 h-5" /> Blogs
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-brand-slate hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>

        <button 
          onClick={() => navigateTo('home')}
          className="mt-auto flex items-center gap-4 px-6 py-4 text-brand-slate font-bold text-sm hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Exit Admin
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        {activeTab === 'blogs' && (
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-heading tracking-tighter">Manage Blogs</h1>
                <p className="text-brand-slate font-medium mt-2">Create, edit, and publish travel stories.</p>
              </div>
              <button 
                onClick={() => setEditingBlog({ title: '', content: '', excerpt: '', category: 'Destination', image: '', published: false })}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF9A3C] transition-all shadow-lg shadow-brand-primary/20"
              >
                <Plus className="w-5 h-5" /> New Post
              </button>
            </div>

            {editingBlog ? (
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-brand-primary/10 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-brand-heading">{editingBlog.id ? 'Edit Post' : 'Create New Post'}</h2>
                  <button onClick={() => setEditingBlog(null)} className="p-3 bg-brand-dark rounded-xl text-brand-slate hover:text-brand-primary transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {message && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Post Title</label>
                      <input 
                        type="text" 
                        value={editingBlog.title}
                        onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                        className="w-full px-6 py-4 bg-brand-dark rounded-2xl border border-brand-primary/5 focus:border-brand-primary/30 outline-none font-bold text-brand-heading transition-all"
                        placeholder="Enter catchy title..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Category</label>
                      <select 
                        value={editingBlog.category}
                        onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                        className="w-full px-6 py-4 bg-brand-dark rounded-2xl border border-brand-primary/5 focus:border-brand-primary/30 outline-none font-bold text-brand-heading transition-all"
                      >
                        <option>Destination</option>
                        <option>Technology</option>
                        <option>Travel Tips</option>
                        <option>Community</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Excerpt</label>
                      <textarea 
                        value={editingBlog.excerpt}
                        onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                        className="w-full px-6 py-4 bg-brand-dark rounded-2xl border border-brand-primary/5 focus:border-brand-primary/30 outline-none font-bold text-brand-heading transition-all h-24 resize-none"
                        placeholder="Short summary for the card..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Cover Image URL</label>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={editingBlog.image}
                          onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                          className="flex-grow px-6 py-4 bg-brand-dark rounded-2xl border border-brand-primary/5 focus:border-brand-primary/30 outline-none font-bold text-brand-heading transition-all"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <div className="w-14 h-14 bg-brand-dark rounded-2xl flex items-center justify-center overflow-hidden border border-brand-primary/10">
                          {editingBlog.image ? <img src={editingBlog.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-brand-slate/30" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-brand-dark rounded-2xl border border-brand-primary/5">
                      <input 
                        type="checkbox" 
                        id="published"
                        checked={editingBlog.published}
                        onChange={(e) => setEditingBlog({ ...editingBlog, published: e.target.checked })}
                        className="w-6 h-6 accent-brand-primary rounded-lg"
                      />
                      <label htmlFor="published" className="font-bold text-brand-heading cursor-pointer">Publish this post immediately</label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Content (Markdown supported)</label>
                  <textarea 
                    value={editingBlog.content}
                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                    className="w-full px-8 py-6 bg-brand-dark rounded-3xl border border-brand-primary/5 focus:border-brand-primary/30 outline-none font-medium text-brand-heading transition-all h-96 resize-none leading-relaxed"
                    placeholder="Write your story here..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button 
                    onClick={() => setEditingBlog(null)}
                    className="px-8 py-4 bg-brand-dark text-brand-slate rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveBlog}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-10 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF9A3C] transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Post
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-brand-slate space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                    <p className="font-black uppercase tracking-widest text-[10px]">Loading your stories...</p>
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-brand-primary/20">
                    <FileText className="w-16 h-16 text-brand-slate/20 mx-auto mb-6" />
                    <p className="text-xl font-black text-brand-heading">No blog posts yet</p>
                    <p className="text-brand-slate font-medium mt-2">Start sharing your travel experiences with the world.</p>
                  </div>
                ) : (
                  blogs.map(blog => (
                    <div key={blog.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-brand-primary/5 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-brand-primary/20 transition-all">
                      <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                        <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-widest rounded-full">{blog.category}</span>
                          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${blog.published ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-brand-heading leading-tight">{blog.title}</h3>
                        <p className="text-brand-slate text-xs line-clamp-1 font-medium">{blog.excerpt}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          onClick={() => setEditingBlog(blog)}
                          className="p-4 bg-brand-dark rounded-2xl text-brand-slate hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-4 bg-brand-dark rounded-2xl text-brand-slate hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-10">
            <h1 className="text-4xl md:text-5xl font-black text-brand-heading tracking-tighter">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-brand-primary/5 shadow-sm">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Total Blogs</p>
                <p className="text-5xl font-black text-brand-heading">{blogs.length}</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-brand-primary/5 shadow-sm">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Published</p>
                <p className="text-5xl font-black text-brand-heading">{blogs.filter(b => b.published).length}</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border border-brand-primary/5 shadow-sm">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Drafts</p>
                <p className="text-5xl font-black text-brand-heading">{blogs.filter(b => !b.published).length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-6xl mx-auto space-y-10">
            <h1 className="text-4xl md:text-5xl font-black text-brand-heading tracking-tighter">Settings</h1>
            <div className="bg-white p-10 rounded-[3rem] border border-brand-primary/5 shadow-sm max-w-2xl">
              <p className="text-brand-slate font-medium">Site-wide settings and administrative controls will appear here.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;

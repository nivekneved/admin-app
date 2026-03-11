import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Tag,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react';
import Swal from 'sweetalert2';
import { showAlert } from '../utils/swal';

const News = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('editorial_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Swal.fire('Error', 'Failed to load news posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This article will be permanently removed!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('editorial_posts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setPosts(posts.filter(p => p.id !== id));
        showAlert('Deleted!', 'Article has been removed.', 'success');
      } catch (error) {
        console.error('Error deleting post:', error);
        Swal.fire('Error', 'Failed to delete article', 'error');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updates = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (newStatus === 'published') {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('editorial_posts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.map(p => p.id === id ? { ...p, ...updates } : p));
      showAlert('Success', `Article marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={12}/> Published</span>;
      case 'draft':
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Clock size={12}/> Draft</span>;
      case 'archived':
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Archive size={12}/> Archived</span>;
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Travel News & Insights</h1>
          <p className="text-slate-500">Create and manage your travel blog posts and news articles</p>
        </div>
        <button
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-red-600/20 w-fit"
          onClick={() => showAlert('Coming Soon', 'Article editor implementation is planned.', 'info')}
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters and Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-red-600/10 transition-all text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['all', 'published', 'draft', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  filter === f 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
              Loading articles...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-12 text-center italic text-slate-400">
              No articles found
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 group-hover:text-red-600 transition-colors">{post.title}</span>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Tag size={12}/> {post.tags?.join(', ') || 'No tags'}</span>
                          <span className="flex items-center gap-1"><ImageIcon size={12}/> {post.featured_image ? 'Has Image' : 'No Image'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-medium">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-6 text-slate-500 text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Created</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(post.id, 'published')}
                            title="Publish"
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        )}
                        {post.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(post.id, 'archived')}
                            title="Archive"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Archive size={18} />
                          </button>
                        )}
                        <button
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          onClick={() => showAlert('Coming Soon', 'Editing is not yet implemented.', 'info')}
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;

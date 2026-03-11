import React, { useState, useEffect, useMemo } from 'react';
import {
    Star, Search, Check, X, Trash2,
    RefreshCw, Loader2, MessageSquare,
    User, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { showAlert, showConfirm } from '../utils/swal';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showAlert('Error', 'Failed to load reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateReviewStatus = async (id, status) => {
        setActionLoading(id);
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
            showAlert('Success', `Review ${status} successfully`, 'success');
        } catch (error) {
            console.error('Error updating review:', error);
            showAlert('Error', 'Failed to update review status', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const deleteReview = async (id) => {
        const result = await showConfirm(
            'Delete Review?',
            'This action cannot be undone. Are you sure?'
        );

        if (!result.isConfirmed) return;

        setActionLoading(id);
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            setReviews(prev => prev.filter(r => r.id !== id));
            showAlert('Deleted', 'Review removed successfully', 'success');
        } catch (error) {
            console.error('Error deleting review:', error);
            showAlert('Error', 'Failed to delete review', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const processedReviews = useMemo(() => {
        return reviews.filter(review => {
            const matchesSearch = 
                review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
    }), [reviews]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Review Moderation</h1>
                    <p className="text-gray-400 text-sm font-medium">Manage and curate customer experiences and social proof</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={fetchReviews}
                        variant="outline"
                        className="text-gray-500 border-gray-200 flex items-center gap-2"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reviews</p>
                            <p className="text-xl font-black text-gray-900">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</p>
                            <p className="text-xl font-black text-gray-900">{stats.pending}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <Check size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved</p>
                            <p className="text-xl font-black text-gray-900">{stats.approved}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-gray-300 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
                <CardHeader className="border-b border-gray-50 pb-4 px-8 pt-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 text-gray-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search by customer or comment..."
                                className="pl-9 pr-4 py-2.5 w-full border border-gray-300 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {['all', 'pending', 'approved', 'rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                                        statusFilter === status 
                                        ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-red-100' 
                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center">
                                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Querying Cloud Registry...</p>
                            </div>
                        ) : processedReviews.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                <MessageSquare size={48} className="text-gray-200" />
                                <p className="text-gray-400 font-bold">No matching reviews found</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating & Comment</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {processedReviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-black text-gray-900 leading-tight truncate">{review.customer_name}</h3>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">Verified User</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="max-w-xs">
                                                    <div className="flex items-center gap-0.5 mb-1.5">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star 
                                                                key={star} 
                                                                size={12} 
                                                                className={star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
                                                        &quot;{review.comment}&quot;
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700 capitalize">{review.service_type}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">#{review.service_id?.substring(0, 8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    <span className="text-xs font-bold">{new Date(review.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 w-fit ${
                                                    review.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    review.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                        review.status === 'approved' ? 'bg-green-500' :
                                                        review.status === 'pending' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`} />
                                                    {review.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {review.status !== 'approved' && (
                                                        <button
                                                            onClick={() => updateReviewStatus(review.id, 'approved')}
                                                            disabled={actionLoading === review.id}
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                            title="Approve Review"
                                                        >
                                                            {actionLoading === review.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                        </button>
                                                    )}
                                                    {review.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                                                            disabled={actionLoading === review.id}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Reject Review"
                                                        >
                                                            {actionLoading === review.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteReview(review.id)}
                                                        disabled={actionLoading === review.id}
                                                        className="p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Permanently"
                                                    >
                                                        {actionLoading === review.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Reviews;

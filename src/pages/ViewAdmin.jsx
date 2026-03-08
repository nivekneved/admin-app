import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { ArrowLeft, User, Mail, Shield, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ViewAdmin = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setUser(data);
            } catch (error) {
                console.error('Error fetching admin:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="animate-spin text-brand-red w-8 h-8" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center text-gray-500">
                Administrator not found
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-6">
                    <Link
                        to="/users"
                        className="p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all text-gray-400 hover:text-brand-red shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Details</h1>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Identity Information</p>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
                    <div className="h-2 bg-gradient-to-r from-brand-red to-red-600 w-full"></div>
                    <CardHeader className="pt-10 px-10">
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 h-20 w-20">
                                <img
                                    className="h-20 w-20 rounded-full bg-gray-100 border-4 border-white shadow-lg"
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'U')}&background=random&size=128`}
                                    alt={user.username}
                                />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">{user.username}</CardTitle>
                                <div className="flex items-center mt-2 gap-2 text-sm text-gray-500 font-medium">
                                    <Shield size={16} className="text-brand-red" />
                                    <span className="uppercase tracking-wider font-bold">{user.role}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <User size={14} /> Username
                                </label>
                                <div className="text-gray-900 font-bold text-lg">{user.username}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <div className="text-gray-900 font-medium">{user.email}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Shield size={14} /> Role
                                </label>
                                <div className="text-gray-900 font-medium capitalize">{user.role}</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Calendar size={14} /> Member Since
                                </label>
                                <div className="text-gray-900 font-medium">
                                    {new Date(user.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ViewAdmin;

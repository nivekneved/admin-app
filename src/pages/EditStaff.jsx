import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Globe, Linkedin, Loader2, ArrowLeft,
    Shield, Key, Save, Camera, Info, CheckCircle, XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';

const EditStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const roles = [
        { value: 'admin', label: 'Universal Root Administrator' },
        { value: 'manager', label: 'Operations Manager' },
        { value: 'staff', label: 'Standard Staff' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'editor', label: 'Content Manager' },
        { value: 'sales', label: 'Sales Consultant' },
        { value: 'accountant', label: 'Accounts Representative' }
    ];

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'staff',
        name: '',
        bio: '',
        photo_url: '',
        linkedin_url: '',
        is_active: true,
        display_order: 0
    });

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    password: '', // Don't show password
                    role: data.role || 'staff',
                    name: data.name || data.username || '',
                    bio: data.bio || '',
                    photo_url: data.photo_url || '',
                    linkedin_url: data.linkedin_url || '',
                    is_active: data.is_active ?? true,
                    display_order: data.display_order || 0
                });
            }
        } catch (error) {
            console.error('Error fetching staff member:', error);
            showAlert('Error', 'Failed to load staff identity', 'error');
            navigate('/team');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData, updated_at: new Date().toISOString() };
            // Remove password from update if it's empty
            if (!payload.password) delete payload.password;

            const { error } = await supabase
                .from('admins')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            showAlert('Success', 'Staff identity has been elegantly updated', 'success');
            navigate('/team');
        } catch (error) {
            console.error('Error updating staff:', error);
            showAlert('Error', error.message || 'Failed to update identity', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Synchronizing Identity Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header & Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/team')}
                    className="group flex items-center gap-3 text-gray-400 hover:text-brand-red transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <div className="p-2 border border-gray-100 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back to Team Portal
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Identity</h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Employee UID: <span className="text-brand-red">{id.slice(0, 8)}...</span></p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Hero Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-red-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative bg-white border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                        <div className="h-32 bg-brand-charcoal relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-transparent"></div>
                        </div>
                        <CardContent className="px-10 pb-10 relative">
                            <div className="flex flex-col md:flex-row items-end gap-8 -mt-16">
                                {/* Photo Preview Section */}
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-3xl border-[6px] border-white shadow-2xl bg-gray-100 overflow-hidden group/photo">
                                        {formData.photo_url ? (
                                            <img
                                                src={formData.photo_url}
                                                alt={formData.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'U')}&size=200&background=F3F4F6&color=9CA3AF`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                <Camera size={40} />
                                                <span className="text-[8px] font-black uppercase mt-2">No Photo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                                            <Camera size={24} />
                                        </div>
                                    </div>
                                    {formData.is_active ? (
                                        <div className="absolute bottom-2 -right-2 bg-green-500 border-4 border-white text-white p-1.5 rounded-2xl shadow-lg" title="Access Active">
                                            <CheckCircle size={14} />
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-2 -right-2 bg-gray-400 border-4 border-white text-white p-1.5 rounded-2xl shadow-lg" title="Access Revoked">
                                            <XCircle size={14} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{formData.name || formData.username}</h2>
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${formData.role === 'admin' ? 'bg-red-50 text-brand-red border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                            }`}>
                                            {formData.role}
                                        </span>
                                    </div>
                                    <p className="text-brand-red font-bold text-sm italic">@{formData.username}</p>
                                </div>

                                <div className="flex gap-3 pb-2">
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-brand-red text-white px-8 py-3 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: System Access */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4">
                                <Shield size={16} className="text-brand-red" /> System Access
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">System Username</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Work Email</label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex justify-between">
                                        Update Password
                                        <span className="text-[8px] italic normal-case font-medium text-gray-300">Leave blank to keep current</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        <Key size={16} className="absolute right-4 top-3.5 text-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-brand-charcoal text-white p-8 rounded-3xl shadow-xl shadow-gray-200 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-brand-red uppercase tracking-[0.2em] mb-4">
                                Authority & Order
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Access Level</label>
                                    <select
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-white"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(r => <option key={r.value} value={r.value} className="bg-brand-charcoal">{r.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Sort Complexity</label>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <input
                                            type="number"
                                            className="w-20 px-3 py-2 bg-transparent border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-center font-black text-sm"
                                            value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                        />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">Display Order Index</p>
                                            <p className="text-[8px] text-gray-500 italic">Determines sorting in portals</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.is_active ? 'bg-brand-red' : 'bg-white/10'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white transition-all shadow-sm ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">
                                            {formData.is_active ? 'Identity Active' : 'Access Revoked'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Panel: Public Profile */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4">
                                <Globe size={16} className="text-brand-red" /> Public Persona
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Public Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-lg"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Leena Jhugroo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Profile Image URL</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-6 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium"
                                            value={formData.photo_url}
                                            onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                        <Camera size={16} className="absolute right-4 top-3.5 text-gray-300" />
                                    </div>
                                    <p className="text-[8px] text-gray-400 mt-2 ml-1 flex items-center gap-1 uppercase font-bold tracking-tighter">
                                        <Info size={10} /> Directly affects the preview above
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Professional LinkedIn</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-6 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium"
                                            value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                            placeholder="linkedin.com/in/..."
                                        />
                                        <Linkedin size={16} className="absolute right-4 top-3.5 text-gray-300" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Public Narrative / Bio</label>
                                    <textarea
                                        rows={6}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none leading-relaxed"
                                        value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Brief professional summary for the agency website..."
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex justify-end gap-4 p-8 bg-gray-50/50 rounded-3xl border border-gray-100 border-dashed">
                    <button
                        type="button"
                        onClick={() => navigate('/team')}
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                    >
                        Abandon Changes
                    </button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-brand-red text-white px-12 py-4 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        Finalize & Update Identity
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditStaff;

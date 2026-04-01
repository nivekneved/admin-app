import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Globe, Linkedin, Loader2, ArrowLeft,
    Shield, Key, Save, Info, CheckCircle, XCircle, Upload, User, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';

const BUCKET = 'bucket';
const FOLDER = 'staff';

const ManageStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [pageLoading, setPageLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const isEdit = !!id;

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
        show_on_front_page: true,
        display_order: 0
    });

    useEffect(() => {
        if (isEdit) {
            fetchMember();
        }
    }, [id]);

    const fetchMember = async () => {
        setPageLoading(true);
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('id, username, email, role, name, bio, photo_url, linkedin_url, is_active, show_on_front_page, display_order')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    password: '',
                    role: data.role || 'staff',
                    name: data.name || data.username || '',
                    bio: data.bio || '',
                    photo_url: data.photo_url || '',
                    linkedin_url: data.linkedin_url || '',
                    is_active: data.is_active ?? true,
                    show_on_front_page: data.show_on_front_page ?? true,
                    display_order: data.display_order || 0
                });
            }
        } catch (error) {
            console.error('Error fetching staff member:', error);
            showAlert('Error', 'Failed to load staff identity', 'error');
            navigate('/team');
        } finally {
            setPageLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
            const filePath = `${FOLDER}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, photo_url: data.publicUrl }));
            showAlert('Success', 'Profile photo updated', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('Upload Failed', error.message || 'Error uploading photo', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData, updated_at: new Date().toISOString() };
            if (!payload.password && isEdit) delete payload.password;

            if (isEdit) {
                const { error } = await supabase
                    .from('admins')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
                showAlert('Success', 'Staff identity has been updated', 'success');
            } else {
                if (!payload.password) throw new Error('Password is required for new accounts');

                const { error } = await supabase
                    .from('admins')
                    .insert([{ ...payload, created_at: new Date().toISOString() }]);
                if (error) throw error;
                showAlert('Success', 'New staff member has been provisioned', 'success');
            }
            navigate('/team');
        } catch (error) {
            console.error('Error saving staff:', error);
            showAlert('Error', error.message || 'Failed to save identity', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Synchronizing Identity Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/team')}
                    className="group flex items-center gap-3 text-gray-400 hover:text-brand-red transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <div className="p-2 border border-slate-300 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back to Team Portal
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {isEdit ? 'Edit Identity' : 'Provision New Staff'}
                    </h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        {isEdit ? `Employee UID: ${id.slice(0, 8)}...` : 'Global Identity Registry'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-red-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <Card className="relative bg-white border border-slate-300 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                        <div className="h-32 bg-brand-charcoal relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-transparent"></div>
                        </div>
                        <CardContent className="px-10 pb-10 relative">
                            <div className="flex flex-col md:flex-row items-end gap-8 -mt-16">
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-3xl border-[6px] border-white shadow-2xl bg-gray-100 overflow-hidden group/photo relative">
                                        {formData.photo_url ? (
                                            <img
                                                src={formData.photo_url}
                                                alt={formData.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'U')}&size=200&background=F3F4F6&color=9CA3AF`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                <User size={48} />
                                                <span className="text-[8px] font-black uppercase mt-2">No Photo</span>
                                            </div>
                                        )}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                                        >
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-[8px] font-black uppercase">Change Photo</span>
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <Loader2 size={24} className="animate-spin text-brand-red" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                    <div className={`absolute bottom-2 -right-2 p-1.5 rounded-2xl shadow-lg border-4 border-white ${formData.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                                        {formData.is_active ? <CheckCircle size={14} className="text-white" /> : <XCircle size={14} className="text-white" />}
                                    </div>
                                </div>

                                <div className="flex-1 pb-2">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{formData.name || "Untitled Identity"}</h2>
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${formData.role === 'admin' ? 'bg-red-50 text-brand-red border-red-100' : 'bg-gray-50 text-gray-500 border-slate-300'}`}>
                                            {formData.role}
                                        </span>
                                    </div>
                                    <p className="text-brand-red font-bold text-sm italic">@{formData.username || 'unassigned'}</p>
                                </div>

                                <div className="flex gap-3 pb-2">
                                    <Button
                                        type="submit"
                                        disabled={saving || uploading}
                                        className="bg-brand-red text-white px-8 py-3 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-2 font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all outline-none border-none ring-0 focus:ring-0 active:ring-0"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isEdit ? 'Update Identity' : 'Provision Staff'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4">
                                <Shield size={16} className="text-brand-red" /> System Access
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">System Username</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Work Email</label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex justify-between">
                                        Access Password
                                        {isEdit && <span className="text-[8px] italic normal-case font-medium text-gray-300">Leave blank to keep current</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password" required={!isEdit}
                                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-gray-900"
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
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Assigned Domain Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-white"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(r => <option key={r.value} value={r.value} className="bg-brand-charcoal">{r.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Organization Priority Order</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-white"
                                        value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/10 space-y-3">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Privacy & Visibility</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, show_on_front_page: !formData.show_on_front_page })}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${formData.show_on_front_page
                                            ? 'bg-red-500/10 border-red-500/20 text-white'
                                            : 'bg-white/5 border-transparent text-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {formData.show_on_front_page ? <Eye size={16} /> : <EyeOff size={16} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">Show on Front Page</span>
                                        </div>
                                        {formData.show_on_front_page ? <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> : <div className="w-2 h-2 rounded-full bg-gray-700"></div>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${formData.is_active
                                            ? 'bg-green-500/10 border-green-500/20 text-white'
                                            : 'bg-white/5 border-transparent text-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {formData.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">Account Status</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                            {formData.is_active ? 'ACTIVE' : 'REVOKED'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4">
                                <User size={16} className="text-brand-red" /> Professional Narrative
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Legal Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-xl text-gray-900"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">LinkedIn Profile</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-gray-900"
                                                value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                                placeholder="linkedin.com/in/..."
                                            />
                                            <Linkedin size={18} className="absolute left-4 top-4 text-red-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Photo URL (Manual Override)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-gray-900"
                                                value={formData.photo_url} onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                            <Globe size={18} className="absolute left-4 top-4 text-gray-300" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Professional Bio / Mission</label>
                                    <textarea
                                        rows={6}
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none leading-relaxed text-gray-900"
                                        value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="A detailed narrative about the employee's role and contributions..."
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4">
                                <CheckCircle size={16} className="text-brand-red" /> Recent System Activities
                            </h3>
                            <div className="space-y-4">
                                <StaffActivities adminId={id} />
                            </div>
                        </section>

                        <section className="bg-red-50 p-8 rounded-3xl border border-red-100 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-brand-red shadow-sm shrink-0">
                                <Info size={20} />
                            </div>
                            <div className="font-black">
                                <h4 className="text-[10px] text-red-900 uppercase tracking-widest mb-1">Identity Integrity</h4>
                                <p className="text-[10px] text-red-700 leading-relaxed">
                                    Updates to staff identity are published immediately to the portal. Access revocation blocks all system interactions and log-in capabilities.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex justify-end gap-4 p-8 bg-gray-50/50 rounded-3xl border border-slate-300 border-dashed">
                    <button
                        type="button"
                        onClick={() => navigate('/team')}
                        className="px-8 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all font-black"
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        disabled={saving || uploading}
                        className="bg-brand-red text-white px-12 py-4 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all outline-none border-none ring-0 focus:ring-0 active:ring-0"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        {isEdit ? 'Update Staff' : 'Create Staff'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const StaffActivities = ({ adminId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (adminId) fetchActivities();
    }, [adminId]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('editorial_posts')
                .select('id, title, status, created_at')
                .eq('author_id', adminId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error) setActivities(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase"><Loader2 size={12} className="animate-spin" /> Fetching Log...</div>;
    
    if (activities.length === 0) return <div className="text-gray-400 text-[10px] font-black uppercase italic">No documented system activities found for this identity.</div>;

    return (
        <div className="space-y-3">
            {activities.map(act => (
                <div key={act.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-slate-300 border-dashed">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl text-brand-red shadow-sm border border-red-50">
                            <Save size={14} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-900 line-clamp-1">{act.title}</p>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Authored Editorial Post • {new Date(act.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border ${act.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                        {act.status}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default ManageStaff;

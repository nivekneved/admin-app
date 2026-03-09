import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, Search, Edit2, Trash2, Mail, Globe,
    Linkedin, Loader2, LayoutGrid, List, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
    Shield, Key
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

const Team = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;

    const roles = [
        { value: 'admin', label: 'Universal Root Administrator' },
        { value: 'manager', label: 'Operations Manager' },
        { value: 'staff', label: 'Standard Staff' },
        { value: 'receptionist', label: 'Receptionist' },
        { value: 'editor', label: 'Content Manager' },
        { value: 'sales', label: 'Sales Consultant' },
        { value: 'accountant', label: 'Accounts Representative' }
    ];

    // Unified Form state (Admins + Team Members)
    const defaultMember = {
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
    };
    const [formData, setFormData] = useState(defaultMember);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .order('display_order', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            setMembers(data || []);
        } catch (error) {
            console.error('Error fetching staff:', error);
            showAlert('Error', 'Failed to load staff members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = { ...formData, updated_at: new Date().toISOString() };

            if (editingMember) {
                // Remove password from update if it's empty
                if (!payload.password) delete payload.password;

                const { error } = await supabase
                    .from('admins')
                    .update(payload)
                    .eq('id', editingMember.id);
                if (error) throw error;
                showAlert('Updated', 'Staff profile updated successfully', 'success');
            } else {
                // Create Auth User first
                const { error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                            role: formData.role
                        }
                    }
                });

                if (authError) throw authError;

                const { error } = await supabase
                    .from('admins')
                    .insert([payload]);
                if (error) throw error;
                showAlert('Created', 'Staff member provisioned successfully', 'success');
            }
            setShowFormModal(false);
            fetchMembers();
        } catch (error) {
            console.error('Error saving staff member:', error);
            showAlert('Error', error.message || 'Failed to save staff member', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const deleteMember = async (id) => {
        const res = await showConfirm(
            'Revoke Access?',
            'Are you sure you want to remove this staff member and revoke their system access?',
            'Yes, remove'
        );
        if (!res.isConfirmed) return;

        try {
            const { error: delError } = await supabase
                .from('admins')
                .delete()
                .eq('id', id);
            if (delError) throw delError;
            showAlert('Deleted', 'Staff member removed successfully', 'success');
            fetchMembers();
        } catch (err) {
            console.error('Delete error:', err);
            showAlert('Error', 'Failed to remove staff member', 'error');
        }
    };

    const openCreateModal = () => {
        setEditingMember(null);
        setFormData(defaultMember);
        setShowFormModal(true);
    };

    const openEditModal = (member) => {
        navigate(`/team/edit/${member.id}`);
    };

    // Filter & Search
    const processed = useMemo(() => {
        let list = [...members];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(m =>
                (m.name || '').toLowerCase().includes(q) ||
                (m.username || '').toLowerCase().includes(q) ||
                (m.role || '').toLowerCase().includes(q) ||
                (m.email || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [members, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(processed.length / perPage);
    const currentItems = processed.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff & Access Management</h1>
                    <p className="text-gray-400 text-sm font-medium">Unified control for system users and public profiles</p>
                </div>
                <Button onClick={openCreateModal} className="bg-brand-red text-white flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-red-100 hover:scale-105 active:scale-95 transition-all font-bold">
                    <UserPlus size={18} /> Add New Staff
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-white border-b border-gray-50 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, username, role or email..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-red' : 'text-gray-400'}`}
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-red' : 'text-gray-400'}`}
                                >
                                    <LayoutGrid size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="animate-spin text-brand-red mb-3" size={36} />
                            <p className="text-gray-400 font-medium text-sm">Synchronizing staff data...</p>
                        </div>
                    ) : currentItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Users size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">No staff records found</h3>
                            <p className="text-gray-400 text-sm mt-1 max-w-xs">Start by provisioning system access for your team.</p>
                            <Button onClick={openCreateModal} className="mt-6 bg-red-50 text-brand-red hover:bg-red-100 border border-red-100 font-bold">Add First Record</Button>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Access Level</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentItems.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                        {member.photo_url ? (
                                                            <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img
                                                                className="h-10 w-10 rounded-xl bg-gray-100"
                                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.username || 'U')}&background=random`}
                                                                alt={member.username}
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="flex items-center text-sm font-bold text-gray-900 leading-none mb-1">
                                                            {member.name || member.username}
                                                            {member.show_on_front_page && <Globe size={12} className="text-brand-red ml-2" title="Visible on Front Page" />}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-mono">@{member.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-lg border ${member.role === 'admin' ? 'bg-red-50 text-brand-red border-red-100' :
                                                    member.role === 'manager' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {member.email}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${member.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                                    }`}>
                                                    {member.is_active ? 'Access Active' : 'Revoked'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openEditModal(member)} className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" title="Edit Profile">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => deleteMember(member.id)} className="p-2 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all" title="Remove Access">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50/20">
                            {currentItems.map((member) => (
                                <div key={member.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col">
                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                        {member.photo_url ? (
                                            <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <img
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.username || 'U')}&background=random&size=200`}
                                                alt={member.username}
                                            />
                                        )}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(member)} className="bg-white/90 backdrop-blur p-2 rounded-xl text-amber-500 shadow-sm hover:bg-white transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => deleteMember(member.id)} className="p-2 bg-white/90 backdrop-blur rounded-xl text-brand-red shadow-sm hover:bg-white transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${member.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}>
                                                {member.role}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-300">Order #{member.display_order}</span>
                                        </div>
                                        <h3 className="flex items-center text-lg font-black text-gray-900 mb-0.5">
                                            {member.name || member.username}
                                            {member.show_on_front_page && <Globe size={14} className="text-brand-red ml-2" title="Visible on Front Page" />}
                                        </h3>
                                        <p className="text-brand-red text-xs font-bold italic mb-3">@{member.username}</p>

                                        {member.bio && (
                                            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-4 flex-1 font-medium">
                                                {member.bio}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                                            <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-brand-red transition-colors" title={member.email}>
                                                <Mail size={16} />
                                            </a>
                                            {member.linkedin_url && (
                                                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Linkedin size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardContent className="bg-white border-t border-gray-50 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Showing {currentItems.length} of {processed.length} entries
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 border border-gray-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all text-gray-400"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === p ? 'bg-brand-red text-white shadow-lg shadow-red-100' : 'hover:bg-gray-50 text-gray-400'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 border border-gray-100 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all text-gray-400"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Unified Form Modal */}
            <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingMember ? 'Update Staff Identity' : 'Provision New Identity'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Security & Access */}
                        <div className="space-y-5">
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-red uppercase tracking-[0.2em] mb-2">
                                    <Shield size={14} /> Security Credentials
                                </h4>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">System Username *</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="e.g. l.jhugroo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Work Email *</label>
                                    <input
                                        type="email" required
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="name@travellounge.mu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                        {editingMember ? 'New Password (Optional)' : 'Access Password *'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password" required={!editingMember}
                                            className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                        <Key size={16} className="absolute right-4 top-3.5 text-gray-300" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Authority Level</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Access Status & Display Order</label>
                                <div className="flex items-center gap-6 p-4 border border-gray-100 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className="flex items-center gap-3 group"
                                    >
                                        {formData.is_active ? <ToggleRight size={36} className="text-brand-red" /> : <ToggleLeft size={36} className="text-gray-300" />}
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formData.is_active ? 'Granted' : 'Revoked'}</span>
                                    </button>
                                    <div className="flex-1 flex flex-col">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs text-center font-black"
                                            value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                            placeholder="0"
                                        />
                                        <span className="text-[8px] text-gray-400 uppercase text-center mt-1 font-bold">Sort Index</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-brand-charcoal text-white rounded-2xl border border-white/5 space-y-4 shadow-lg">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-red uppercase tracking-[0.2em] mb-2">
                                    <Globe size={14} /> Website Visibility
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, show_on_front_page: !formData.show_on_front_page })}
                                    className="flex items-center justify-between w-full group py-2"
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Show on Front Page</p>
                                        <p className="text-[8px] text-gray-400 font-medium normal-case">Display this staff member in the public &quot;Our Team&quot; section</p>
                                    </div>
                                    {formData.show_on_front_page ? <ToggleRight size={32} className="text-brand-red" /> : <ToggleLeft size={32} className="text-white/20" />}
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Public Profile */}
                        <div className="space-y-5">
                            <div className="p-4 bg-brand-charcoal text-white rounded-2xl space-y-4 border border-white/5 shadow-xl shadow-gray-200">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-red uppercase tracking-[0.2em] mb-2">
                                    <Globe size={14} /> Public Profile Info
                                </h4>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Public Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm text-white"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Leena Jhugroo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Photo URL</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm text-white"
                                        value={formData.photo_url}
                                        onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">LinkedIn Profile</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm text-white"
                                        value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Short Biography</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs text-white resize-none font-medium"
                                        value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Publicly visible staff biography..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 mt-4">
                        <button
                            type="button"
                            onClick={() => setShowFormModal(false)}
                            className="px-6 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={formLoading}
                            className="bg-brand-red text-white px-10 py-3 rounded-2xl shadow-xl shadow-red-100 flex items-center font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {formLoading && <Loader2 className="animate-spin mr-2" size={15} />}
                            {editingMember ? 'Update Staff Identity' : 'Grant System Access'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Team;

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import {
    Loader2, RefreshCw, Plus, Search, Edit2, Trash2, Eye,
    ToggleLeft, ToggleRight, ArrowUp, ArrowDown, X, ChevronDown,
    Layers, Link as LinkIcon, Hash, FileText, Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (str) =>
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const defaultForm = () => ({
    name: '',
    slug: '',
    icon: '',
    description: '',
    image_url: '',
    link: '',
    display_order: '',
    is_active: true,
    show_on_home: false,
});

// ═════════════════════════════════════════════════════════════════════════════
const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    // — Toolbar —
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('All');
    const [sortBy, setSortBy] = useState('display_order:asc');

    // — Modals —
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingCat, setViewingCat] = useState(null);
    const [editingCat, setEditingCat] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    // ─── Fetch ────────────────────────────────────────────────────────────────
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (e) {
            void e;
            showAlert('Error', 'Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ─── Filter + Sort ────────────────────────────────────────────────────────
    const processed = useMemo(() => {
        let list = [...categories];

        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(c =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.slug || '').toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q)
            );
        }

        if (filterActive === 'Active') list = list.filter(c => c.is_active);
        if (filterActive === 'Inactive') list = list.filter(c => !c.is_active);

        const [field, dir] = sortBy.split(':');
        list.sort((a, b) => {
            let va = a[field], vb = b[field];
            if (field === 'display_order') { va = Number(va); vb = Number(vb); }
            if (va < vb) return dir === 'asc' ? -1 : 1;
            if (va > vb) return dir === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [categories, searchTerm, filterActive, sortBy]);

    // ─── CRUD ─────────────────────────────────────────────────────────────────
    const openCreateModal = () => {
        setEditingCat(null);
        setFormData(defaultForm());
        setShowFormModal(true);
    };

    const openEditModal = (cat) => {
        setEditingCat(cat);
        setFormData({
            name: cat.name || '',
            slug: cat.slug || '',
            icon: cat.icon || '',
            description: cat.description || '',
            image_url: cat.image_url || '',
            link: cat.link || '',
            display_order: cat.display_order ?? '',
            is_active: cat.is_active ?? true,
            show_on_home: cat.show_on_home ?? false,
        });
        setShowFormModal(true);
    };

    const openViewModal = (cat) => {
        setViewingCat(cat);
        setShowViewModal(true);
    };

    const closeFormModal = () => { setShowFormModal(false); setEditingCat(null); };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
            // Auto-generate slug from name if creating new
            if (name === 'name' && !editingCat) updated.slug = slugify(value);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || slugify(formData.name),
                icon: formData.icon || null,
                description: formData.description || null,
                image_url: formData.image_url || null,
                link: formData.link || null,
                display_order: formData.display_order !== '' ? parseInt(formData.display_order, 10) : null,
                is_active: formData.is_active,
                show_on_home: formData.show_on_home,
                updated_at: new Date().toISOString(),
            };

            if (editingCat) {
                const { error } = await supabase.from('categories').update(payload).eq('id', editingCat.id);
                if (error) throw error;
                showAlert('Updated', 'Category updated successfully');
            } else {
                const { error } = await supabase.from('categories').insert([payload]);
                if (error) throw error;
                showAlert('Created', 'Category created successfully');
            }

            closeFormModal();
            fetchCategories();
        } catch (e) {
            void e;
            showAlert('Error', 'Failed to save category', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        const result = await showConfirm('Delete Category?', 'This will permanently remove this category.');
        if (!result.isConfirmed) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            showAlert('Deleted', 'Category removed');
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            void e;
            showAlert('Error', 'Failed to delete category', 'error');
        }
    };

    // ─── Toggle active ─────────────────────────────────────────────────────────
    const toggleActive = async (cat) => {
        setTogglingId(cat.id);
        const next = !cat.is_active;
        try {
            const { error } = await supabase
                .from('categories')
                .update({ is_active: next, updated_at: new Date().toISOString() })
                .eq('id', cat.id);
            if (error) throw error;
            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: next } : c));
        } catch (e) {
            void e;
            showAlert('Error', 'Failed to update status', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    // ─── Display order quick adjust ────────────────────────────────────────────
    const shiftOrder = async (cat, direction) => {
        const newOrder = (cat.display_order || 0) + direction;
        try {
            const { error } = await supabase
                .from('categories')
                .update({ display_order: newOrder, updated_at: new Date().toISOString() })
                .eq('id', cat.id);
            if (error) throw error;
            setCategories(prev =>
                prev.map(c => c.id === cat.id ? { ...c, display_order: newOrder } : c)
            );
        } catch (e) {
            void e;
            showAlert('Error', 'Failed to reorder', 'error');
        }
    };

    const hasActiveFilters = searchTerm || filterActive !== 'All';
    const clearFilters = () => { setSearchTerm(''); setFilterActive('All'); setSortBy('display_order:asc'); };

    const selectCls = 'px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none cursor-pointer text-gray-700 hover:border-gray-300 transition-colors';

    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{processed.length} categor{processed.length !== 1 ? 'ies' : 'y'}</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchCategories}
                        disabled={loading}
                        className="flex items-center gap-2 border-gray-200"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        Sync
                    </Button>
                    <Button
                        onClick={openCreateModal}
                        className="bg-brand-red hover:opacity-90 text-white flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Category
                    </Button>
                </div>
            </div>

            <Card>
                {/* Toolbar */}
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex flex-col gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search categories…"
                                className="pl-9 pr-9 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button type="button" onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filters + Sort */}
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <select className={selectCls} value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
                                    <option value="All">All statuses</option>
                                    <option value="Active">Active only</option>
                                    <option value="Inactive">Inactive only</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="display_order:asc">Order ↑</option>
                                    <option value="display_order:desc">Order ↓</option>
                                    <option value="name:asc">Name A → Z</option>
                                    <option value="name:desc">Name Z → A</option>
                                    <option value="created_at:desc">Newest first</option>
                                    <option value="created_at:asc">Oldest first</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
                            </div>

                            {hasActiveFilters && (
                                <button type="button" onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-brand-red bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all">
                                    <X size={13} /> Clear
                                </button>
                            )}

                            <span className="ml-auto text-xs text-gray-400 font-medium">
                                {processed.length} result{processed.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="animate-spin text-brand-red mb-3" size={36} />
                            <p className="text-gray-400 font-medium text-sm">Loading categories…</p>
                        </div>
                    ) : processed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                            <Layers className="text-gray-200 mb-4" size={56} />
                            <h3 className="text-lg font-bold text-gray-800">
                                {hasActiveFilters ? 'No categories match your filters' : 'No categories yet'}
                            </h3>
                            <p className="text-gray-400 text-sm mt-1 max-w-xs">
                                {hasActiveFilters ? 'Try adjusting your search or clearing filters.' : 'Add your first category to get started.'}
                            </p>
                            {hasActiveFilters
                                ? <button type="button" onClick={clearFilters} className="mt-4 px-5 py-2 text-sm font-bold text-brand-red bg-red-50 rounded-xl hover:bg-red-100 transition-all">Clear filters</button>
                                : <Button onClick={openCreateModal} className="mt-5 bg-brand-red text-white">Add First Category</Button>
                            }
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Home</th>
                                        <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {processed.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Name + icon */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
                                                        {cat.icon || <Layers size={14} className="text-gray-300" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                                                        <p className="text-[10px] font-mono text-gray-300">{cat.id?.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Slug */}
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg text-gray-500 font-mono">
                                                    /{cat.slug}
                                                </code>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4 max-w-[220px]">
                                                <p className="text-xs text-gray-500 truncate" title={cat.description}>
                                                    {cat.description || <span className="text-gray-300 italic">No description</span>}
                                                </p>
                                            </td>

                                            {/* Display Order */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button type="button" onClick={() => shiftOrder(cat, -1)}
                                                        className="p-0.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded transition-colors" title="Move up">
                                                        <ArrowUp size={12} />
                                                    </button>
                                                    <span className="text-sm font-bold text-gray-700 w-6 text-center">{cat.display_order ?? '—'}</span>
                                                    <button type="button" onClick={() => shiftOrder(cat, 1)}
                                                        className="p-0.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded transition-colors" title="Move down">
                                                        <ArrowDown size={12} />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Show on home */}
                                            <td className="px-6 py-4 text-center">
                                                {cat.show_on_home
                                                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full"><Home size={9} /> Yes</span>
                                                    : <span className="text-[10px] text-gray-300 font-medium">—</span>
                                                }
                                            </td>

                                            {/* Active toggle */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleActive(cat)}
                                                    disabled={togglingId === cat.id}
                                                    className="flex items-center justify-center mx-auto transition-opacity disabled:opacity-40"
                                                    title={cat.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {togglingId === cat.id
                                                        ? <Loader2 size={18} className="animate-spin text-gray-400" />
                                                        : cat.is_active
                                                            ? <ToggleRight size={22} className="text-green-500" />
                                                            : <ToggleLeft size={22} className="text-gray-300" />
                                                    }
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button type="button"
                                                        onClick={(e) => { e.stopPropagation(); openViewModal(cat); }}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                                        <Eye size={15} />
                                                    </button>
                                                    <button type="button"
                                                        onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                                                        className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button type="button"
                                                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                                                        className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════════════════
          VIEW Modal
      ═══════════════════════════════════════════════════════════════ */}
            <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Category Details" size="md">
                {viewingCat && (
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-2xl shadow-sm">
                                {viewingCat.icon || <Layers size={20} className="text-gray-300" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-gray-900">{viewingCat.name}</p>
                                <code className="text-xs font-mono text-gray-400">/{viewingCat.slug}</code>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0 ${viewingCat.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-100'}`}>
                                {viewingCat.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><Hash size={10} className="mr-1" /> Display Order</div>
                                <p className="text-lg font-black text-gray-900">{viewingCat.display_order ?? '—'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><Home size={10} className="mr-1" /> Show on Home</div>
                                <p className="text-lg font-black text-gray-900">{viewingCat.show_on_home ? '✅ Yes' : '—'}</p>
                            </div>

                            {viewingCat.description && (
                                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><FileText size={10} className="mr-1" /> Description</div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{viewingCat.description}</p>
                                </div>
                            )}

                            {viewingCat.link && (
                                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><LinkIcon size={10} className="mr-1" /> Link</div>
                                    <p className="text-xs font-mono text-blue-600 truncate">{viewingCat.link}</p>
                                </div>
                            )}

                            <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><Layers size={10} className="mr-1" /> ID</div>
                                <p className="text-xs font-mono text-gray-500">{viewingCat.id}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-50">
                            <button type="button"
                                onClick={() => { setShowViewModal(false); openEditModal(viewingCat); }}
                                className="px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-1.5">
                                <Edit2 size={13} /> Edit
                            </button>
                            <button type="button" onClick={() => setShowViewModal(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ═══════════════════════════════════════════════════════════════
          CREATE / EDIT Modal
      ═══════════════════════════════════════════════════════════════ */}
            <Modal isOpen={showFormModal} onClose={closeFormModal} title={editingCat ? 'Edit Category' : 'Add New Category'} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Name *</label>
                            <input type="text" name="name" required
                                placeholder="e.g. Hotels"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium text-sm"
                                value={formData.name} onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Icon (emoji)</label>
                            <input type="text" name="icon"
                                placeholder="e.g. 🏨"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xl text-center"
                                value={formData.icon} onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Slug *</label>
                        <div className="flex items-center">
                            <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-100 rounded-l-xl text-sm text-gray-400 font-mono">/</span>
                            <input type="text" name="slug" required
                                placeholder="hotels"
                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-mono text-sm"
                                value={formData.slug} onChange={handleInputChange}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Auto-generated from name. Must be URL-safe (lowercase, hyphens only).</p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea name="description" rows={2}
                            placeholder="Brief description of this category…"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm resize-none"
                            value={formData.description} onChange={handleInputChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Link (optional)</label>
                            <input type="text" name="link"
                                placeholder="/categories/hotels"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-mono text-sm"
                                value={formData.link} onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Display Order</label>
                            <input type="number" name="display_order" min="1"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                value={formData.display_order} onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Image URL (optional)</label>
                        <input type="text" name="image_url"
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm"
                            value={formData.image_url} onChange={handleInputChange}
                        />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="accent-brand-red w-4 h-4" />
                            <span className="text-sm font-semibold text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" name="show_on_home" checked={formData.show_on_home} onChange={handleInputChange} className="accent-brand-red w-4 h-4" />
                            <span className="text-sm font-semibold text-gray-700">Show on Homepage</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
                        <button type="button" onClick={closeFormModal}
                            className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">
                            Cancel
                        </button>
                        <Button type="submit" disabled={formLoading}
                            className="bg-brand-red text-white px-8 py-2.5 rounded-xl shadow-lg shadow-red-100 flex items-center font-bold">
                            {formLoading && <Loader2 className="animate-spin mr-2" size={15} />}
                            {editingCat ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;

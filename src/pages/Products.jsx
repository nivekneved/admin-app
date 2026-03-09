import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import {
  Tag, Loader2, RefreshCw, Plus, Search, Edit2, Trash2, Eye,
  LayoutGrid, List, ArrowUpDown, ArrowUp, ArrowDown, Package,
  ChevronDown, X, CreditCard, Layers, BarChart2, FileText,
  ImageIcon, Upload, Images, Check, AlertCircle, BedDouble, ToggleLeft, ToggleRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

// ─── Constants ────────────────────────────────────────────────────────────────
const BUCKET = 'bucket';
const FOLDER = 'products';
const STATUSES = ['In Stock', 'Low Stock', 'Out of Stock'];
const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest first' },
  { value: 'created_at:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name A → Z' },
  { value: 'name:desc', label: 'Name Z → A' },
  { value: 'price:asc', label: 'Price ↑ Low to High' },
  { value: 'price:desc', label: 'Price ↓ High to Low' },
  { value: 'stock:asc', label: 'Stock ↑ Low to High' },
  { value: 'stock:desc', label: 'Stock ↓ High to Low' },
];
const PER_PAGE_OPTIONS = [8, 16, 32, 64];

// ─── Colour palette for category badges ───────────────────────────────────────
const PALETTE = [
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-teal-50 text-teal-600 border-teal-100',
  'bg-orange-50 text-orange-600 border-orange-100',
  'bg-sky-50 text-sky-600 border-sky-100',
  'bg-pink-50 text-pink-600 border-pink-100',
  'bg-indigo-50 text-indigo-600 border-indigo-100',
  'bg-amber-50 text-amber-600 border-amber-100',
];
const _cc = {}; let _ci = 0;
const categoryColor = (n) => {
  if (!n) return 'bg-gray-50 text-gray-500 border-gray-100';
  if (!_cc[n]) _cc[n] = PALETTE[_ci++ % PALETTE.length];
  return _cc[n];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (s) => {
  if (s === 'In Stock') return 'bg-green-50 text-green-700 border-green-100';
  if (s === 'Low Stock') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
  if (s === 'Out of Stock') return 'bg-red-50 text-red-700 border-red-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const defaultForm = (firstCat = '') => ({
  name: '', category: firstCat, price: '', stock: '',
  status: 'In Stock', description: '', image_url: '',
  room_types: [],
});

// ─── Sort icon ────────────────────────────────────────────────────────────────
const SortIcon = ({ field, currentSort }) => {
  const [f, d] = currentSort.split(':');
  if (f !== field) return <ArrowUpDown size={12} className="text-gray-300 ml-1" />;
  return d === 'asc'
    ? <ArrowUp size={12} className="text-brand-red ml-1" />
    : <ArrowDown size={12} className="text-brand-red ml-1" />;
};

// ─── Product thumbnail ────────────────────────────────────────────────────────
const Thumb = ({ src, size = 'sm' }) => {
  const dim = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  if (src) return (
    <img src={src} alt="" className={`${dim} rounded-xl object-cover border border-gray-100 shrink-0`} />
  );
  return (
    <div className={`${dim} rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0`}>
      <Tag size={size === 'sm' ? 14 : 16} className="text-gray-300" />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // — Toolbar —
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [viewMode, setViewMode] = useState('list');
  const [perPage, setPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // — Modals —
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showLibModal, setShowLibModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(() => defaultForm(''));
  const [formLoading, setFormLoading] = useState(false);

  // — Image upload —
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  // — Image library —
  const [libImages, setLibImages] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libSearch, setLibSearch] = useState('');

  // Fetch categories from site categories table — defined BEFORE useEffect that calls it
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories((data || []).map(c => c.name));
    } catch (e) { void e; }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ─── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        if (error.message.includes('relation "public.products" does not exist')) setProducts([]);
        else throw error;
      } else setProducts(data || []);
    } catch (e) {
      void e;
      showAlert('Error', 'Failed to load products', 'error');
    } finally { setLoading(false); }
  };

  // ─── Image upload to Supabase Storage ─────────────────────────────────────
  const handleImageUpload = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP or GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${FOLDER}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Try again.');
    } finally { setUploading(false); }
  };

  // ─── Fetch image library (all uploaded files in products/ folder) ──────────
  const openLibModal = async () => {
    setShowLibModal(true);
    setLibLoading(true);
    setLibSearch('');
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, { limit: 200 });
      if (error) throw error;
      // Build public URLs
      const imgs = (data || [])
        .filter(f => f.name && !f.name.endsWith('/'))
        .map(f => {
          const { data: u } = supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`);
          return { name: f.name, url: u.publicUrl, updatedAt: f.updated_at };
        });
      setLibImages(imgs);
    } catch (e) {
      void e;
      showAlert('Error', 'Failed to load image library', 'error');
    } finally { setLibLoading(false); }
  };

  const pickLibImage = (url) => {
    setFormData(prev => ({ ...prev, image_url: url }));
    setShowLibModal(false);
  };

  // ─── Filter + Sort ────────────────────────────────────────────────────────
  const processed = useMemo(() => {
    let list = [...products];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'All') list = list.filter(p => p.category === filterCategory);
    if (filterStatus !== 'All') list = list.filter(p => p.status === filterStatus);
    const [field, dir] = sortBy.split(':');
    list.sort((a, b) => {
      let va = a[field], vb = b[field];
      if (field === 'price' || field === 'stock') { va = Number(va); vb = Number(vb); }
      if (field === 'created_at') { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [products, searchTerm, filterCategory, filterStatus, sortBy]);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalPages = Math.ceil(processed.length / perPage);
  const pageStart = (currentPage - 1) * perPage;
  const currentItems = processed.slice(pageStart, pageStart + perPage);
  const handlePageChange = (p) => setCurrentPage(Math.min(Math.max(p, 1), totalPages));
  useEffect(() => setCurrentPage(1), [searchTerm, filterCategory, filterStatus, sortBy, perPage]);

  // ─── Column sort ──────────────────────────────────────────────────────────
  const toggleSort = (field) => {
    const [f, d] = sortBy.split(':');
    setSortBy(f === field ? `${field}:${d === 'asc' ? 'desc' : 'asc'}` : `${field}:asc`);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingProduct(null);
    setUploadError('');
    setFormData(defaultForm(categories[0] || ''));
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setUploadError('');
    setFormData({
      name: product.name || '',
      category: product.category || categories[0] || '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      status: product.status || 'In Stock',
      description: product.description || '',
      image_url: product.image_url || '',
      room_types: (Array.isArray(product.room_types) ? product.room_types : []).map(rt => {
        // Migrate old Daily/Weekend structure to new 7-day structure
        if (rt.daily_price !== undefined || rt.weekend_price !== undefined) {
          const d = rt.daily_price || 0;
          const w = rt.weekend_price || 0;
          return {
            type: rt.type || '',
            available: rt.available ?? true,
            prices: rt.prices || { mon: d, tue: d, wed: d, thu: d, fri: d, sat: w, sun: w }
          };
        }
        return {
          available: true,
          ...rt,
          prices: rt.prices || { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' }
        };
      }),
    });
    setShowFormModal(true);
  };

  const openViewModal = (product) => { setViewingProduct(product); setShowViewModal(true); };
  const closeFormModal = () => { setShowFormModal(false); setEditingProduct(null); setUploadError(''); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        image_url: formData.image_url || null,
        room_types: formData.category === 'Hotels' ? formData.room_types : [],
        updated_at: new Date().toISOString(),
      };
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        showAlert('Updated', 'Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        showAlert('Created', 'Product added successfully');
      }
      closeFormModal();
      fetchProducts();
    } catch (err) {
      showAlert('Error', err.message || 'Error saving product', 'error');
    } finally { setFormLoading(false); }
  };

  const deleteProduct = async (id) => {
    const result = await showConfirm('Delete Product?', 'This will remove the product from your catalog.');
    if (!result.isConfirmed) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showAlert('Deleted', 'Product removed');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) { void e; showAlert('Error', 'Failed to delete product', 'error'); }
  };

  const clearFilters = () => { setSearchTerm(''); setFilterCategory('All'); setFilterStatus('All'); setSortBy('created_at:desc'); };
  const hasActiveFilters = searchTerm || filterCategory !== 'All' || filterStatus !== 'All';
  const selectCls = 'px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none cursor-pointer text-gray-700 hover:border-gray-300 transition-colors';

  // Filtered library images
  const filteredLib = libImages.filter(img =>
    img.name.toLowerCase().includes(libSearch.toLowerCase())
  );

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products Catalog</h1>
          <p className="text-sm text-gray-400 mt-0.5">{processed.length} product{processed.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchProducts} disabled={loading} className="flex items-center gap-2 border-gray-200">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Sync
          </Button>
          <Button onClick={openCreateModal} className="bg-brand-red hover:opacity-90 text-white flex items-center gap-2">
            <Plus size={16} /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        {/* Toolbar */}
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex flex-col gap-3">
            {/* Row 1: Search + View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name, category, description…"
                  className="pl-9 pr-9 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shrink-0">
                <button type="button" onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="List view"><List size={16} /></button>
                <button type="button" onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Grid view"><LayoutGrid size={16} /></button>
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select className={selectCls} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select className={selectCls} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select className={selectCls} value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                  {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} per page</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-brand-red bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all">
                  <X size={13} /> Clear filters
                </button>
              )}
              <span className="ml-auto text-xs text-gray-400 font-medium">{processed.length} result{processed.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-brand-red mb-3" size={36} />
              <p className="text-gray-400 font-medium text-sm">Loading catalog…</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <Package className="text-gray-200 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800">{hasActiveFilters ? 'No products match your filters' : 'No products yet'}</h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">{hasActiveFilters ? 'Try adjusting your search or clearing the filters.' : 'Start building your catalog.'}</p>
              {hasActiveFilters
                ? <button type="button" onClick={clearFilters} className="mt-4 px-5 py-2 text-sm font-bold text-brand-red bg-red-50 rounded-xl hover:bg-red-100 transition-all">Clear filters</button>
                : <Button onClick={openCreateModal} className="mt-5 bg-brand-red text-white">Add Your First Product</Button>
              }
            </div>
          ) : viewMode === 'list' ? (

            /* ── LIST VIEW ──────────────────────────────────────────────── */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    {[
                      { label: 'Product', field: 'name' },
                      { label: 'Category', field: 'category' },
                      { label: 'Price', field: 'price' },
                      { label: 'Stock', field: 'stock' },
                      { label: 'Status', field: 'status' },
                    ].map(col => (
                      <th key={col.field}
                        className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => toggleSort(col.field)}>
                        <div className="flex items-center hover:text-gray-600 transition-colors">
                          {col.label}<SortIcon field={col.field} currentSort={sortBy} />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {currentItems.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <Thumb src={product.image_url} size="sm" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900">{product.name}</p>
                              {product.category === 'Hotels' && Array.isArray(product.room_types) && product.room_types.length > 0 && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded-lg">
                                  <BedDouble size={10} /> {product.room_types.length} room types
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-gray-300">{product.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${categoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-gray-900">
                        Rs {Number(product.price || 0).toLocaleString('en-MU', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-semibold">{product.stock ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button type="button" onClick={(e) => { e.stopPropagation(); openViewModal(product); }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={15} /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                            className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Edit"><Edit2 size={15} /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                            className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (

            /* ── GRID VIEW ──────────────────────────────────────────────── */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentItems.map((product) => (
                <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group flex flex-col">
                  {/* Image */}
                  {product.image_url ? (
                    <div className="h-40 w-full overflow-hidden bg-gray-50">
                      <img src={product.image_url} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-gray-50 flex items-center justify-center border-b border-gray-100">
                      <ImageIcon size={32} className="text-gray-200" />
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-y-2 mb-1">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${categoryColor(product.category)}`}>
                          {product.category}
                        </span>
                        {product.category === 'Hotels' && Array.isArray(product.room_types) && product.room_types.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
                            <BedDouble size={10} /> {product.room_types.length}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-tight mt-2 mb-1 line-clamp-2">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Price</p>
                        <p className="text-sm font-black text-gray-900">Rs {Number(product.price || 0).toLocaleString('en-MU', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Stock</p>
                        <p className="text-sm font-black text-gray-900">{product.stock ?? '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                      <button type="button" onClick={() => openViewModal(product)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye size={13} /> View
                      </button>
                      <button type="button" onClick={() => openEditModal(product)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit2 size={13} /> Edit
                      </button>
                      <button type="button" onClick={() => deleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-gray-500 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {processed.length > perPage && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <div className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{pageStart + 1}</span> to{' '}
                <span className="font-bold text-gray-900">{Math.min(pageStart + perPage, processed.length)}</span> of{' '}
                <span className="font-bold text-gray-900">{processed.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => { if (i > 0 && arr[i - 1] !== p - 1) acc.push('…'); acc.push(p); return acc; }, [])
                  .map((p, i) => p === '…'
                    ? <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    : <button key={p} type="button" onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${currentPage === p ? 'bg-brand-red text-white shadow-lg shadow-red-100' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  )
                }
                <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm">
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          VIEW Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Product Details" size="md">
        {viewingProduct && (
          <div className="space-y-4">
            {/* Hero image */}
            {viewingProduct.image_url ? (
              <div className="rounded-2xl overflow-hidden h-52 bg-gray-100">
                <img src={viewingProduct.image_url} alt={viewingProduct.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl h-32 bg-gray-50 border border-gray-100 flex items-center justify-center">
                <ImageIcon size={32} className="text-gray-200" />
              </div>
            )}

            {/* Name + badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-black text-gray-900 text-base flex-1">{viewingProduct.name}</p>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${categoryColor(viewingProduct.category)}`}>{viewingProduct.category}</span>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${statusBadge(viewingProduct.status)}`}>{viewingProduct.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><CreditCard size={10} className="mr-1" /> Price</div>
                <p className="text-xl font-black text-gray-900">Rs {Number(viewingProduct.price || 0).toLocaleString('en-MU', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><BarChart2 size={10} className="mr-1" /> Stock</div>
                <p className="text-xl font-black text-gray-900">{viewingProduct.stock ?? '—'}</p>
              </div>
              {viewingProduct.description && (
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><FileText size={10} className="mr-1" /> Description</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewingProduct.description}</p>
                </div>
              )}
              <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><Layers size={10} className="mr-1" /> ID</div>
                <p className="text-xs font-mono text-gray-500">{viewingProduct.id}</p>
              </div>
            </div>

            {/* Room types table — Hotels only */}
            {viewingProduct.category === 'Hotels' && Array.isArray(viewingProduct.room_types) && viewingProduct.room_types.length > 0 && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden mt-4">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <BedDouble size={13} /> Room Types & Weekly Pricing
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-4 py-2 text-[9px] font-bold text-gray-400 uppercase">Room Type</th>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                          <th key={d} className="px-4 py-2 text-[9px] font-bold text-gray-400 uppercase text-center">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {viewingProduct.room_types.map((rt, i) => (
                        <tr key={i} className={rt.available ? '' : 'bg-red-50/30'}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${rt.available ? 'bg-green-400' : 'bg-red-300'}`} />
                              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">{rt.type || '—'}</span>
                            </div>
                          </td>
                          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                            <td key={day} className="px-4 py-3 text-center">
                              <span className="text-sm font-black text-gray-900">
                                {rt.prices?.[day] ? `Rs ${Number(rt.prices[day]).toLocaleString('en-MU')}` : '—'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-gray-50">
              <button type="button" onClick={() => { setShowViewModal(false); openEditModal(viewingProduct); }}
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
      <Modal isOpen={showFormModal} onClose={closeFormModal} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Image Section ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product Image</label>
              <button type="button" onClick={openLibModal}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-red hover:text-red-700 transition-colors">
                <Images size={13} /> Browse Library
              </button>
            </div>

            {/* Preview */}
            {formData.image_url ? (
              <div className="relative rounded-2xl overflow-hidden h-36 mb-2 bg-gray-100 group">
                <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  className="absolute top-2 right-2 bg-white/90 text-gray-500 hover:text-brand-red p-1 rounded-lg shadow transition-all opacity-0 group-hover:opacity-100">
                  <X size={14} />
                </button>
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-lg">Image set ✓</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="h-28 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-red bg-gray-50 hover:bg-red-50/30 flex flex-col items-center justify-center cursor-pointer transition-all mb-2 group">
                {uploading ? (
                  <><Loader2 size={20} className="animate-spin text-brand-red mb-1" /><p className="text-xs text-gray-400">Uploading…</p></>
                ) : (
                  <><Upload size={20} className="text-gray-300 group-hover:text-brand-red mb-1 transition-colors" />
                    <p className="text-xs font-semibold text-gray-400 group-hover:text-brand-red transition-colors">Click to upload image</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, WEBP · max 5MB</p></>
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); }} />

            {/* Error */}
            {uploadError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                <AlertCircle size={12} /> {uploadError}
              </div>
            )}

            {/* Manual URL input */}
            <div className="mt-2">
              <input type="text" name="image_url" placeholder="Or paste image URL directly…"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={formData.image_url} onChange={handleInputChange} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Product Name *</label>
            <input type="text" name="name" required placeholder="e.g. VIP Lounge Access"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium text-sm"
              value={formData.name} onChange={handleInputChange} />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select name="category"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none font-bold text-sm text-gray-700 transition-all"
                value={formData.category} onChange={handleInputChange}>
                {categories.length > 0
                  ? categories.map(c => <option key={c} value={c}>{c}</option>)
                  : <option value="">Loading…</option>
                }
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price (Rs) *</label>
              <input type="number" name="price" required step="0.01" min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red font-bold text-sm transition-all"
                value={formData.price} onChange={handleInputChange} />
            </div>
          </div>

          {/* Stock + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock Level</label>
              <input type="number" name="stock" min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red text-sm transition-all"
                value={formData.stock} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none font-bold text-sm text-gray-700 transition-all"
                value={formData.status} onChange={handleInputChange}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea name="description" rows={3} placeholder="Describe this product or service…"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red text-sm transition-all resize-none"
              value={formData.description} onChange={handleInputChange} />
          </div>

          {/* ── Room Types (Hotels only) ── */}
          {formData.category === 'Hotels' && (
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <BedDouble size={13} /> Room Types
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    room_types: [...prev.room_types, {
                      type: '',
                      available: true,
                      prices: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' }
                    }]
                  }))}
                  className="flex items-center gap-1 text-xs font-bold text-brand-red hover:text-red-700 transition-colors">
                  <Plus size={12} /> Add Room Type
                </button>
              </div>

              {formData.room_types.length === 0 ? (
                <div className="py-6 flex flex-col items-center text-center">
                  <BedDouble size={22} className="text-gray-200 mb-1" />
                  <p className="text-xs text-gray-400">No room types yet — click <strong>Add Room Type</strong></p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {formData.room_types.map((rt, idx) => (
                    <div key={idx} className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {/* Type name */}
                        <input
                          type="text"
                          placeholder="Room type name (e.g. Deluxe Room)"
                          value={rt.type}
                          onChange={e => setFormData(prev => {
                            const updated = [...prev.room_types];
                            updated[idx] = { ...updated[idx], type: e.target.value };
                            return { ...prev, room_types: updated };
                          })}
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                        />

                        {/* Available toggle */}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => {
                            const updated = [...prev.room_types];
                            updated[idx] = { ...updated[idx], available: !updated[idx].available };
                            return { ...prev, room_types: updated };
                          })}
                          className={`flex items-center gap-1.5 transition-colors ${rt.available ? 'text-green-600' : 'text-gray-300'}`}
                        >
                          {rt.available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                          <span className="text-[10px] font-bold uppercase tracking-wider">{rt.available ? 'Active' : 'Stopped'}</span>
                        </button>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, room_types: prev.room_types.filter((_, i) => i !== idx) }))}
                          className="p-2 text-gray-300 hover:text-brand-red transition-colors shrink-0" title="Remove Room Type">
                          <X size={16} />
                        </button>
                      </div>

                      {/* 7-Day Pricing Grid */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weekly Pricing (Rs)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-300 uppercase">Sync all:</span>
                            <input
                              type="number" placeholder="Quick set..."
                              className="w-20 px-2 py-1 text-[10px] bg-white border border-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-brand-red"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                setFormData(prev => {
                                  const updated = [...prev.room_types];
                                  updated[idx] = {
                                    ...updated[idx],
                                    prices: { mon: val, tue: val, wed: val, thu: val, fri: val, sat: val, sun: val }
                                  };
                                  return { ...prev, room_types: updated };
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                            <div key={day} className="flex flex-col">
                              <span className="text-[9px] font-bold text-gray-400 uppercase text-center mb-1">{day}</span>
                              <input
                                type="number" min="0" step="0.01"
                                value={rt.prices?.[day] || ''}
                                onChange={e => setFormData(prev => {
                                  const updated = [...prev.room_types];
                                  updated[idx] = {
                                    ...updated[idx],
                                    prices: { ...updated[idx].prices, [day]: e.target.value }
                                  };
                                  return { ...prev, room_types: updated };
                                })}
                                className="w-full px-1 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
            <button type="button" onClick={closeFormModal}
              className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
            <Button type="submit" disabled={formLoading || uploading}
              className="bg-brand-red text-white px-8 py-2.5 rounded-xl shadow-lg shadow-red-100 flex items-center font-bold">
              {(formLoading || uploading) && <Loader2 className="animate-spin mr-2" size={15} />}
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          IMAGE LIBRARY Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal isOpen={showLibModal} onClose={() => setShowLibModal(false)} title="Image Library" size="xl">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search images…"
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
              value={libSearch} onChange={(e) => setLibSearch(e.target.value)} />
          </div>

          {libLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-brand-red" size={32} />
            </div>
          ) : filteredLib.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Images size={40} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-semibold">No images uploaded yet</p>
              <p className="text-gray-400 text-xs mt-1">Upload a product image via the form first.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400">{filteredLib.length} image{filteredLib.length !== 1 ? 's' : ''} available — click to use</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredLib.map((img) => {
                  const isSelected = formData.image_url === img.url;
                  return (
                    <button key={img.name} type="button" onClick={() => pickLibImage(img.url)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${isSelected ? 'border-brand-red ring-2 ring-brand-red/30' : 'border-transparent hover:border-gray-300'}`}>
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-brand-red/20 flex items-center justify-center">
                          <div className="bg-brand-red text-white rounded-full p-1"><Check size={14} /></div>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1 py-0.5">
                        <p className="text-[9px] text-white truncate font-medium">{img.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Upload new from library */}
          <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">Upload a new image directly:</p>
            <button type="button" onClick={() => { setShowLibModal(false); fileRef.current?.click(); }}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-brand-red rounded-xl hover:opacity-90 transition-all">
              <Upload size={13} /> Upload New
            </button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default Products;
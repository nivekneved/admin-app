import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import {
  Tag, Loader2, RefreshCw, Plus, Search, Edit2, Trash2, Eye,
  LayoutGrid, List, ArrowUpDown, ArrowUp, ArrowDown, Package,
  ChevronDown, X, CreditCard, Layers, BarChart2, FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Lounge Access', 'Meeting Space', 'Wellness',
  'Food & Beverage', 'Transportation'
];
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (s) => {
  if (s === 'In Stock') return 'bg-green-50 text-green-700 border-green-100';
  if (s === 'Low Stock') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
  if (s === 'Out of Stock') return 'bg-red-50 text-red-700 border-red-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const categoryColor = (c) => {
  const m = {
    'Lounge Access': 'bg-blue-50 text-blue-600 border-blue-100',
    'Meeting Space': 'bg-purple-50 text-purple-600 border-purple-100',
    'Wellness': 'bg-teal-50 text-teal-600 border-teal-100',
    'Food & Beverage': 'bg-orange-50 text-orange-600 border-orange-100',
    'Transportation': 'bg-sky-50 text-sky-600 border-sky-100',
  };
  return m[c] || 'bg-gray-50 text-gray-500 border-gray-100';
};

const defaultForm = () => ({
  name: '', category: 'Lounge Access', price: '', stock: '',
  status: 'In Stock', description: ''
});

// ─── Sort icon helper ──────────────────────────────────────────────────────────
const SortIcon = ({ field, currentSort }) => {
  const [f, d] = currentSort.split(':');
  if (f !== field) return <ArrowUpDown size={12} className="text-gray-300 ml-1" />;
  return d === 'asc'
    ? <ArrowUp size={12} className="text-brand-red ml-1" />
    : <ArrowDown size={12} className="text-brand-red ml-1" />;
};

// ═════════════════════════════════════════════════════════════════════════════
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // — Toolbar state —
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [perPage, setPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // — Modals —
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('relation "public.products" does not exist')) {
          setProducts([]);
        } else throw error;
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Filter + Sort (memoised) ─────────────────────────────────────────────
  const processed = useMemo(() => {
    let list = [...products];

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filterCategory !== 'All')
      list = list.filter(p => p.category === filterCategory);

    // Status filter
    if (filterStatus !== 'All')
      list = list.filter(p => p.status === filterStatus);

    // Sort
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

  // Reset to page 1 when filters change
  useEffect(() => setCurrentPage(1), [searchTerm, filterCategory, filterStatus, sortBy, perPage]);

  // ─── Column sort (table header click) ────────────────────────────────────
  const toggleSort = (field) => {
    const [f, d] = sortBy.split(':');
    setSortBy(f === field
      ? `${field}:${d === 'asc' ? 'desc' : 'asc'}`
      : `${field}:asc`
    );
  };

  // ─── CRUD handlers ────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(defaultForm());
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Lounge Access',
      price: product.price ?? '',
      stock: product.stock ?? '',
      status: product.status || 'In Stock',
      description: product.description || ''
    });
    setShowFormModal(true);
  };

  const openViewModal = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const closeFormModal = () => { setShowFormModal(false); setEditingProduct(null); };

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
      };
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        showAlert('Updated', 'Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        showAlert('Success', 'Product added successfully');
      }
      closeFormModal();
      fetchProducts();
    } catch (err) {
      showAlert('Error', err.message || 'Error saving product', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    const result = await showConfirm('Delete Product?', 'This will remove the product from your catalog.');
    if (!result.isConfirmed) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showAlert('Deleted', 'Product removed');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showAlert('Error', 'Failed to delete product', 'error');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('All');
    setFilterStatus('All');
    setSortBy('created_at:desc');
  };

  const hasActiveFilters = searchTerm || filterCategory !== 'All' || filterStatus !== 'All';

  // ─── Toolbar select style ─────────────────────────────────────────────────
  const selectCls = 'px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none cursor-pointer text-gray-700 hover:border-gray-300 transition-colors';

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products Catalog</h1>
          <p className="text-sm text-gray-400 mt-0.5">{processed.length} product{processed.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchProducts}
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
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        {/* ── Toolbar ── */}
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex flex-col gap-3">

            {/* Row 1: Search + View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
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
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="List view"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>

            {/* Row 2: Filters + Sort + Per Page */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Category filter */}
              <div className="relative">
                <select
                  className={selectCls}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  className={selectCls}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  className={selectCls}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Per page */}
              <div className="relative">
                <select
                  className={selectCls}
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                >
                  {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} per page</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-brand-red bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-all"
                >
                  <X size={13} /> Clear filters
                </button>
              )}

              {/* Result count badge */}
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
              <p className="text-gray-400 font-medium text-sm">Loading catalog…</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <Package className="text-gray-200 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800">
                {hasActiveFilters ? 'No products match your filters' : 'No products yet'}
              </h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                {hasActiveFilters
                  ? 'Try adjusting your search or clearing the filters.'
                  : 'Start building your catalog. Add travel packages, lounge access, or services.'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 px-5 py-2 text-sm font-bold text-brand-red bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                >
                  Clear filters
                </button>
              ) : (
                <Button onClick={openCreateModal} className="mt-5 bg-brand-red text-white">
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            // ── LIST VIEW ──────────────────────────────────────────────────
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
                      <th
                        key={col.field}
                        className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none group"
                        onClick={() => toggleSort(col.field)}
                      >
                        <div className="flex items-center hover:text-gray-600 transition-colors">
                          {col.label}
                          <SortIcon field={col.field} currentSort={sortBy} />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {currentItems.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center shrink-0">
                            <Tag size={14} className="text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{product.name}</p>
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
                      <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                        {product.stock ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openViewModal(product); }}
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openEditModal(product); }}
                            className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                            className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // ── GRID VIEW ──────────────────────────────────────────────────
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentItems.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 transition-all group flex flex-col"
                >
                  {/* Card top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Tag size={16} className="text-gray-400" />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusBadge(product.status)}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Name + category */}
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</p>
                  <span className={`self-start px-2 py-0.5 text-[10px] font-bold rounded-full border mb-2 ${categoryColor(product.category)}`}>
                    {product.category}
                  </span>

                  {/* Description */}
                  {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Price</p>
                      <p className="text-sm font-black text-gray-900">
                        Rs {Number(product.price || 0).toLocaleString('en-MU', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Stock</p>
                      <p className="text-sm font-black text-gray-900">{product.stock ?? '—'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => openViewModal(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold text-gray-500 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {processed.length > perPage && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <div className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{pageStart + 1}</span> to{' '}
                <span className="font-bold text-gray-900">{Math.min(pageStart + perPage, processed.length)}</span> of{' '}
                <span className="font-bold text-gray-900">{processed.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 text-sm font-bold rounded-xl transition-all ${currentPage === p
                            ? 'bg-brand-red text-white shadow-lg shadow-red-100'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
                >
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
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Product Details"
        size="md"
      >
        {viewingProduct && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <Tag size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 truncate">{viewingProduct.name}</p>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${categoryColor(viewingProduct.category)}`}>
                  {viewingProduct.category}
                </span>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0 ${statusBadge(viewingProduct.status)}`}>
                {viewingProduct.status}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <CreditCard size={10} className="mr-1" /> Price
                </div>
                <p className="text-xl font-black text-gray-900">
                  Rs {Number(viewingProduct.price || 0).toLocaleString('en-MU', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <BarChart2 size={10} className="mr-1" /> Stock
                </div>
                <p className="text-xl font-black text-gray-900">{viewingProduct.stock ?? '—'}</p>
              </div>

              {viewingProduct.description && (
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <FileText size={10} className="mr-1" /> Description
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewingProduct.description}</p>
                </div>
              )}

              <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Layers size={10} className="mr-1" /> ID
                </div>
                <p className="text-xs font-mono text-gray-500">{viewingProduct.id}</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-2 pt-1 border-t border-gray-50">
              <button
                type="button"
                onClick={() => { setShowViewModal(false); openEditModal(viewingProduct); }}
                className="px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-1.5"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          CREATE / EDIT Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. VIP Lounge Access"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium text-sm"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select
                name="category"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none font-bold text-sm text-gray-700 transition-all"
                value={formData.category}
                onChange={handleInputChange}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Price (Rs) *</label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red font-bold text-sm transition-all"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock Level</label>
              <input
                type="number"
                name="stock"
                min="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red text-sm transition-all"
                value={formData.stock}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select
                name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red appearance-none font-bold text-sm text-gray-700 transition-all"
                value={formData.status}
                onChange={handleInputChange}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe this product or service…"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red text-sm transition-all resize-none"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-brand-red text-white px-8 py-2.5 rounded-xl shadow-lg shadow-red-100 flex items-center font-bold"
            >
              {formLoading && <Loader2 className="animate-spin mr-2" size={15} />}
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import {
  Download, Eye, Send, Calendar, Loader2, RefreshCw, Search, Plus,
  Edit2, Trash2, CheckCircle, Hash, FileText, CreditCard, User, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

// ─── Status helpers ────────────────────────────────────────────────────────
const statusBadge = (s) => {
  if (s === 'Paid') return 'bg-green-50 text-green-700 border-green-100';
  if (s === 'Pending') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
  if (s === 'Overdue') return 'bg-red-50 text-red-700 border-red-100';
  if (s === 'Cancelled') return 'bg-gray-100 text-gray-500 border-gray-100';
  return 'bg-blue-50 text-blue-600 border-blue-100';
};

// ─── Default form factory (outside component to avoid hoisting issues) ────────
const genDefaultForm = () => ({
  customer_id: '',
  customer_name: '',
  amount: '',
  status: 'Pending',
  service: '',
  reference: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
  due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(8);
  const [customers, setCustomers] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  // — Create modal —
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState(genDefaultForm);

  // — View modal —
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // — Edit modal —
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('relation "public.invoices" does not exist')) {
          setInvoices([]);
        } else {
          throw error;
        }
      } else {
        setInvoices(data || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showAlert('Error', 'Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .order('first_name');
      if (!error) setCustomers(data || []);
    } catch (e) {
      console.error('Error loading customers:', e);
    }
  };

  // ─── Filter + Pagination ────────────────────────────────────────────────
  const filteredInvoices = invoices.filter(inv =>
    (inv.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.service?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ─── Create ─────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'customer_id') {
      const c = customers.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        customer_id: value,
        customer_name: c ? `${c.first_name} ${c.last_name}` : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { error } = await supabase.from('invoices').insert([formData]);
      if (error) throw error;
      showAlert('Success', 'Invoice created successfully');
      setShowModal(false);
      setFormData(genDefaultForm());
      fetchInvoices();
    } catch (error) {
      showAlert('Error', error.message || 'Error creating invoice', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── View ────────────────────────────────────────────────────────────────
  const openViewModal = (invoice) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
  };

  // ─── Edit ────────────────────────────────────────────────────────────────
  const openEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setEditFormData({
      customer_name: invoice.customer_name || '',
      service: invoice.service || '',
      amount: invoice.amount || '',
      status: invoice.status || 'Pending',
      due_date: invoice.due_date ? invoice.due_date.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          customer_name: editFormData.customer_name,
          service: editFormData.service,
          amount: parseFloat(editFormData.amount) || 0,
          status: editFormData.status,
          due_date: editFormData.due_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingInvoice.id);

      if (error) throw error;
      showAlert('Updated', 'Invoice updated successfully');
      setShowEditModal(false);
      fetchInvoices();
    } catch (err) {
      showAlert('Error', err.message || 'Failed to update invoice', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Quick Mark as Paid ──────────────────────────────────────────────────
  const togglePaid = async (invoice) => {
    const nextStatus = invoice.status === 'Paid' ? 'Pending' : 'Paid';
    setTogglingId(invoice.id);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', invoice.id);

      if (error) throw error;
      setInvoices(prev =>
        prev.map(inv => inv.id === invoice.id ? { ...inv, status: nextStatus } : inv)
      );
    } catch (e) {
      void e;
      showAlert('Error', 'Could not update invoice status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Download / Print ─────────────────────────────────────────────────────
  const handleDownload = (invoice) => {
    const content = `
INVOICE

Reference : ${invoice.reference || '—'}
Customer  : ${invoice.customer_name || '—'}
Service   : ${invoice.service || '—'}
Amount    : Rs ${Number(invoice.amount || 0).toFixed(2)}
Status    : ${invoice.status || '—'}
Issued    : ${formatDate(invoice.created_at)}
Due Date  : ${formatDate(invoice.due_date)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.reference || 'invoice'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Send (mark as Sent) ──────────────────────────────────────────────────
  const handleSendInvoice = async (invoice) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'Pending', updated_at: new Date().toISOString() })
        .eq('id', invoice.id);

      if (error) throw error;
      showAlert('Sent', `Invoice ${invoice.reference} marked as sent to ${invoice.customer_name}.`, 'success');
      fetchInvoices();
    } catch (e) {
      void e;
      showAlert('Error', 'Failed to update send status', 'error');
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deleteInvoice = async (id) => {
    const result = await showConfirm(
      'Delete Invoice?',
      'This will permanently remove this invoice from the database.'
    );
    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      showAlert('Deleted', 'Invoice removed successfully');
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (e) {
      void e;
      showAlert('Error', 'Failed to delete invoice', 'error');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Invoice Management</h1>
          <p className="text-gray-400 text-sm font-medium">Bespoke financial tracking and premium billing services</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchInvoices}
            className="text-gray-500 border-gray-200 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
          <Link to="/invoices/create">
            <Button className="bg-brand-red hover:opacity-90 text-white flex items-center gap-2 shadow-lg shadow-red-100 font-bold">
              <Plus size={16} />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-gray-50 pb-4 bg-white px-8 pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search className="absolute left-3 top-3 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Locate financial records…"
                className="pl-9 pr-4 py-2.5 w-full border border-gray-100 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest shrink-0">{filteredInvoices.length} Registered Invoices</span>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="py-32 flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compiling Ledger Data...</p>
              </div>
            ) : currentInvoices.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/30">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Entity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Issuance</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Maturity</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Provision</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Valuation</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifecycle</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap text-xs font-black text-gray-900 tracking-tighter font-mono">
                        {invoice.reference}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900 leading-tight">
                        {invoice.customer_name || 'NO IDENTITY'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase">
                          <Clock className="text-gray-300 mr-2" size={12} />
                          {formatDate(invoice.created_at)}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase">
                          <Calendar className="text-gray-300 mr-2" size={12} />
                          {formatDate(invoice.due_date)}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[11px] font-bold text-gray-400 max-w-[160px] truncate" title={invoice.service}>
                        {invoice.service || '—'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900 tracking-tight">
                        Rs {Number(invoice.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${statusBadge(invoice.status)}`}>
                          {invoice.status || 'Pending'}
                        </span>
                      </td>

                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openViewModal(invoice); }}
                            className="p-2 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                            title="X-Ray View"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openEditModal(invoice); }}
                            className="p-2 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                            title="Registry Modification"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePaid(invoice); }}
                            disabled={togglingId === invoice.id}
                            className="p-2 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all disabled:opacity-40"
                            title={invoice.status === 'Paid' ? 'Revert to Pending' : 'Finalize Payment'}
                          >
                            {togglingId === invoice.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : <CheckCircle size={16} className={invoice.status === 'Paid' ? 'text-green-500' : ''} />
                            }
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDownload(invoice); }}
                            className="p-2 text-gray-300 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-all"
                            title="Export Artifact"
                          >
                            <Download size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSendInvoice(invoice); }}
                            className="p-2 text-gray-300 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all"
                            title="Dispatch to Client"
                          >
                            <Send size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteInvoice(invoice.id); }}
                            className="p-2 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                            title="Terminate Invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <FileText className="text-gray-300" size={48} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No invoices found</h3>
                <p className="text-gray-500 max-w-xs mt-2 mx-auto">
                  Bill your customers professionally. Generate, track, and send invoices.
                </p>
                <Button
                  onClick={() => { setFormData(genDefaultForm()); setShowModal(true); }}
                  className="mt-6 bg-brand-red text-white"
                >
                  Create Your First Invoice
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredInvoices.length > invoicesPerPage && (
            <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 border-t border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-white border border-gray-100 rounded-xl disabled:opacity-30 shadow-sm hover:border-gray-300 transition-all font-bold text-xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-white border border-gray-100 rounded-xl disabled:opacity-30 shadow-sm hover:border-gray-300 transition-all font-bold text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          VIEW Invoice Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Invoice Details"
        size="lg"
      >
        {viewingInvoice && (
          <div className="space-y-4">

            {/* Header strip */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="text-lg font-black text-gray-900 font-mono">{viewingInvoice.reference}</p>
                <p className="text-xs text-gray-400 mt-0.5">Issued {formatDate(viewingInvoice.created_at)}</p>
              </div>
              <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${statusBadge(viewingInvoice.status)}`}>
                {viewingInvoice.status || 'Pending'}
              </span>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-3">

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <User size={10} className="mr-1" /> Customer
                </div>
                <p className="text-sm font-bold text-gray-800">{viewingInvoice.customer_name || '—'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <CreditCard size={10} className="mr-1" /> Amount
                </div>
                <p className="text-lg font-black text-gray-900">
                  Rs {Number(viewingInvoice.amount || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <FileText size={10} className="mr-1" /> Service / Description
                </div>
                <p className="text-sm font-semibold text-gray-800">{viewingInvoice.service || '—'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Calendar size={10} className="mr-1" /> Due Date
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatDate(viewingInvoice.due_date)}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Hash size={10} className="mr-1" /> Reference
                </div>
                <p className="text-xs font-mono text-gray-700">{viewingInvoice.reference}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Clock size={10} className="mr-1" /> Created
                </div>
                <p className="text-xs text-gray-500">
                  {viewingInvoice.created_at ? new Date(viewingInvoice.created_at).toLocaleString() : '—'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <button
                onClick={() => handleDownload(viewingInvoice)}
                className="px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 border border-purple-100 rounded-xl hover:bg-purple-100 transition-all flex items-center gap-1.5"
              >
                <Download size={14} /> Download
              </button>
              <button
                onClick={() => { setShowViewModal(false); openEditModal(viewingInvoice); }}
                className="px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-1.5"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
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
          EDIT Invoice Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Invoice"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              name="customer_name"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium"
              value={editFormData.customer_name || ''}
              onChange={handleEditChange}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Service / Description
            </label>
            <input
              type="text"
              name="service"
              required
              placeholder="e.g. VIP Lounge Access"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium"
              value={editFormData.service || ''}
              onChange={handleEditChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (Rs)</label>
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold"
                value={editFormData.amount || ''}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select
                name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-bold text-sm text-gray-700"
                value={editFormData.status || 'Pending'}
                onChange={handleEditChange}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</label>
            <input
              type="date"
              name="due_date"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
              value={editFormData.due_date || ''}
              onChange={handleEditChange}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={editLoading}
              className="bg-brand-red text-white px-8 py-2.5 rounded-xl shadow-lg shadow-red-100 flex items-center font-bold"
            >
              {editLoading && <Loader2 className="animate-spin mr-2" size={16} />}
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          CREATE Invoice Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Invoice"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reference #</label>
              <input
                type="text"
                name="reference"
                required
                readOnly
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none font-mono text-sm"
                value={formData.reference}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Due Date</label>
              <input
                type="date"
                name="due_date"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Customer</label>
            <select
              name="customer_id"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-bold text-sm text-gray-700"
              value={formData.customer_id}
              onChange={handleInputChange}
            >
              <option value="">Select a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service / Description</label>
            <input
              type="text"
              name="service"
              required
              placeholder="e.g. VIP Lounge Access + Airport Pickup"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium"
              value={formData.service}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount (Rs)</label>
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select
                name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-bold text-sm text-gray-700"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-brand-red text-white px-8 py-2.5 rounded-xl shadow-lg shadow-red-100 flex items-center font-bold"
            >
              {formLoading && <Loader2 className="animate-spin mr-2" size={16} />}
              Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Invoices;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import {
  Search, Plus, Trash2, Eye, Calendar, MapPin, Loader2, RefreshCw,
  Star, Coffee, Plane, Sun, DollarSign, Users, Edit2, CheckCircle,
  XCircle, Clock, User, Mail, Hash, Tag, CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(8);

  // — Add Booking Modal —
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    activity_type: 'Lounge',
    activity_name: '',
    start_date: '',
    amount: '',
    status: 'Pending'
  });

  // — View Booking Modal —
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  // — Edit Booking Modal —
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    activity_type: '',
    activity_name: '',
    start_date: '',
    amount: '',
    status: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // — Status toggle loading —
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('relation "public.bookings" does not exist')) {
          setBookings([]);
        } else {
          throw error;
        }
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showAlert('Database Error', 'Failed to load bookings from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers for select:', err);
    }
  };

  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'lounge': return <Coffee size={14} className="text-amber-500" />;
      case 'hotel': return <Star size={14} className="text-blue-500" />;
      case 'tour': return <MapPin size={14} className="text-green-500" />;
      case 'cruise': return <Plane size={14} className="text-sky-500" />;
      default: return <Sun size={14} className="text-orange-500" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Confirmed') return 'bg-green-50 text-green-700 border-green-100';
    if (status === 'Pending') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    return 'bg-red-50 text-red-700 border-red-100';
  };

  // ─── Add Booking ──────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    if (!formData.customer_id) {
      showAlert('Required', 'Please select a customer for this booking', 'warning');
      setFormLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      showAlert('Success', 'Booking created successfully');
      setShowModal(false);
      setFormData({
        customer_id: '',
        activity_type: 'Lounge',
        activity_name: '',
        start_date: '',
        amount: '',
        status: 'Pending'
      });
      fetchBookings();
    } catch (err) {
      showAlert('Action Failed', err.message || 'Error creating booking', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── View Booking ─────────────────────────────────────────────────────────
  const openViewModal = (booking) => {
    setViewingBooking(booking);
    setShowViewModal(true);
  };

  // ─── Edit Booking ─────────────────────────────────────────────────────────
  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setEditFormData({
      activity_type: booking.activity_type || 'Lounge',
      activity_name: booking.activity_name || booking.lounge_name || '',
      start_date: booking.start_date || '',
      amount: booking.total_amount || booking.amount || '',
      status: booking.status || 'Pending'
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
        .from('bookings')
        .update({
          activity_type: editFormData.activity_type,
          activity_name: editFormData.activity_name,
          start_date: editFormData.start_date,
          amount: parseFloat(editFormData.amount) || 0,
          status: editFormData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      showAlert('Updated', 'Booking updated successfully');
      setShowEditModal(false);
      fetchBookings();
    } catch (err) {
      showAlert('Update Failed', err.message || 'Error updating booking', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Quick Status Toggle ──────────────────────────────────────────────────
  const cycleStatus = async (booking) => {
    const next = {
      Pending: 'Confirmed',
      Confirmed: 'Cancelled',
      Cancelled: 'Pending'
    };
    const nextStatus = next[booking.status] || 'Pending';

    setTogglingId(booking.id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', booking.id);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => b.id === booking.id ? { ...b, status: nextStatus } : b)
      );
    } catch (err) {
      showAlert('Error', 'Could not update booking status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Delete Booking ───────────────────────────────────────────────────────
  const deleteBooking = async (id) => {
    const result = await showConfirm(
      'Delete Booking?',
      'This will permanently cancel and remove this booking from the global database.'
    );

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showAlert('Success', 'Booking deleted successfully');
      setBookings(bookings.filter(booking => booking.id !== id));
    } catch (error) {
      showAlert('Error', 'Error deleting booking', 'error');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // ─── Filter + Pagination ──────────────────────────────────────────────────
  const filteredBookings = bookings.filter(booking => {
    const customerFullName = booking.customers
      ? `${booking.customers.first_name} ${booking.customers.last_name}`.toLowerCase()
      : (booking.customer?.toLowerCase() || 'guest');

    return customerFullName.includes(searchTerm.toLowerCase()) ||
      (booking.activity_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.id?.toString() || '').includes(searchTerm);
  });

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchBookings}
            className="flex items-center gap-2 border-gray-200"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
          <Link to="/bookings/create">
            <Button className="bg-brand-red hover:opacity-90 text-white flex items-center">
              <Plus size={18} className="mr-2" />
              Add Booking
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Global Bookings List</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or activity..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-red mb-4" size={40} />
                <p className="text-gray-500">Retrieving relational data...</p>
              </div>
            ) : currentBookings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {currentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-gray-300">
                        {booking.id?.toString().slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-left">
                          <div className="h-8 w-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 mr-3">
                            {booking.customers?.first_name?.charAt(0) || 'G'}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-gray-900">
                              {booking.customers
                                ? `${booking.customers.first_name} ${booking.customers.last_name}`
                                : (booking.customer || 'Guest User')}
                            </div>
                            <div className="text-[10px] text-gray-400">{booking.customers?.email || booking.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center text-sm font-medium text-gray-700">
                          <span className="mr-2">{getActivityIcon(booking.activity_type)}</span>
                          {booking.activity_name || booking.lounge_name || 'Generic Booking'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{booking.activity_type || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-left">
                        <div className="flex items-center">
                          <Calendar className="text-gray-300 mr-2" size={14} />
                          {formatDate(booking.start_date || booking.date || booking.created_at)}
                        </div>
                        {(booking.start_time) && (
                          <div className="flex items-center mt-1 text-[10px] text-gray-400 font-medium ml-5">
                            {booking.start_time} - {booking.end_time || 'Done'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 text-left">
                        Rs {(booking.total_amount || booking.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full border ${getStatusBadge(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>

                      {/* ── CRUD Action Buttons ── */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-1">

                          {/* View */}
                          <button
                            onClick={() => openViewModal(booking)}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                            title="View booking details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(booking)}
                            className="text-gray-400 hover:text-amber-500 transition-colors p-1.5 rounded-lg hover:bg-amber-50"
                            title="Edit booking"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Quick Status Toggle */}
                          <button
                            onClick={() => cycleStatus(booking)}
                            disabled={togglingId === booking.id}
                            className="text-gray-400 hover:text-green-500 transition-colors p-1.5 rounded-lg hover:bg-green-50 disabled:opacity-40"
                            title={`Cycle status → ${booking.status === 'Pending' ? 'Confirmed' : booking.status === 'Confirmed' ? 'Cancelled' : 'Pending'}`}
                          >
                            {togglingId === booking.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : booking.status === 'Confirmed'
                                ? <XCircle size={16} />
                                : <CheckCircle size={16} />
                            }
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="text-gray-400 hover:text-brand-red transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete booking"
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
                  <Calendar className="text-gray-300" size={48} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
                <p className="text-gray-500 max-w-xs mt-2 mx-auto">
                  Sync with the database to see live bookings across all activities.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-gray-200 hover:bg-gray-50"
                  onClick={fetchBookings}
                >
                  Refresh Database
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredBookings.length > bookingsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <div className="text-sm text-gray-500 font-medium text-left">
                Showing <span className="text-gray-900 font-bold">{currentBookings.length}</span> of <span className="text-gray-900 font-bold">{filteredBookings.length}</span> global results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          VIEW Booking Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Booking Details"
        size="lg"
      >
        {viewingBooking && (
          <div className="space-y-5">
            {/* Header strip */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-sm font-black text-gray-500 shadow-sm">
                  {viewingBooking.customers?.first_name?.charAt(0) || 'G'}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">
                    {viewingBooking.customers
                      ? `${viewingBooking.customers.first_name} ${viewingBooking.customers.last_name}`
                      : viewingBooking.customer || 'Guest User'}
                  </p>
                  <p className="text-[11px] text-gray-400">{viewingBooking.customers?.email || viewingBooking.customer_email || '—'}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(viewingBooking.status)}`}>
                {viewingBooking.status || 'Pending'}
              </span>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-3">

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Hash size={10} className="mr-1" /> Booking ID
                </div>
                <p className="text-xs font-mono text-gray-700">{viewingBooking.id?.toString().slice(0, 8) || '—'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Tag size={10} className="mr-1" /> Activity Type
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  {getActivityIcon(viewingBooking.activity_type)}
                  {viewingBooking.activity_type || 'Unknown'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Sun size={10} className="mr-1" /> Activity / Service
                </div>
                <p className="text-sm font-bold text-gray-800">
                  {viewingBooking.activity_name || viewingBooking.lounge_name || 'Generic Booking'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Calendar size={10} className="mr-1" /> Booking Date
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  {formatDate(viewingBooking.start_date || viewingBooking.date || viewingBooking.created_at)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <CreditCard size={10} className="mr-1" /> Amount
                </div>
                <p className="text-sm font-black text-gray-900">
                  Rs {(viewingBooking.total_amount || viewingBooking.amount || 0).toFixed(2)}
                </p>
              </div>

              {viewingBooking.start_time && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    <Clock size={10} className="mr-1" /> Time Slot
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    {viewingBooking.start_time} – {viewingBooking.end_time || 'Open'}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Clock size={10} className="mr-1" /> Created
                </div>
                <p className="text-xs text-gray-500">
                  {viewingBooking.created_at ? new Date(viewingBooking.created_at).toLocaleString() : '—'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <button
                onClick={() => { setShowViewModal(false); openEditModal(viewingBooking); }}
                className="px-5 py-2 text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-1.5"
              >
                <Edit2 size={14} /> Edit Booking
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
          EDIT Booking Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Booking"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Activity Type</label>
              <select
                name="activity_type"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-medium text-sm text-gray-800"
                value={editFormData.activity_type}
                onChange={handleEditChange}
              >
                <option value="Lounge">Lounge Access</option>
                <option value="Hotel">Hotel / Resort</option>
                <option value="Activity">Local Activity</option>
                <option value="Tour">Guided Tour</option>
                <option value="Cruise">Ocean Cruise</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select
                name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-medium text-sm text-gray-800"
                value={editFormData.status}
                onChange={handleEditChange}
              >
                <option value="Pending">Pending Payment</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
              <Sun size={12} className="mr-1" /> Activity / Service Name
            </label>
            <input
              type="text"
              name="activity_name"
              required
              placeholder="e.g. Premium Executive Lounge"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
              value={editFormData.activity_name}
              onChange={handleEditChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                <Calendar size={12} className="mr-1" /> Booking Date
              </label>
              <input
                type="date"
                name="start_date"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={editFormData.start_date}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                <DollarSign size={12} className="mr-1" /> Amount (Rs)
              </label>
              <input
                type="number"
                name="amount"
                required
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={editFormData.amount}
                onChange={handleEditChange}
              />
            </div>
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
          ADD Booking Modal
      ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Booking"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
              <Users size={12} className="mr-1" /> Select Customer
            </label>
            <select
              name="customer_id"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-medium text-sm text-gray-800"
              value={formData.customer_id}
              onChange={handleInputChange}
            >
              <option value="">-- Choose a customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Activity Type</label>
              <select
                name="activity_type"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-medium text-sm text-gray-800"
                value={formData.activity_type}
                onChange={handleInputChange}
              >
                <option value="Lounge">Lounge Access</option>
                <option value="Hotel">Hotel / Resort</option>
                <option value="Activity">Local Activity</option>
                <option value="Tour">Guided Tour</option>
                <option value="Cruise">Ocean Cruise</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                <Plus size={12} className="mr-1" /> Status
              </label>
              <select
                name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-medium text-sm text-gray-800"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Pending">Pending Payment</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
              <Sun size={12} className="mr-1" /> Activity / Service Name
            </label>
            <input
              type="text"
              name="activity_name"
              required
              placeholder="e.g. Premium Executive Lounge"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
              value={formData.activity_name}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                <Calendar size={12} className="mr-1" /> Booking Date
              </label>
              <input
                type="date"
                name="start_date"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center">
                <DollarSign size={12} className="mr-1" /> Amount (Mauritius Rupees - Rs)
              </label>
              <input
                type="number"
                name="amount"
                required
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all"
            >
              Discard
            </button>
            <Button
              type="submit"
              disabled={formLoading}
              className="bg-brand-red text-white px-8 py-2.5 rounded-xl shadow-lg shadow-red-100 flex items-center font-bold"
            >
              {formLoading && <Loader2 className="animate-spin mr-2" size={16} />}
              Confirm Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bookings;
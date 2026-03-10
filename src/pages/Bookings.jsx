import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import {
  Search, Plus, Trash2, Eye, Calendar, MapPin, Loader2, RefreshCw,
  Star, Coffee, Plane, Sun, Edit2, CheckCircle, XCircle,
  Hash, Tag, CreditCard, Clock, DollarSign, Users
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
          ),
          booking_items (*)
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
    } catch (error) {
      console.error('Error loading customers:', error);
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
    } catch (error) {
      console.error('Update error:', error);
      showAlert('Update Failed', error.message || 'Error updating booking', 'error');
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
    } catch (error) {
      console.error('Status toggle error:', error);
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
      console.error('Delete error:', error);
      showAlert('Error', 'Failed to delete order', 'error');
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bookings Management</h1>
          <p className="text-gray-400 text-sm font-medium">Coordinate and track global travel luxury reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchBookings}
            className="text-gray-500 border-gray-200 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
          <Link to="/bookings/create">
            <Button className="bg-brand-red hover:opacity-90 text-white flex items-center gap-2 shadow-lg shadow-red-100 font-bold">
              <Plus size={16} />
              Add Booking
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-gray-50 pb-4 bg-white px-8 pt-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-0 max-w-md">
                <Search className="absolute left-3 top-3 text-gray-300" size={16} />
                <input
                  type="text"
                  placeholder="Query global reservations…"
                  className="pl-9 pr-9 py-2.5 w-full border border-gray-100 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{filteredBookings.length} Entries Found</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto min-h-[400px] -mx-4 sm:mx-0 px-4 sm:px-0">
            {loading ? (
              <div className="py-32 flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing with Registry...</p>
              </div>
            ) : currentBookings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/30">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Reservation ID</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Specification</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Scheduled For</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Rate</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{booking.id?.toString().slice(0, 8)}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center text-left gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 shrink-0">
                            {booking.customers?.first_name?.charAt(0) || 'G'}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-black text-gray-900 leading-tight">
                              {booking.customers
                                ? `${booking.customers.first_name} ${booking.customers.last_name}`
                                : (booking.customer || 'Guest User')}
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-0.5">{booking.customers?.email || booking.customer_email || 'No registry entry'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-left">
                        <div className="flex items-center text-sm font-black text-gray-900 leading-tight mb-1">
                          <span className="mr-2 shrink-0">{getActivityIcon(booking.activity_type)}</span>
                          <span className="truncate max-w-[180px]">
                            {booking.booking_items && booking.booking_items.length > 1
                              ? `${booking.booking_items[0].product_name} (+${booking.booking_items.length - 1} more)`
                              : (booking.activity_name || booking.lounge_name || 'Generic Booking')}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          {booking.booking_items && booking.booking_items.length > 1
                            ? 'Multi-Service Bundle'
                            : (booking.activity_type || 'Unknown')}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-left text-gray-600">
                        <div className="flex items-center text-xs font-semibold">
                          <Calendar className="text-gray-300 mr-2" size={14} />
                          {formatDate(booking.start_date || booking.date || booking.created_at)}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-left">
                        <p className="text-sm font-black text-brand-red">Rs {(booking.total_amount || booking.amount || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-left">
                        <span className={`px-2.5 py-1 inline-flex text-[9px] font-black uppercase tracking-widest rounded-lg border ${getStatusBadge(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>

                      {/* ── CRUD Action Buttons ── */}
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center gap-1">
                          <button
                            onClick={() => openViewModal(booking)}
                            className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                            title="View Reservation Details"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => openEditModal(booking)}
                            className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                            title="Edit Reservation"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => cycleStatus(booking)}
                            disabled={togglingId === booking.id}
                            className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all disabled:opacity-40"
                            title={`Toggle status → ${booking.status === 'Pending' ? 'Confirmed' : booking.status === 'Confirmed' ? 'Cancelled' : 'Pending'}`}
                          >
                            {togglingId === booking.id
                              ? <Loader2 size={16} className="animate-spin" />
                              : booking.status === 'Confirmed'
                                ? <XCircle size={16} />
                                : <CheckCircle size={16} />
                            }
                          </button>

                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all"
                            title="Archive Reservation"
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

              {viewingBooking.booking_items && viewingBooking.booking_items.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 col-span-2 shadow-sm">
                  <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    <Tag size={12} className="mr-2" /> Detailed Itinerary Specification
                  </div>
                  <div className="space-y-4">
                    {viewingBooking.booking_items.map((it, idx) => (
                      <div key={it.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900">{it.product_name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{it.product_category}</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-gray-900 italic">MUR {Number(it.amount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
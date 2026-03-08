import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Plus, Edit, Trash2, Eye, Calendar, Clock, MapPin, User, Loader2, RefreshCw, Star, Coffee, Plane, Sun, DollarSign, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(8);

  // Add Booking Modal States
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
          console.log('Bookings table not found yet.');
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

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => {
    const customerFullName = booking.customers
      ? `${booking.customers.first_name} ${booking.customers.last_name}`.toLowerCase()
      : (booking.customer?.toLowerCase() || 'guest');

    return customerFullName.includes(searchTerm.toLowerCase()) ||
      (booking.activity_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.id?.toString() || '').includes(searchTerm);
  });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

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
            <Button
              className="bg-brand-red hover:opacity-90 text-white flex items-center"
            >
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
                  placeholder="Seach by name or activity..."
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
                        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full border ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                          booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-400 hover:text-brand-red transition-colors p-1">
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="text-gray-400 hover:text-brand-red transition-colors p-1"
                          >
                            <Trash2 size={18} />
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

      {/* Add Booking Modal */}
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
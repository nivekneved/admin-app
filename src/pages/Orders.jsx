import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Package, Info, Loader2, RefreshCw, Plus, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(8);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    amount: 0,
    status: 'Pending',
    payment_method: 'Credit Card',
    items: [],
    total_items: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('relation "public.orders" does not exist')) {
          setOrders([]);
        } else {
          throw error;
        }
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showAlert('Error', 'Failed to load orders', 'error');
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
      console.error('Error loading customers for orders');
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    (order.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    order.id?.toString().includes(searchTerm) ||
    (order.payment_method?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'customer_id') {
      const customer = customers.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        customer_id: value,
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const deleteOrder = async (id) => {
    const result = await showConfirm(
      'Delete Order?',
      'Are you sure you want to remove this order? This will not affect inventory.'
    );

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showAlert('Success', 'Order deleted successfully');
      fetchOrders();
    } catch (error) {
      showAlert('Error', 'Error deleting order', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .insert([formData]);

      if (error) throw error;

      showAlert('Success', 'Order created successfully');
      closeModal();
      fetchOrders();
    } catch (error) {
      showAlert('Error', error.message || 'Error creating order', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      customer_id: '',
      customer_name: '',
      amount: 0,
      status: 'Pending',
      payment_method: 'Credit Card',
      items: [],
      total_items: 0
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchOrders}
            className="flex items-center gap-2 border-gray-200"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync
          </Button>
          <Link to="/orders/create">
            <Button
              className="bg-brand-red hover:opacity-90 text-white flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Order
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Orders List</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
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
                <p className="text-gray-500 font-medium">Fetching orders...</p>
              </div>
            ) : currentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">#{order.id?.slice(0, 8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Package className="text-gray-400 mr-1" size={14} />
                            {order.total_items || 0} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-1 text-xs font-bold">Rs</span>
                            {Number(order.amount).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${order.status === 'Completed'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : order.status === 'Pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                              : order.status === 'Processing'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : order.status === 'Shipped'
                                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                                  : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="text-gray-400 hover:text-brand-red transition-colors p-1"
                            >
                              <Info size={16} />
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="text-gray-400 hover:text-brand-red transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedOrderId === order.id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50/50">
                            <div className="text-sm text-gray-700">
                              <h4 className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-2">Order Context:</h4>
                              <p><span className="font-medium">Payment:</span> {order.payment_method}</p>
                              <p className="mt-1"><span className="font-medium">Full Identifier:</span> <span className="font-mono text-[10px]">{order.id}</span></p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <Package className="text-gray-300" size={48} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                <p className="text-gray-500 max-w-xs mt-2 mx-auto">
                  Manage your sales and shipments from here. Link them to your global customer base.
                </p>
                <Button
                  onClick={openCreateModal}
                  className="mt-6 bg-brand-red text-white"
                >
                  Create Your First Order
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/30">
              <div className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{indexOfFirstOrder + 1}</span> to <span className="font-bold text-gray-900">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of <span className="font-bold text-gray-900">{filteredOrders.length}</span> orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Create New Order"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Total Amount (Rs)</label>
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
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Total Items</label>
              <input
                type="number"
                name="total_items"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                value={formData.total_items}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select
                name="status"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-bold text-sm text-gray-700"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payment Method</label>
              <select
                name="payment_method"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-bold text-sm text-gray-700"
                value={formData.payment_method}
                onChange={handleInputChange}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
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
              Place Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
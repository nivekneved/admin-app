import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Search, Plus, Edit, Trash2, Mail, Phone, MapPin, Loader2, RefreshCw, UserCheck, UserPlus, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';
import { showAlert, showConfirm } from '../utils/swal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Filter states
    const [filterSubscriber, setFilterSubscriber] = useState('all');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        is_subscriber: false,
        status: 'Active'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.message.includes('relation "public.customers" does not exist')) {

                    setCustomers([]);
                } else {
                    throw error;
                }
            } else {
                setCustomers(data || []);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            showAlert('Database Error', 'Failed to load customers from database', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const deleteCustomer = async (id) => {
        const result = await showConfirm(
            'Delete Customer?',
            'This will permanently remove the customer and all their associated bookings.'
        );

        if (!result.isConfirmed) return;

        try {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showAlert('Success', 'Customer deleted successfully');
            setCustomers(customers.filter(c => c.id !== id));
        } catch (error) {
            showAlert('Action Failed', 'Error deleting customer record', 'error');
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (editingCustomer) {
                const { error } = await supabase
                    .from('customers')
                    .update({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        country: formData.country,
                        is_subscriber: formData.is_subscriber,
                        status: formData.status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingCustomer.id);

                if (error) throw error;
                showAlert('Updated', 'Customer profile updated successfully');
            } else {
                const { error } = await supabase
                    .from('customers')
                    .insert([{
                        ...formData,
                        newsletter_opt_in_date: formData.is_subscriber ? new Date().toISOString() : null
                    }]);

                if (error) throw error;
                showAlert('Success', 'New customer registered successfully');
            }

            closeModal();
            fetchCustomers();
        } catch (error) {
            showAlert('Upload Failed', error.message || 'Error saving customer data', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            (customer.phone?.includes(searchTerm) || '');

        const matchesSubscriber =
            filterSubscriber === 'all' ||
            (filterSubscriber === 'yes' && customer.is_subscriber) ||
            (filterSubscriber === 'no' && !customer.is_subscriber);

        return matchesSearch && matchesSubscriber;
    });

    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            country: customer.country || '',
            is_subscriber: customer.is_subscriber || false,
            status: customer.status || 'Active'
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingCustomer(null);
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            country: '',
            is_subscriber: false,
            status: 'Active'
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCustomer(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customer Management</h1>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchCustomers}
                        className="flex items-center gap-2 border-gray-200"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Sync
                    </Button>
                    <Link to="/customers/create">
                        <Button
                            className="bg-brand-red hover:opacity-90 text-white flex items-center"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Customer
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-red-50/50 border-red-100">
                    <CardContent className="flex items-center p-4">
                        <div className="p-3 bg-red-100 text-brand-red rounded-xl mr-4">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Subscribers</p>
                            <h3 className="text-2xl font-bold text-gray-900">{customers.filter(c => c.is_subscriber).length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50/50 border-green-100">
                    <CardContent className="flex items-center p-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl mr-4">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Customers</p>
                            <h3 className="text-2xl font-bold text-gray-900">{customers.length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/50 border-red-100">
                    <CardContent className="flex items-center p-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl mr-4">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Leads</p>
                            <h3 className="text-2xl font-bold text-gray-900">{customers.filter(c => c.status === 'Lead').length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Global Customers</CardTitle>
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name, email or phone..."
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            <div className="flex items-center bg-gray-50 border rounded-lg px-3">
                                <Filter size={16} className="text-gray-400 mr-2" />
                                <select
                                    className="bg-transparent text-sm focus:outline-none py-2"
                                    value={filterSubscriber}
                                    onChange={(e) => setFilterSubscriber(e.target.value)}
                                >
                                    <option value="all">Every Newsletter State</option>
                                    <option value="yes">Subscribed</option>
                                    <option value="no">Not Subscribed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-brand-red mb-4" size={40} />
                                <p className="text-gray-500 font-medium">Fetching global customer base...</p>
                            </div>
                        ) : currentCustomers.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marketing</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {currentCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 mr-3 border border-gray-100">
                                                        {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{customer.first_name} {customer.last_name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">ID: {customer.id?.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                                    <Mail size={14} className="mr-2 text-gray-400" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center text-[11px] text-gray-500">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    {customer.phone || 'No phone'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <MapPin size={14} className="mr-2 text-gray-400" />
                                                    {customer.country || 'International'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.is_subscriber ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-600 rounded-full border border-green-100">
                                                        Newsletter SUB
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-50 text-gray-400 rounded-full border border-gray-100">
                                                        No Marketing
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${customer.status === 'Active' ? 'bg-red-50 text-brand-red border border-red-100' :
                                                    customer.status === 'Lead' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                        'bg-gray-100 text-gray-400 border border-gray-100'
                                                    }`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(customer)}
                                                        className="text-gray-400 hover:text-brand-red transition-colors p-1"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCustomer(customer.id)}
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
                                    <UserPlus className="text-gray-300" size={48} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No customers found</h3>
                                <p className="text-gray-500 max-w-xs mt-2 mx-auto">
                                    Build your global customer base. Every booking and newsletter signup will appear here.
                                </p>
                                <Button
                                    onClick={openCreateModal}
                                    className="mt-6 bg-brand-red text-white"
                                >
                                    Create Your First Customer
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredCustomers.length > customersPerPage && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                            <div className="text-sm text-gray-500">
                                Displaying <span className="font-bold text-gray-900">{currentCustomers.length}</span> of <span className="font-bold text-gray-900">{filteredCustomers.length}</span> customers
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

            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingCustomer ? 'Modify Customer Profile' : 'Register New Customer'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder="Emma"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder="Johnson"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            disabled={editingCustomer}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50 transition-all font-medium"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="customer@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+230 ..."
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Country</label>
                            <input
                                type="text"
                                name="country"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Mauritius"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Newsletter Subscription</h4>
                            <p className="text-[10px] text-gray-500">Send marketing and seasonal offers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_subscriber"
                                className="sr-only peer"
                                checked={formData.is_subscriber}
                                onChange={handleInputChange}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Global Status</label>
                        <select
                            name="status"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all appearance-none font-bold text-sm text-gray-700"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="Active">Active Customer</option>
                            <option value="Lead">Potential Lead</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Blocked">Blocked</option>
                        </select>
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
                            {editingCustomer ? 'Update Profile' : 'Register Customer'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;

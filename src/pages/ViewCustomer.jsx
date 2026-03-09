import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar, Activity,
    CreditCard, ShoppingBag, Clock, DollarSign, Loader2
} from 'lucide-react';
import { showAlert } from '../utils/swal';

const ViewCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            // Fetch Customer Profile
            const { data: customerData, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single();

            if (customerError) throw customerError;
            setCustomer(customerData);

            // Fetch Related Bookings
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select('*')
                .eq('customer_id', id)
                .order('start_date', { ascending: false });

            if (bookingsError && !bookingsError.message.includes('relation "public.bookings" does not exist')) {
                console.error("Error fetching bookings:", bookingsError);
            } else {
                setBookings(bookingsData || []);
            }

            // Fetch Related Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', id)
                .order('created_at', { ascending: false });

            if (ordersError && !ordersError.message.includes('relation "public.orders" does not exist')) {
                console.error("Error fetching orders:", ordersError);
            } else {
                setOrders(ordersData || []);
            }

        } catch (error) {
            console.error('Error fetching customer data:', error);
            showAlert('Error', 'Failed to load customer details or history', 'error');
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-red mb-4" size={40} />
                <p className="text-gray-500 font-medium">Fetching customer history...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900">Customer Not Found</h2>
                <Button onClick={() => navigate('/customers')} className="mt-4">Back to Customers</Button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/customers')}
                        className="mr-4 p-2 z-10 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Customer Profile</h1>
                        <p className="text-sm text-gray-500">ID: {customer.id}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Profile Card */}
                <div className="lg:col-span-1 border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
                    <div className="h-24 bg-gradient-to-r from-red-600 to-red-400"></div>
                    <div className="relative px-6 pb-6">
                        <div className="absolute -top-12 left-6 bg-white p-1 rounded-full shadow-md">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-2xl font-bold text-brand-red border border-red-200">
                                {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                            </div>
                        </div>

                        <div className="mt-12 text-right absolute right-6 top-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${customer.status === 'Active' ? 'bg-red-50 text-red-600 border border-red-100' :
                                customer.status === 'Lead' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                    'bg-gray-100 text-gray-400 border border-gray-100'
                                }`}>
                                {customer.status}
                            </span>
                        </div>

                        <div className="mt-10">
                            <h2 className="text-xl font-bold text-gray-900">{customer.first_name} {customer.last_name}</h2>
                            <p className="text-sm text-gray-500 mb-6 font-medium">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>

                            <div className="space-y-4">
                                <div className="flex items-center text-sm">
                                    <Mail className="text-gray-400 mr-3" size={18} />
                                    <span className="text-gray-700">{customer.email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Phone className="text-gray-400 mr-3" size={18} />
                                    <span className="text-gray-700">{customer.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <MapPin className="text-gray-400 mr-3" size={18} />
                                    <span className="text-gray-700">{customer.country || 'International'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Activity className="text-gray-400 mr-3" size={18} />
                                    <span className="text-gray-700">{customer.is_subscriber ? 'Newsletter Subscribed' : 'Not Subscribed'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Cards */}
                <div className="lg:col-span-2 space-y-6">

                    <Card>
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center">
                                    <Calendar className="mr-2 text-brand-red" size={20} />
                                    Booking History
                                </CardTitle>
                                <span className="bg-red-100 text-brand-red text-xs px-2 py-1 rounded-full font-bold">{bookings.length} Bookings</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {bookings.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {bookings.map((booking) => (
                                        <div key={booking.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">{booking.activity_type}</span>
                                                    <h3 className="text-sm font-bold text-gray-900">{booking.activity_name}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-gray-900 font-mono">${booking.amount}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 justify-between">
                                                <div className="flex items-center">
                                                    <Clock size={12} className="mr-1" />
                                                    {new Date(booking.start_date).toLocaleDateString()}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                                                        booking.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    No bookings found for this customer.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center">
                                    <ShoppingBag className="mr-2 text-brand-red" size={20} />
                                    Order History
                                </CardTitle>
                                <span className="bg-red-100 text-brand-red text-xs px-2 py-1 rounded-full font-bold">{orders.length} Orders</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {orders.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <div key={order.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase font-mono">ORDER #{order.id.slice(0, 8)}</span>
                                                    <div className="text-sm text-gray-600 mt-1">{order.total_items} items purchased</div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-gray-900 font-mono">${order.amount}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 justify-between">
                                                <div className="flex items-center">
                                                    <CreditCard size={12} className="mr-1" />
                                                    {order.payment_method || 'Unknown'}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                                        order.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-500">
                                    No orders found for this customer.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default ViewCustomer;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Calendar, Users, MapPin, Loader2, Info, CheckCircle2, Coffee, Star, Plane, Sun, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/swal';

const CreateBooking = () => {
    const navigate = useNavigate();
    const [formLoading, setFormLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customer_id: '',
        activity_type: 'Lounge',
        activity_name: '',
        start_date: '',
        amount: '',
        status: 'Pending'
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('id, first_name, last_name, email')
                .order('first_name');
            if (!error) setCustomers(data || []);
        } catch (e) {
            console.error('Error loading customers for bookings');
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
            showAlert('Selection Required', 'Please associate this booking with a verified customer.', 'error');
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

            showAlert('Success', 'Travel itinerary has been reserved and synchronized.', 'success');
            navigate('/bookings');
        } catch (error) {
            console.error('Create Booking Error:', error);
            showAlert('Reservation Failed', error.message || 'Could not finalize booking entry', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'Lounge': return <Coffee size={24} />;
            case 'Hotel': return <Star size={24} />;
            case 'Activity': return <Sun size={24} />;
            case 'Tour': return <MapPin size={24} />;
            case 'Cruise': return <Plane size={24} />;
            default: return <Calendar size={24} />;
        }
    };

    return (
        <div className="w-full h-full min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-6">
                    <Link
                        to="/bookings"
                        className="p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all text-gray-400 hover:text-brand-red shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reserve New Itinerary</h1>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Global Booking Engine / Manual Entry</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-8">
                    <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
                        <div className="h-2 bg-gradient-to-r from-brand-red to-red-600 w-full"></div>
                        <CardHeader className="pt-10 px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-red-50 text-brand-red rounded-3xl">
                                    {getActivityIcon(formData.activity_type)}
                                </div>
                                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Traveler & Service Matrix</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Associated Traveler</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                            <Users size={18} />
                                        </span>
                                        <select
                                            name="customer_id"
                                            required
                                            className="w-full pl-14 pr-10 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 appearance-none"
                                            value={formData.customer_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Search customer profile...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.first_name} {c.last_name} ({c.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Specialized Activity</label>
                                        <div className="relative group">
                                            <select
                                                name="activity_type"
                                                className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 appearance-none"
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
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Itinerary Status</label>
                                        <select
                                            name="status"
                                            className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 appearance-none"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Pending">Pending Confirmation</option>
                                            <option value="Confirmed">Confirmed / Active</option>
                                            <option value="Cancelled">Cancelled / Void</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Destination / Building Name</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                            <MapPin size={18} />
                                        </span>
                                        <input
                                            type="text"
                                            name="activity_name"
                                            required
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                            value={formData.activity_name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Royal Palm Beachcomber Luxury"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Execution Date</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <Calendar size={18} />
                                            </span>
                                            <input
                                                type="date"
                                                name="start_date"
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700"
                                                value={formData.start_date}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Booking Revenue (MUR)</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <DollarSign size={18} />
                                            </span>
                                            <input
                                                type="number"
                                                name="amount"
                                                required
                                                step="0.01"
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 font-mono"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex items-center justify-between border-t border-gray-50">
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Link to="/bookings" className="flex-1 md:flex-none">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full px-8 py-4 border-gray-100 text-gray-400 font-bold rounded-3xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                                            >
                                                Abort
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex-1 md:flex-none bg-brand-red hover:bg-red-700 text-white px-12 py-4 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/20 transition-all font-black uppercase tracking-[0.15em] text-xs hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {formLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-3" size={18} />
                                                    Reserving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={20} className="mr-3" />
                                                    Commit Booking
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-4 space-y-8">
                    <Card className="border-0 shadow-xl shadow-gray-100 rounded-3xl overflow-hidden bg-brand-charcoal text-white">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <Info size={16} className="text-brand-red" /> Dispatch Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center text-brand-red">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-wider text-white">Real-time Scheduler</h5>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Master Plan</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                    Manual bookings are synchronized with our automated travel network. Confirm availability before finalizing the reservation in this hub.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <div className="p-8 bg-red-600/10 rounded-[40px] border border-white/5 relative overflow-hidden text-center">
                                    <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">Matrix Status</h4>
                                    <div className="text-2xl font-black text-white italic">SYCHRONIZED</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-8 bg-red-50 rounded-[40px] border border-red-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-red-100 translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
                            <MapPin size={120} />
                        </div>
                        <div className="relative">
                            <h4 className="text-sm font-black text-red-900 mb-2 uppercase tracking-widest underline decoration-red-200 decoration-4 underline-offset-4">Location Matrix</h4>
                            <p className="text-xs text-red-700/80 font-bold leading-relaxed">
                                Localized itineraries automatically update based on the geolocation of the selected activity service.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBooking;

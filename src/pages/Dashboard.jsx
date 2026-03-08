import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Users, Package, ShoppingCart, Calendar, Loader2, UserCheck, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Counts
      const { count: adminCount } = await supabase.from('admins').select('*', { count: 'exact', head: true });
      const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });

      // 2. Fetch Recent Admins
      const { data: admins } = await supabase
        .from('admins')
        .select('id, username, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(4);

      // 3. Fetch Recent Bookings with Customer Info
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          total_amount,
          amount,
          status,
          activity_type,
          created_at,
          customers (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      // 4. Calculate Total Revenue from all bookings
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('total_amount, amount, status');

      const revenue = (allBookings || [])
        .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
        .reduce((sum, b) => sum + (Number(b.total_amount || b.amount) || 0), 0);

      setStats({
        totalAdmins: adminCount || 0,
        totalCustomers: customerCount || 0,
        totalBookings: allBookings?.length || 0,
        totalRevenue: revenue
      });

      setRecentAdmins(admins || []);
      setRecentBookings(bookings || []);

    } catch (err) {
      console.error('Dashboard Data Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="text-sm text-gray-400 font-medium">Real-time business intelligence & monitoring</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center shadow-sm"
        >
          <span className="mr-2">↻</span> Sync Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="animate-spin text-brand-red mb-4" size={40} />
          <p className="text-gray-500 font-bold">Synchronizing with Global Database...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-50 text-brand-red rounded-2xl">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">System</span>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Admins</h3>
                <div className="text-3xl font-black text-gray-900">{stats.totalAdmins}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                    <UserCheck size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-red-300 uppercase tracking-widest">Growth</span>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Customers</h3>
                <div className="text-3xl font-black text-gray-900">{stats.totalCustomers}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                    <Calendar size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest">Activity</span>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Bookings</h3>
                <div className="text-3xl font-black text-gray-900">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                    <DollarSign size={24} />
                  </div>
                  <div className="flex items-center text-green-500 font-bold text-[10px]">
                    <TrendingUp size={12} className="mr-1" /> LIVE
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue</h3>
                <div className="text-3xl font-black text-gray-900">Rs {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Admins Card */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center">
                  <Users size={16} className="mr-2" /> Recent Admins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto text-left">
                  <table className="min-w-full divide-y divide-gray-50">
                    <tbody className="bg-white divide-y divide-gray-50">
                      {recentAdmins.length > 0 ? recentAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-left">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 mr-3 border border-gray-100">
                                {admin.username?.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-bold text-gray-900">{admin.username}</div>
                                <div className="text-[10px] text-gray-400 font-medium">{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter rounded-full border ${admin.role === 'admin' ? 'bg-red-50 text-brand-red border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                              }`}>
                              {admin.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-gray-400 text-right">
                            {formatDate(admin.created_at)}
                          </td>
                        </tr>
                      )) : (
                        <tr><td className="p-10 text-center text-gray-400 italic">No admin activity.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings Card */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center">
                  <Calendar size={16} className="mr-2" /> Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto text-left">
                  <table className="min-w-full divide-y divide-gray-50">
                    <tbody className="bg-white divide-y divide-gray-50 text-left">
                      {recentBookings.length > 0 ? recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-left">
                              <div className="text-sm font-bold text-gray-900">
                                {booking.customers
                                  ? `${booking.customers.first_name} ${booking.customers.last_name}`
                                  : 'Guest Traveler'}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{booking.activity_type}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-black text-gray-900">Rs {(booking.total_amount || booking.amount || 0).toFixed(2)}</div>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter rounded-full border ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                              booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                'bg-red-50 text-red-700 border-red-100'
                              }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td className="p-10 text-center text-gray-400 italic">No recent bookings.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
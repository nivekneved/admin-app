import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import {
  Loader2, RefreshCw, TrendingUp, Users, Calendar, CreditCard,
  ShoppingBag, FileText, CheckCircle, Clock, XCircle, BarChart2,
  Activity, Coffee, Star, MapPin, Plane, Sun
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtRs = (n) => `Rs ${Number(n || 0).toLocaleString('en-MU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtNum = (n) => Number(n || 0).toLocaleString();
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusColor = (s) => {
  if (s === 'Confirmed' || s === 'Completed' || s === 'Paid') return 'bg-green-50 text-green-700 border-green-100';
  if (s === 'Pending') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
  if (s === 'Cancelled' || s === 'Overdue') return 'bg-red-50 text-red-700 border-red-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const ActivityIcon = ({ type }) => {
  switch (type?.toLowerCase()) {
    case 'lounge': return <Coffee size={13} className="text-amber-500" />;
    case 'hotel': return <Star size={13} className="text-blue-500" />;
    case 'tour': return <MapPin size={13} className="text-green-500" />;
    case 'cruise': return <Plane size={13} className="text-sky-500" />;
    default: return <Sun size={13} className="text-orange-500" />;
  }
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'red', loading }) => {
  const colors = {
    red: 'bg-red-50 text-brand-red border-red-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
            <Icon size={20} />
          </div>
        </div>
        {loading ? (
          <div className="mt-3 h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
        ) : (
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900">{value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Mini bar chart (CSS-only) ────────────────────────────────────────────────
const MiniBar = ({ value, max, color = 'bg-brand-red' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const Reports = () => {
  const [loading, setLoading] = useState(true);

  // KPIs
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalSubscribers: 0,
    totalOrders: 0,
    totalOrderRevenue: 0,
    totalInvoices: 0,
    totalInvoiceRevenue: 0,
    paidInvoices: 0,
  });

  // Tables
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [topActivities, setTopActivities] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBookingStats(),
        fetchCustomerStats(),
        fetchOrderStats(),
        fetchInvoiceStats(),
        fetchMonthlyBookings(),
        fetchTopActivities(),
        fetchRecentBookings(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Bookings KPIs ──────────────────────────────────────────────────────────
  const fetchBookingStats = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('status, amount, tax_amount, total_amount');

    if (!data) return;

    const total = data.length;
    const confirmed = data.filter(b => b.status === 'Confirmed').length;
    const pending = data.filter(b => b.status === 'Pending').length;
    const cancelled = data.filter(b => b.status === 'Cancelled').length;
    const revenue = data.reduce((sum, b) => sum + Number(b.total_amount || b.amount || 0), 0);

    setStats(prev => ({
      ...prev,
      totalBookings: total,
      confirmedBookings: confirmed,
      pendingBookings: pending,
      cancelledBookings: cancelled,
      totalRevenue: revenue,
    }));

    setStatusBreakdown([
      { label: 'Confirmed', count: confirmed, color: 'bg-green-400' },
      { label: 'Pending', count: pending, color: 'bg-yellow-400' },
      { label: 'Cancelled', count: cancelled, color: 'bg-red-400' },
    ]);
  };

  // ── Customers KPIs ─────────────────────────────────────────────────────────
  const fetchCustomerStats = async () => {
    const { data } = await supabase
      .from('customers')
      .select('is_subscriber');

    if (!data) return;
    setStats(prev => ({
      ...prev,
      totalCustomers: data.length,
      totalSubscribers: data.filter(c => c.is_subscriber).length,
    }));
  };

  // ── Orders KPIs ────────────────────────────────────────────────────────────
  const fetchOrderStats = async () => {
    const { data } = await supabase
      .from('orders')
      .select('amount');

    if (!data) return;
    setStats(prev => ({
      ...prev,
      totalOrders: data.length,
      totalOrderRevenue: data.reduce((s, o) => s + Number(o.amount || 0), 0),
    }));
  };

  // ── Invoices KPIs ──────────────────────────────────────────────────────────
  const fetchInvoiceStats = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('amount, status');

    if (!data) return;
    setStats(prev => ({
      ...prev,
      totalInvoices: data.length,
      totalInvoiceRevenue: data.reduce((s, i) => s + Number(i.amount || 0), 0),
      paidInvoices: data.filter(i => i.status === 'Paid').length,
    }));
  };

  // ── Monthly Bookings (last 6 months) ──────────────────────────────────────
  const fetchMonthlyBookings = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('bookings')
      .select('created_at, total_amount, amount')
      .gte('created_at', sixMonthsAgo.toISOString());

    if (!data) return;

    // Group by month
    const map = {};
    data.forEach(b => {
      const d = new Date(b.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), count: 0, revenue: 0 };
      map[key].count += 1;
      map[key].revenue += Number(b.total_amount || b.amount || 0);
    });

    // Fill in empty months within the last 6
    const rows = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      rows.push(map[key] || { month: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), count: 0, revenue: 0 });
    }
    setMonthlyBookings(rows);
  };

  // ── Top Activities ─────────────────────────────────────────────────────────
  const fetchTopActivities = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('activity_type, activity_name, total_amount, amount');

    if (!data) return;

    const map = {};
    data.forEach(b => {
      const key = b.activity_name || b.lounge_name || 'Unknown';
      if (!map[key]) map[key] = { name: key, type: b.activity_type, count: 0, revenue: 0 };
      map[key].count += 1;
      map[key].revenue += Number(b.total_amount || b.amount || 0);
    });

    const sorted = Object.values(map).sort((a, b) => b.count - a.count).slice(0, 7);
    setTopActivities(sorted);
  };

  // ── Recent Bookings ────────────────────────────────────────────────────────
  const fetchRecentBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, status, activity_name, activity_type, amount, total_amount, created_at,
        customers ( first_name, last_name )
      `)
      .order('created_at', { ascending: false })
      .limit(8);

    if (!data) return;
    setRecentBookings(data);
  };

  const maxCount = monthlyBookings.reduce((m, r) => Math.max(m, r.count), 0);
  const maxRevenue = monthlyBookings.reduce((m, r) => Math.max(m, r.revenue), 0);
  const maxActivity = topActivities.reduce((m, r) => Math.max(m, r.count), 0);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports &amp; Summary</h1>
          <p className="text-sm text-gray-400 mt-0.5">Live data from your Supabase database</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 border-gray-200"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Calendar} label="Total Bookings" value={fmtNum(stats.totalBookings)} color="red" loading={loading} />
        <StatCard icon={TrendingUp} label="Booking Revenue" value={fmtRs(stats.totalRevenue)} color="green" loading={loading} />
        <StatCard icon={Users} label="Total Customers" value={fmtNum(stats.totalCustomers)} color="blue" loading={loading}
          sub={`${fmtNum(stats.totalSubscribers)} subscribers`} />
        <StatCard icon={ShoppingBag} label="Total Orders" value={fmtNum(stats.totalOrders)} color="purple" loading={loading}
          sub={fmtRs(stats.totalOrderRevenue)} />
        <StatCard icon={CheckCircle} label="Confirmed" value={fmtNum(stats.confirmedBookings)} color="green" loading={loading} />
        <StatCard icon={Clock} label="Pending" value={fmtNum(stats.pendingBookings)} color="amber" loading={loading} />
        <StatCard icon={XCircle} label="Cancelled" value={fmtNum(stats.cancelledBookings)} color="red" loading={loading} />
        <StatCard icon={FileText} label="Invoices" value={fmtNum(stats.totalInvoices)} color="blue" loading={loading}
          sub={`${fmtNum(stats.paidInvoices)} paid`} />
      </div>

      {/* ── Two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Monthly Trend (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 size={16} className="text-brand-red" />
              Monthly Bookings — Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-end gap-3 h-40">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-100 animate-pulse rounded-t-lg" style={{ height: `${30 + i * 12}%` }} />
                ))}
              </div>
            ) : monthlyBookings.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No booking data yet</div>
            ) : (
              <>
                {/* Bar chart */}
                <div className="flex items-end gap-2 h-40 mb-3">
                  {monthlyBookings.map((row, i) => {
                    const h = maxCount > 0 ? Math.max((row.count / maxCount) * 100, 4) : 4;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex justify-center">
                          <div
                            className="w-full bg-brand-red/80 hover:bg-brand-red rounded-t-md transition-all cursor-default"
                            style={{ height: `${(h / 100) * 140}px` }}
                          />
                          <span className="absolute -top-5 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {row.count}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">{row.month}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Table below chart */}
                <div className="border-t border-gray-50 pt-4 overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="text-left pb-2">Month</th>
                        <th className="text-right pb-2">Bookings</th>
                        <th className="text-right pb-2">Revenue</th>
                        <th className="text-right pb-2">Avg / Booking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {monthlyBookings.map((row, i) => (
                        <tr key={i} className="text-sm">
                          <td className="py-2 font-semibold text-gray-700">{row.month} {row.year}</td>
                          <td className="py-2 text-right font-bold text-gray-900">{row.count}</td>
                          <td className="py-2 text-right text-gray-700">{fmtRs(row.revenue)}</td>
                          <td className="py-2 text-right text-gray-400 text-xs">
                            {row.count > 0 ? fmtRs(row.revenue / row.count) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown (1/3 width) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={16} className="text-brand-red" />
              Booking Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-5">
                {statusBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-700">{s.label}</span>
                      <span className="font-black text-gray-900">{fmtNum(s.count)}</span>
                    </div>
                    <MiniBar value={s.count} max={stats.totalBookings} color={s.color} />
                  </div>
                ))}

                {stats.totalBookings === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">No bookings in database yet</p>
                )}

                {/* Totals summary */}
                {stats.totalBookings > 0 && (
                  <div className="border-t border-gray-50 pt-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Total Revenue</span>
                      <span className="font-black text-gray-900">{fmtRs(stats.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Avg per Booking</span>
                      <span className="font-bold text-gray-700">
                        {stats.totalBookings > 0 ? fmtRs(stats.totalRevenue / stats.totalBookings) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Invoice Revenue</span>
                      <span className="font-bold text-gray-700">{fmtRs(stats.totalInvoiceRevenue)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-red" />
              Top Activities by Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />)}
              </div>
            ) : topActivities.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No activity data yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="text-left pb-3">#</th>
                      <th className="text-left pb-3">Activity</th>
                      <th className="text-right pb-3">Bookings</th>
                      <th className="text-right pb-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topActivities.map((row, i) => (
                      <tr key={i} className="group">
                        <td className="py-2.5 text-xs font-bold text-gray-300 pr-3">{i + 1}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <ActivityIcon type={row.type} />
                            <div>
                              <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">{row.name}</p>
                              <MiniBar value={row.count} max={maxActivity} color="bg-brand-red" />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-sm font-black text-gray-900">{row.count}</td>
                        <td className="py-2.5 text-right text-xs text-gray-500">{fmtRs(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-red" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-50">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="text-left pb-3">Customer</th>
                      <th className="text-left pb-3">Activity</th>
                      <th className="text-right pb-3">Amount</th>
                      <th className="text-right pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {b.customers?.first_name?.charAt(0) || 'G'}
                            </div>
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[80px]">
                              {b.customers
                                ? `${b.customers.first_name} ${b.customers.last_name}`
                                : 'Guest'}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate max-w-[100px]">
                            <ActivityIcon type={b.activity_type} />
                            {b.activity_name || '—'}
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-xs font-black text-gray-900">
                          Rs {Number(b.total_amount || b.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColor(b.status)}`}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Reports;
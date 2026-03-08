import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { mockStats } from '../services/mockData';

const Reports = () => {
  // Sample data for report tables
  const revenueData = [
    { month: 'January', revenue: 18000, expenses: 12000, profit: 6000 },
    { month: 'February', revenue: 22000, expenses: 14000, profit: 8000 },
    { month: 'March', revenue: 19500, expenses: 13500, profit: 6000 },
    { month: 'April', revenue: 25000, expenses: 15000, profit: 10000 },
    { month: 'May', revenue: 28000, expenses: 16500, profit: 11500 },
    { month: 'June', revenue: 32000, expenses: 18000, profit: 14000 },
  ];

  const loungeUsageData = [
    { lounge: 'Premium Lounge A', bookings: 1200 },
    { lounge: 'Business Lounge', bookings: 950 },
    { lounge: 'VIP Lounge', bookings: 800 },
    { lounge: 'Premium Lounge B', bookings: 750 },
    { lounge: 'Executive Suite', bookings: 600 },
    { lounge: 'Wellness Zone', bookings: 550 },
    { lounge: 'Presidential Suite', bookings: 400 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports & Summary</h1>
        <p className="text-gray-600">Summary reports for your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Rs {mockStats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-red">{mockStats.totalBookings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{mockStats.occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {row.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {row.expenses.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {row.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lounge Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lounge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loungeUsageData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.lounge}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
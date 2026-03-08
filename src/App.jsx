import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Bookings from './pages/Bookings';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import CreateAdmin from './pages/CreateAdmin';
import CreateCustomer from './pages/CreateCustomer';
import CreateProduct from './pages/CreateProduct';
import CreateOrder from './pages/CreateOrder';
import CreateBooking from './pages/CreateBooking';
import CreateInvoice from './pages/CreateInvoice';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/users/create" element={<CreateAdmin />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/create" element={<CreateProduct />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/bookings/create" element={<CreateBooking />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/create" element={<CreateOrder />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<CreateInvoice />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
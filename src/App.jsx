import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Bookings from './pages/Bookings';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Team from './pages/Team';
import ManageStaff from './pages/ManageStaff';
import CreateCustomer from './pages/CreateCustomer';
import ViewCustomer from './pages/ViewCustomer';
import CreateProduct from './pages/CreateProduct';
import CreateOrder from './pages/CreateOrder';
import CreateBooking from './pages/CreateBooking';
import CreateInvoice from './pages/CreateInvoice';
import Categories from './pages/Categories';
import HeroSlider from './pages/HeroSlider';
import Reviews from './pages/Reviews';
import FAQs from './pages/FAQs';
import CMS from './pages/CMS';
import Inquiries from './pages/Inquiries';
import Subscribers from './pages/Subscribers';
import News from './pages/News';

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
                    <Route path="/team" element={<Team />} />
                    <Route path="/team/create" element={<ManageStaff />} />
                    <Route path="/team/edit/:id" element={<ManageStaff />} />
                    <Route path="/users" element={<Navigate to="/team" replace />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/create" element={<CreateProduct />} />
                    <Route path="/products/edit/:id" element={<CreateProduct />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/hero-slider" element={<HeroSlider />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/bookings/create" element={<CreateBooking />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/create" element={<CreateOrder />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/invoices/create" element={<CreateInvoice />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/create" element={<CreateCustomer />} />
                    <Route path="/customers/:id" element={<ViewCustomer />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/cms" element={<CMS />} />
                    <Route path="/inquiries" element={<Inquiries />} />
                    <Route path="/subscribers" element={<Subscribers />} />
                    <Route path="/news" element={<News />} />
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
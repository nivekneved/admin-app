import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import MainLayout from './layouts/MainLayout'
import ServicesPage from './pages/ServicesPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'
import './styles/App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={
              <MainLayout>
                <div className="p-6">
                  <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Travel Lounge Dashboard</h1>
                    <p className="text-gray-600">Welcome to the admin panel for managing travel lounge operations.</p>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Services</h3>
                        <p className="text-gray-600">Manage your travel lounge services and offerings</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Customers</h3>
                        <p className="text-gray-600">View and manage customer information</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Bookings</h3>
                        <p className="text-gray-600">Track and manage all reservations</p>
                      </div>
                    </div>
                  </div>
                </div>
              </MainLayout>
            } />
            <Route path="/services" element={
              <MainLayout>
                <ServicesPage />
              </MainLayout>
            } />
            <Route path="/customers" element={
              <MainLayout>
                <CustomersPage />
              </MainLayout>
            } />
            <Route path="/orders" element={
              <MainLayout>
                <OrdersPage />
              </MainLayout>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
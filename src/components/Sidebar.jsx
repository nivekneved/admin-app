import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, Package, ShoppingCart, Settings, LogOut, Home, Calendar, FileText, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert, showConfirm } from '../utils/swal';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await showConfirm(
      'Sign Out?',
      'Are you sure you want to end your current session?',
      'Yes, Logout'
    );

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showAlert('Signed Out', 'You have been successfully logged out.', 'success');
      navigate('/login');
    } catch (error) {
      showAlert('Error', error.message || 'Error logging out', 'error');
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <Home size={20} />
    },
    {
      title: 'Admins',
      path: '/users',
      icon: <Users size={20} />
    },
    {
      title: 'Customers',
      path: '/customers',
      icon: <UserCheck size={20} />
    },
    {
      title: 'Products',
      path: '/products',
      icon: <Package size={20} />
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: <ShoppingCart size={20} />
    },
    {
      title: 'Bookings',
      path: '/bookings',
      icon: <Calendar size={20} />
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: <BarChart2 size={20} />
    },
    {
      title: 'Invoices',
      path: '/invoices',
      icon: <FileText size={20} />
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />
    },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-brand-charcoal text-white z-10 border-r border-white/5">
      <div className="flex flex-col items-center justify-center py-8 px-4 border-b border-white/5 bg-white/5">
        <img src={logo} alt="Travel Lounge" className="h-10 mb-4 brightness-0 invert" />
        <h1 className="text-sm font-bold tracking-widest uppercase text-gray-400">Admin Panel</h1>
      </div>
      <nav className="mt-8 px-4">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${location.pathname === item.path
                  ? 'bg-brand-red text-white shadow-lg shadow-red-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium text-sm">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-400 hover:text-brand-red w-full px-4 py-3 rounded-xl hover:bg-red-500/5 transition-all duration-200 group"
        >
          <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
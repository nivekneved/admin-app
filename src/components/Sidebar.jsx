import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, Package, ShoppingCart, Settings, LogOut, Home, Calendar, FileText, BarChart2, Layers, X, Layout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert, showConfirm } from '../utils/swal';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, setIsOpen }) => {
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
      icon: <Home size={18} />
    },
    {
      title: 'Team & Access',
      path: '/team',
      icon: <Users size={18} />
    },
    {
      title: 'Customers',
      path: '/customers',
      icon: <UserCheck size={18} />
    },
    {
      title: 'Products',
      path: '/products',
      icon: <Package size={18} />
    },
    {
      title: 'Categories',
      path: '/categories',
      icon: <Layers size={18} />
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: <ShoppingCart size={18} />
    },
    {
      title: 'Bookings',
      path: '/bookings',
      icon: <Calendar size={18} />
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: <BarChart2 size={18} />
    },
    {
      title: 'Invoices',
      path: '/invoices',
      icon: <FileText size={18} />
    },
    {
      title: 'Hero Slider',
      path: '/hero-slider',
      icon: <Layout size={18} />
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <Settings size={18} />
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 w-64 bg-brand-charcoal text-white z-30 border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}>


        <div className="flex flex-col items-center justify-center py-5 px-4 border-b border-white/5 bg-white/5 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
            title="Collapse Sidebar"
          >
            <X size={18} />
          </button>
          <img src={logo} alt="Travel Lounge" className="h-8 mb-3 brightness-0 invert" />
          <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500">Security Terminal</h1>
        </div>
        <nav className="mt-4 px-3">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3.5 py-2.5 rounded-xl mb-1 transition-all duration-200 ${location.pathname === item.path
                    ? 'bg-brand-red text-white shadow-lg shadow-red-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="mr-3 shrink-0">{item.icon}</span>
                  <span className="font-bold text-xs uppercase tracking-tight">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-400 hover:text-brand-red w-full px-3.5 py-2.5 rounded-xl hover:bg-red-500/5 transition-all duration-200 group"
          >
            <LogOut size={18} className="mr-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
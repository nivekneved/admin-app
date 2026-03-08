import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Package, ShoppingCart, BarChart3, Settings, LogOut, Home, Calendar, FileText } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      title: 'Dashboard', 
      path: '/', 
      icon: <Home size={20} /> 
    },
    { 
      title: 'Users', 
      path: '/users', 
      icon: <Users size={20} /> 
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
      icon: <BarChart3 size={20} /> 
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
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white z-10">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <h1 className="text-xl font-bold">Travel Lounge Admin</h1>
      </div>
      <nav className="mt-6 px-4">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button className="flex items-center text-red-400 hover:text-red-300 w-full">
          <LogOut size={20} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
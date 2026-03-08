import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Package, ShoppingCart, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Services', path: '/services' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Travel Lounge Admin</h1>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={toggleSidebar}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6">
          <ul>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-6 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'bg-indigo-700 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@travellounge.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
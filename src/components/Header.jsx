import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useState } from 'react';

const Header = ({ toggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button 
            className="mr-4 text-gray-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 px-4 py-2 pl-10 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <span className="font-semibold">AU</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
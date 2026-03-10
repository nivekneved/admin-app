import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 max-w-[100vw] overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-brand-red text-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-lg shadow-red-900/10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-white/70 hover:text-white transition-all duration-300 hover:bg-white/10 rounded-xl mr-2"
              >
                <Menu size={24} />
              </button>
            )}
            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-white/80">Security Cleared Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <img src={logo} alt="Travel Lounge" className="h-8 object-contain" />
          </div>
        </header>

        <main className={`flex-1 p-4 md:p-8 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};


export default Layout;
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 max-w-[100vw] overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Universal Header (for Toggle) */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 text-gray-400 hover:text-brand-red transition-all duration-300 hover:bg-red-50 rounded-xl"
          >
            <Menu size={24} className={isSidebarOpen ? '' : 'rotate-90'} />
          </button>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-400">Security Cleared Admin</span>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300">TL</div>
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
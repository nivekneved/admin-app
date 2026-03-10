import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 max-w-[100vw] overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-brand-red transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Travel Lounge Admin</span>
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300">TL</div>
        </header>

        <main className="flex-1 lg:ml-64 p-4 md:p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};


export default Layout;
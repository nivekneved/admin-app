import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
};


export default Layout;
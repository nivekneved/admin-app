import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-64 bg-gray-50 p-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
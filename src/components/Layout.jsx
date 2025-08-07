import React from 'react';
import Navbar from './navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="min-h-screen pt-20">
        {children}
      </main>
    </div>
  );
};

export default Layout;

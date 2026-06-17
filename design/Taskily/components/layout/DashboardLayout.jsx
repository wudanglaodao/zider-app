'use client';

import { useState } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ 
  children, 
  title = 'Dashboard', 
  description = 'Plan, prioritize, and accomplish your tasks with ease.' 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans selection:bg-green-100 selection:text-green-800">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      <div className="flex-1 h-screen overflow-y-auto bg-gray-50 p-4 lg:p-8 font-sans">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {children}
      </div>
      </div>
    </>
  );
}

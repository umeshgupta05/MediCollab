import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CreateContentFab from './CreateContentFab';
import { useRealtimeSubscriptions } from '../lib/supabase';

export default function Layout() {
  // Initialize realtime subscriptions
  useRealtimeSubscriptions();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <CreateContentFab />
    </div>
  );
}
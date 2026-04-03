'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  timeSlot: {
    date: string;
    startTime: string;
  };
  stylist: {
    name: string;
  };
  service: {
    name: string;
    price: number;
  };
}

interface Stylist {
  id: string;
  name: string;
  specialties: string;
}

export default function OwnerDashboard() {
  const salonId = 'cmnihit4n000011a7t19ji5gv';
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [todaysRevenue, setTodaysRevenue] = useState(0);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const appRes = await fetch(`/api/appointments?salonId=${salonId}`);
      const appData = await appRes.json();
      setAppointments(appData);

      const stylRes = await fetch(`/api/stylists?salonId=${salonId}`);
      const stylData = await stylRes.json();
      setStylists(stylData);

      // Calculate today's metrics
      const today = new Date().toISOString().split('T')[0];
      const todaysApps = appData.filter((app: Appointment) => 
        app.timeSlot.date.split('T')[0] === today &&
        app.status === 'confirmed'
      );

      setTodaysBookings(todaysApps.length);
      setTodaysRevenue(todaysApps.reduce((sum: number, app: Appointment) => sum + app.service.price, 0));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Owner Dashboard</h1>
            <p className="text-gray-600">Glam Salon & Spa Management</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">← Back Home</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'appointments', label: 'Appointments' },
              { id: 'stylists', label: 'Stylists' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Bookings</h3>
                <p className="text-3xl font-bold text-blue-600">{todaysBookings}</p>
                <p className="text-xs text-gray-500 mt-2">appointments confirmed</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Today's Revenue</h3>
                <p className="text-3xl font-bold text-green-600">${todaysRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">from confirmed bookings</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Stylists</h3>
                <p className="text-3xl font-bold text-purple-600">{stylists.length}</p>
                <p className="text-xs text-gray-500 mt-2">active stylists</p>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Appointments (Next 7 Days)</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointments
                  .filter(app => {
                    const appDate = new Date(app.timeSlot.date);
                    const today = new Date();
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return appDate >= today && appDate <= nextWeek && app.status === 'confirmed';
                  })
                  .sort((a, b) => new Date(a.timeSlot.date).getTime() - new Date(b.timeSlot.date).getTime())
                  .slice(0, 10)
                  .map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{app.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {app.stylist.name} • {app.service.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(app.timeSlot.date).toLocaleDateString()} at {app.timeSlot.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${app.service.price}</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{app.customerName}</p>
                    <p className="text-sm text-gray-600">
                      Phone: {app.customerPhone}
                    </p>
                    <p className="text-sm text-gray-600">
                      {app.stylist.name} • {app.service.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(app.timeSlot.date).toLocaleDateString()} at {app.timeSlot.startTime}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold text-green-600">${app.service.price}</p>
                    <span className={`text-xs px-2 py-1 rounded block ${
                      app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stylists Tab */}
        {activeTab === 'stylists' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Stylists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stylists.map(stylist => {
                const stylistApps = appointments.filter(a => a.stylist.name === stylist.name);
                return (
                  <div key={stylist.id} className="p-4 bg-gray-50 rounded border border-gray-200">
                    <h3 className="font-semibold text-gray-900">{stylist.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{stylist.specialties}</p>
                    <div className="text-xs space-y-1 text-gray-500">
                      <p>Total appointments: {stylistApps.length}</p>
                      <p>This month: {stylistApps.filter(a => {
                        const d = new Date(a.timeSlot.date);
                        const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                      }).length}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

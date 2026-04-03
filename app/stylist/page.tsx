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
    endTime: string;
  };
  service: {
    name: string;
    price: number;
  };
}

interface WalkIn {
  id: string;
  customerName: string;
  serviceName: string;
  price: number;
  duration: number;
  createdAt: string;
}

export default function StylistDashboard() {
  const salonId = 'cmnihit4n000011a7t19ji5gv';
  // For this MVP, we'll show data for the first stylist. In production, this would be authenticated
  const stylistId = ''; // Will be set after fetching stylists

  const [stylists, setStylists] = useState<any[]>([]);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    customerName: '',
    serviceName: '',
    price: '',
    duration: '30',
  });

  useEffect(() => {
    fetchStylists();
  }, []);

  const fetchStylists = async () => {
    try {
      const stylRes = await fetch(`/api/stylists?salonId=${salonId}`);
      const stylData = await stylRes.json();
      setStylists(stylData);
      if (stylData.length > 0) {
        setSelectedStylist(stylData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch stylists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedStylist) return;
    fetchAppointmentsAndWalkIns();
  }, [selectedStylist]);

  const fetchAppointmentsAndWalkIns = async () => {
    try {
      const appRes = await fetch(`/api/appointments?stylistId=${selectedStylist}`);
      const appData = await appRes.json();
      setAppointments(appData);

      const walkRes = await fetch(`/api/walkins?stylistId=${selectedStylist}`);
      const walkData = await walkRes.json();
      setWalkIns(walkData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/walkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId,
          stylistId: selectedStylist,
          customerName: walkInForm.customerName,
          serviceName: walkInForm.serviceName,
          price: parseFloat(walkInForm.price),
          duration: parseInt(walkInForm.duration),
          notes: '',
        }),
      });
      setWalkInForm({ customerName: '', serviceName: '', price: '', duration: '30' });
      setShowWalkInForm(false);
      fetchAppointmentsAndWalkIns();
    } catch (error) {
      console.error('Failed to log walk-in:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const todaysAppointments = appointments.filter(app => {
    const appDate = new Date(app.timeSlot.date);
    const today = new Date();
    return appDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pink-900">Stylist Dashboard</h1>
            <p className="text-gray-600">Your Schedule & Walk-ins</p>
          </div>
          <Link href="/" className="text-pink-600 hover:text-pink-800">← Back Home</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stylist Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Select Your Profile</label>
          <select
            value={selectedStylist}
            onChange={(e) => setSelectedStylist(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            {stylists.map(stylist => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex space-x-8">
            {[
              { id: 'schedule', label: 'Today\'s Schedule' },
              { id: 'walkins', label: 'Walk-ins' },
              { id: 'history', label: 'Booking History' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-pink-600 text-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
              {todaysAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments
                    .filter(app => app.status === 'confirmed')
                    .sort((a, b) => a.timeSlot.startTime.localeCompare(b.timeSlot.startTime))
                    .map(app => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-l-4 border-pink-500">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{app.timeSlot.startTime} - {app.timeSlot.endTime}</p>
                          <p className="text-lg font-medium text-gray-800">{app.customerName}</p>
                          <p className="text-sm text-gray-600">{app.service.name}</p>
                          <p className="text-xs text-gray-500">📞 {app.customerPhone || 'No phone'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 text-lg">${app.service.price}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">No appointments scheduled for today</p>
              )}
            </div>

            {/* Upcoming Week */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming This Week</h2>
              <div className="space-y-3">
                {appointments
                  .filter(app => {
                    const appDate = new Date(app.timeSlot.date);
                    const today = new Date();
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return appDate > today && appDate <= nextWeek && app.status === 'confirmed';
                  })
                  .sort((a, b) => new Date(a.timeSlot.date).getTime() - new Date(b.timeSlot.date).getTime())
                  .slice(0, 10)
                  .map(app => (
                    <div key={app.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{app.customerName}</p>
                          <p className="text-sm text-gray-600">{app.service.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(app.timeSlot.date).toLocaleDateString()} at {app.timeSlot.startTime}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">${app.service.price}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Walk-ins Tab */}
        {activeTab === 'walkins' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Log Walk-In</h2>
                <button
                  onClick={() => setShowWalkInForm(!showWalkInForm)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                >
                  {showWalkInForm ? '✕ Cancel' : '+ Add Walk-In'}
                </button>
              </div>

              {showWalkInForm && (
                <form onSubmit={handleAddWalkIn} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={walkInForm.customerName}
                      onChange={(e) => setWalkInForm({...walkInForm, customerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Service</label>
                      <input
                        type="text"
                        required
                        value={walkInForm.serviceName}
                        onChange={(e) => setWalkInForm({...walkInForm, serviceName: e.target.value})}
                        placeholder="e.g., Haircut"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Price ($)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={walkInForm.price}
                        onChange={(e) => setWalkInForm({...walkInForm, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-pink-600 text-white font-medium py-2 rounded-lg hover:bg-pink-700 transition"
                  >
                    Log Walk-In
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Walk-ins</h2>
              {walkIns.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {walkIns.map(walkIn => (
                    <div key={walkIn.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{walkIn.customerName}</p>
                          <p className="text-sm text-gray-600">{walkIn.serviceName} - {walkIn.duration} min</p>
                          <p className="text-xs text-gray-500">
                            {new Date(walkIn.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">${walkIn.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No walk-ins logged yet</p>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments
                .sort((a, b) => new Date(b.timeSlot.date).getTime() - new Date(a.timeSlot.date).getTime())
                .map(app => (
                  <div key={app.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{app.customerName}</p>
                        <p className="text-sm text-gray-600">{app.service.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(app.timeSlot.date).toLocaleDateString()} at {app.timeSlot.startTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 mb-1">${app.service.price}</p>
                        <span className={`text-xs px-2 py-1 rounded block ${
                          app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          app.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stylist {
  id: string;
  name: string;
  specialties: string;
  photoUrl?: string;
  email?: string;
}

interface Service {
  id: string;
  name: string;
  durationMins: number;
  price: number;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
}

export default function BookingPage() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const salonId = 'cmnihit4n000011a7t19ji5gv'; // From seeded data

  // Fetch stylists and services on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const stylistsRes = await fetch(`/api/stylists?salonId=${salonId}`);
        const stylistsData = await stylistsRes.json();
        setStylists(stylistsData);

        const salonRes = await fetch(`/api/salons/${salonId}`);
        const salonData = await salonRes.json();
        setServices(salonData.services);
      } catch (err) {
        setError('Failed to load salon information');
      }
    };
    fetchData();
  }, []);

  // Fetch available slots when date and stylist change
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedStylist || !selectedDate) return;

      try {
        const slotsRes = await fetch(
          `/api/availability?stylistId=${selectedStylist}&date=${selectedDate}`
        );
        const slotsData = await slotsRes.json();
        setAvailableSlots(slotsData);
        setSelectedSlot('');
      } catch (err) {
        setError('Failed to load available times');
      }
    };
    fetchSlots();
  }, [selectedStylist, selectedDate]);

  // Generate next 7 days for date picker
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedService || !customerName || !customerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId,
          stylistId: selectedStylist,
          serviceId: selectedService,
          timeSlotId: selectedSlot,
          customerName,
          customerPhone,
          customerEmail,
          notes: '',
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setCustomerName('');
          setCustomerPhone('');
          setCustomerEmail('');
          setSelectedStylist('');
          setSelectedDate('');
          setSelectedService('');
          setSelectedSlot('');
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to book appointment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-900">Book Your Appointment</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800">← Back Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            ✓ Appointment booked successfully! We'll confirm your booking via phone.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleBooking} className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Selection */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Stylist *
                </label>
                <select
                  value={selectedStylist}
                  onChange={(e) => setSelectedStylist(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a stylist...</option>
                  {stylists.map(stylist => (
                    <option key={stylist.id} value={stylist.id}>
                      {stylist.name} - {stylist.specialties}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Date *
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!selectedStylist}
                  required
                >
                  <option value="">Choose a date...</option>
                  {getNextDays().map(day => (
                    <option key={day} value={day}>
                      {new Date(day).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Time *
                </label>
                {availableSlots.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableSlots.map(slot => (
                      <label key={slot.id} className="flex items-center p-2 border border-gray-200 rounded  hover:bg-purple-50">
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot.id}
                          checked={selectedSlot === slot.id}
                          onChange={(e) => setSelectedSlot(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-sm">{slot.startTime} - {slot.endTime}</span>
                      </label>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <p className="text-gray-500 text-sm">No available times on this date</p>
                ) : (
                  <p className="text-gray-400 text-sm">Select a date first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a service...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.durationMins} min - ${service.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {/* Booking Summary */}
              {selectedStylist && selectedDate && selectedSlot && selectedService && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li><strong>Stylist:</strong> {stylists.find(s => s.id === selectedStylist)?.name}</li>
                    <li><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> {availableSlots.find(s => s.id === selectedSlot)?.startTime}</li>
                    <li><strong>Service:</strong> {services.find(s => s.id === selectedService)?.name}</li>
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !customerName || !customerPhone || !selectedSlot}
                className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-purple-900">Glam Salon & Spa</h1>
          <p className="text-gray-600">Manage your salon, book appointments, track business</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Public Booking */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Book an Appointment</h2>
            <p className="text-gray-600 mb-4">Browse stylists, check availability, and book your appointment</p>
            <Link 
              href="/booking" 
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Book Now →
            </Link>
          </div>

          {/* Owner Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">👨‍💼</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Dashboard</h2>
            <p className="text-gray-600 mb-4">Manage stylists, operating hours, view business analytics</p>
            <Link 
              href="/owner" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard →
            </Link>
          </div>

          {/* Stylist Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-4">💇</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Stylist View</h2>
            <p className="text-gray-600 mb-4">Check your schedule, log walk-ins, see booking history</p>
            <Link 
              href="/stylist" 
              className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
            >
              View Schedule →
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">About Our System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">For Customers</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Browse stylists and their specialties</li>
                <li>View real-time availability</li>
                <li>Book appointments online</li>
                <li>Get instant confirmations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Salon</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Add and manage stylists</li>
                <li>Set operating hours and time slots</li>
                <li>Track all appointments</li>
                <li>Log walk-in services</li>
                <li>View business overview</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2024 Glam Salon & Spa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

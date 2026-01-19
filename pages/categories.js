// pages/categories.js
import Link from 'next/link';

const bikeCategories = [
  {
    type: 'Sport',
    description: 'High-performance motorcycles built for speed and agility',
    icon: '🏁',
    color: 'from-red-500 to-orange-500',
  },
  {
    type: 'Cruiser',
    description: 'Comfortable, laid-back riding position for long distances',
    icon: '🛣️',
    color: 'from-purple-500 to-pink-500',
  },
  {
    type: 'Adventure',
    description: 'Versatile bikes designed for both on-road and off-road',
    icon: '🏔️',
    color: 'from-green-500 to-teal-500',
  },
  {
    type: 'Touring',
    description: 'Long-distance comfort with storage and amenities',
    icon: '🗺️',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    type: 'Standard',
    description: 'Upright seating position, perfect for everyday riding',
    icon: '🏍️',
    color: 'from-gray-600 to-gray-800',
  },
  {
    type: 'Dual-Sport',
    description: 'Street-legal bikes capable of off-road adventures',
    icon: '⛰️',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    type: 'Naked',
    description: 'Minimal fairings, exposed engine, raw riding experience',
    icon: '⚡',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    type: 'Scooter',
    description: 'Easy to ride, automatic transmission, urban mobility',
    icon: '🛵',
    color: 'from-pink-500 to-rose-500',
  },
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse by Category
          </h1>
          <p className="text-xl text-blue-100">
            Find the perfect motorcycle type that matches your riding style
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bikeCategories.map((category) => (
            <Link
              key={category.type}
              href={`/listings?bikeType=${category.type}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                {/* Icon Header with Gradient */}
                <div
                  className={`bg-gradient-to-br ${category.color} p-8 text-center`}
                >
                  <div className="text-6xl mb-2">{category.icon}</div>
                  <h2 className="text-2xl font-bold text-white">
                    {category.type}
                  </h2>
                </div>

                {/* Description */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="text-blue-600 font-semibold group-hover:text-blue-800 transition">
                    View {category.type} Bikes →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Not Sure Which Type?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Each motorcycle category offers unique features and benefits. Consider your
            riding experience, typical routes, and what matters most to you—speed,
            comfort, versatility, or fuel efficiency.
          </p>
          <Link
            href="/listings"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Browse All Motorcycles
          </Link>
        </div>
      </section>
    </div>
  );
}

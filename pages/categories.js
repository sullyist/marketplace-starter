// pages/categories.js
import Link from 'next/link';

const bikeCategories = [
  {
    type: 'Sport',
    description: 'High-performance motorcycles built for speed and agility',
    image: 'https://placehold.co/400x300/1e40af/white?text=Sport+Bike',
  },
  {
    type: 'Cruiser',
    description: 'Comfortable, laid-back riding position for long distances',
    image: 'https://placehold.co/400x300/7c3aed/white?text=Cruiser',
  },
  {
    type: 'Adventure',
    description: 'Versatile bikes designed for both on-road and off-road',
    image: 'https://placehold.co/400x300/059669/white?text=Adventure',
  },
  {
    type: 'Touring',
    description: 'Long-distance comfort with storage and amenities',
    image: 'https://placehold.co/400x300/2563eb/white?text=Touring',
  },
  {
    type: 'Standard',
    description: 'Upright seating position, perfect for everyday riding',
    image: 'https://placehold.co/400x300/4b5563/white?text=Standard',
  },
  {
    type: 'Dual-Sport',
    description: 'Street-legal bikes capable of off-road adventures',
    image: 'https://placehold.co/400x300/ea580c/white?text=Dual+Sport',
  },
  {
    type: 'Naked',
    description: 'Minimal fairings, exposed engine, raw riding experience',
    image: 'https://placehold.co/400x300/0891b2/white?text=Naked',
  },
  {
    type: 'Scooter',
    description: 'Easy to ride, automatic transmission, urban mobility',
    image: 'https://placehold.co/400x300/ec4899/white?text=Scooter',
  },
  {
    type: 'Cafe Racer',
    description: 'Vintage-inspired minimalist styling with retro cool aesthetics',
    image: 'https://placehold.co/400x300/d97706/white?text=Cafe+Racer',
  },
  {
    type: 'Bobber',
    description: 'Stripped-down custom cruisers with minimal bodywork',
    image: 'https://placehold.co/400x300/475569/white?text=Bobber',
  },
  {
    type: 'Chopper',
    description: 'Extended front forks, custom builds, classic American style',
    image: 'https://placehold.co/400x300/dc2626/white?text=Chopper',
  },
  {
    type: 'Streetfighter',
    description: 'Aggressive naked sport bikes with upright riding position',
    image: 'https://placehold.co/400x300/be123c/white?text=Streetfighter',
  },
  {
    type: 'Supermoto',
    description: 'Dual-sport bikes with street tires, great for urban riding',
    image: 'https://placehold.co/400x300/65a30d/white?text=Supermoto',
  },
  {
    type: 'Electric',
    description: 'Zero emissions electric motorcycles for eco-conscious riders',
    image: 'https://placehold.co/400x300/059669/white?text=Electric',
  },
  {
    type: 'Sport Touring',
    description: 'Combines sport bike performance with touring comfort',
    image: 'https://placehold.co/400x300/7c3aed/white?text=Sport+Touring',
  },
  {
    type: 'Enduro',
    description: 'Lightweight off-road racing bikes for trail riding',
    image: 'https://placehold.co/400x300/f59e0b/white?text=Enduro',
  },
  {
    type: 'Dirt Bike',
    description: 'Pure off-road motorcycles, not street legal',
    image: 'https://placehold.co/400x300/92400e/white?text=Dirt+Bike',
  },
  {
    type: 'Vintage/Classic',
    description: 'Older collectible motorcycles with timeless appeal',
    image: 'https://placehold.co/400x300/57534e/white?text=Vintage',
  },
  {
    type: 'Moped',
    description: 'Lower cc bikes, sometimes pedal-assisted for city commuting',
    image: 'https://placehold.co/400x300/0284c7/white?text=Moped',
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
                {/* Motorcycle Image */}
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.type}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h2 className="text-2xl font-bold text-white">
                      {category.type}
                    </h2>
                  </div>
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

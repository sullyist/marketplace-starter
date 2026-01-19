// pages/categories.js
import Link from 'next/link';

const bikeCategories = [
  {
    type: 'Sport',
    description: 'High-performance motorcycles built for speed and agility',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=300&fit=crop',
  },
  {
    type: 'Cruiser',
    description: 'Comfortable, laid-back riding position for long distances',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=300&fit=crop',
  },
  {
    type: 'Adventure',
    description: 'Versatile bikes designed for both on-road and off-road',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=300&fit=crop',
  },
  {
    type: 'Touring',
    description: 'Long-distance comfort with storage and amenities',
    image: 'https://images.unsplash.com/photo-1623121963734-d5999a59a97f?w=400&h=300&fit=crop',
  },
  {
    type: 'Standard',
    description: 'Upright seating position, perfect for everyday riding',
    image: 'https://images.unsplash.com/photo-1609103092597-a68d2f87c5c9?w=400&h=300&fit=crop',
  },
  {
    type: 'Dual-Sport',
    description: 'Street-legal bikes capable of off-road adventures',
    image: 'https://images.unsplash.com/photo-1558980664-1db506751ab4?w=400&h=300&fit=crop',
  },
  {
    type: 'Naked',
    description: 'Minimal fairings, exposed engine, raw riding experience',
    image: 'https://images.unsplash.com/photo-1568772607822-e10f5e0eb05c?w=400&h=300&fit=crop',
  },
  {
    type: 'Scooter',
    description: 'Easy to ride, automatic transmission, urban mobility',
    image: 'https://images.unsplash.com/photo-1583979620597-c2f9b2d54e7f?w=400&h=300&fit=crop',
  },
  {
    type: 'Cafe Racer',
    description: 'Vintage-inspired minimalist styling with retro cool aesthetics',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
  {
    type: 'Bobber',
    description: 'Stripped-down custom cruisers with minimal bodywork',
    image: 'https://images.unsplash.com/photo-1599819177626-c0c3dd4eaa6a?w=400&h=300&fit=crop',
  },
  {
    type: 'Chopper',
    description: 'Extended front forks, custom builds, classic American style',
    image: 'https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=400&h=300&fit=crop',
  },
  {
    type: 'Streetfighter',
    description: 'Aggressive naked sport bikes with upright riding position',
    image: 'https://images.unsplash.com/photo-1609069497226-47e0110e4ac0?w=400&h=300&fit=crop',
  },
  {
    type: 'Supermoto',
    description: 'Dual-sport bikes with street tires, great for urban riding',
    image: 'https://images.unsplash.com/photo-1568772607733-91956d25e7ba?w=400&h=300&fit=crop',
  },
  {
    type: 'Electric',
    description: 'Zero emissions electric motorcycles for eco-conscious riders',
    image: 'https://images.unsplash.com/photo-1622551674676-e6c3b1c6e87f?w=400&h=300&fit=crop',
  },
  {
    type: 'Sport Touring',
    description: 'Combines sport bike performance with touring comfort',
    image: 'https://images.unsplash.com/photo-1558980664-1db506751ab4?w=400&h=300&fit=crop',
  },
  {
    type: 'Enduro',
    description: 'Lightweight off-road racing bikes for trail riding',
    image: 'https://images.unsplash.com/photo-1571715268002-f5a32ab2fc84?w=400&h=300&fit=crop',
  },
  {
    type: 'Dirt Bike',
    description: 'Pure off-road motorcycles, not street legal',
    image: 'https://images.unsplash.com/photo-1616348002363-57956d4057c8?w=400&h=300&fit=crop',
  },
  {
    type: 'Vintage/Classic',
    description: 'Older collectible motorcycles with timeless appeal',
    image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=400&h=300&fit=crop',
  },
  {
    type: 'Moped',
    description: 'Lower cc bikes, sometimes pedal-assisted for city commuting',
    image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400&h=300&fit=crop',
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

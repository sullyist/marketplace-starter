import Link from 'next/link';

const bikeCategories = [
  { type: 'Sport',         description: 'High-performance motorcycles built for speed and agility',                   icon: '🏁', color: 'from-red-500 to-orange-500' },
  { type: 'Cruiser',       description: 'Comfortable, laid-back riding position for long distances',                  icon: '🛣️', color: 'from-purple-500 to-pink-500' },
  { type: 'Adventure',     description: 'Versatile bikes designed for both on-road and off-road',                     icon: '🏔️', color: 'from-green-500 to-teal-500' },
  { type: 'Touring',       description: 'Long-distance comfort with storage and amenities',                           icon: '🗺️', color: 'from-blue-500 to-indigo-500' },
  { type: 'Standard',      description: 'Upright seating position, perfect for everyday riding',                      icon: '🏍️', color: 'from-gray-500 to-gray-700' },
  { type: 'Dual-Sport',    description: 'Street-legal bikes capable of off-road adventures',                          icon: '⛰️', color: 'from-orange-500 to-amber-600' },
  { type: 'Naked',         description: 'Minimal fairings, exposed engine, raw riding experience',                    icon: '⚡', color: 'from-cyan-500 to-blue-600' },
  { type: 'Scooter',       description: 'Easy to ride, automatic transmission, urban mobility',                       icon: '🛵', color: 'from-pink-500 to-rose-500' },
  { type: 'Cafe Racer',    description: 'Vintage-inspired minimalist styling with retro cool aesthetics',             icon: '☕', color: 'from-amber-600 to-yellow-700' },
  { type: 'Bobber',        description: 'Stripped-down custom cruisers with minimal bodywork',                        icon: '🔧', color: 'from-slate-500 to-slate-700' },
  { type: 'Chopper',       description: 'Extended front forks, custom builds, classic American style',                icon: '🦅', color: 'from-red-700 to-red-900' },
  { type: 'Streetfighter', description: 'Aggressive naked sport bikes with upright riding position',                  icon: '💥', color: 'from-rose-600 to-pink-700' },
  { type: 'Supermoto',     description: 'Dual-sport bikes with street tires, great for urban riding',                 icon: '🏙️', color: 'from-lime-500 to-green-600' },
  { type: 'Electric',      description: 'Zero emissions electric motorcycles for eco-conscious riders',               icon: '🔋', color: 'from-emerald-500 to-teal-600' },
  { type: 'Sport Touring', description: 'Combines sport bike performance with touring comfort',                       icon: '🌍', color: 'from-violet-500 to-purple-600' },
  { type: 'Enduro',        description: 'Lightweight off-road racing bikes for trail riding',                         icon: '🌲', color: 'from-yellow-500 to-amber-600' },
  { type: 'Dirt Bike',     description: 'Pure off-road motorcycles, not street legal',                                icon: '🟤', color: 'from-amber-700 to-orange-800' },
  { type: 'Classic',       description: 'Older collectible motorcycles with timeless appeal',                         icon: '🏛️', color: 'from-stone-500 to-stone-700' },
  { type: 'Moped',         description: 'Lower cc bikes, sometimes pedal-assisted for city commuting',               icon: '🚲', color: 'from-sky-400 to-blue-500' },
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse by Category</h1>
          <p className="text-xl text-blue-100">
            Find the perfect motorcycle type that matches your riding style
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bikeCategories.map((category) => (
            <Link key={category.type} href={`/listings?bikeType=${encodeURIComponent(category.type)}`} className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                <div className={`bg-gradient-to-br ${category.color} p-8 flex items-center justify-center`}>
                  <span className="text-5xl">{category.icon}</span>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">{category.type}</h2>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{category.description}</p>
                  <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-800 transition">
                    Browse {category.type} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Not sure which type?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Each motorcycle category offers unique features and benefits. Consider your
            riding experience, typical routes, and what matters most — speed, comfort, versatility, or efficiency.
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

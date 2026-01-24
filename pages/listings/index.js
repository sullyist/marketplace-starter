import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';

const prisma = new PrismaClient();

const bikeTypes = [
  'Sport',
  'Cruiser',
  'Adventure',
  'Touring',
  'Standard',
  'Dual-Sport',
  'Naked',
  'Scooter',
  'Cafe Racer',
  'Bobber',
  'Chopper',
  'Streetfighter',
  'Supermoto',
  'Electric',
  'Sport Touring',
  'Enduro',
  'Dirt Bike',
  'Classic',
  'Moped',
];

const categoryCards = [
  { type: 'Sport', icon: '🏁', color: 'from-red-500 to-orange-500' },
  { type: 'Cruiser', icon: '🛣️', color: 'from-purple-500 to-pink-500' },
  { type: 'Adventure', icon: '🏔️', color: 'from-green-500 to-teal-500' },
  { type: 'Touring', icon: '🗺️', color: 'from-blue-500 to-indigo-500' },
  { type: 'Naked', icon: '⚡', color: 'from-cyan-500 to-blue-600' },
  { type: 'Scooter', icon: '🛵', color: 'from-pink-500 to-rose-500' },
  { type: 'Cafe Racer', icon: '☕', color: 'from-amber-600 to-yellow-700' },
  { type: 'Electric', icon: '⚡', color: 'from-emerald-500 to-teal-600' },
];

export async function getServerSideProps(context) {
  const { query } = context;
  const {
    search = '',
    make = '',
    model = '',
    minYear = '',
    maxYear = '',
    maxMileage = '',
    condition = '',
    minPrice = '',
    maxPrice = '',
    location = '',
    bikeType = '',
    engineSize = '',
    power = '',
    sortBy = 'newest',
  } = query;

  const filters = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: model, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(make && { make: { contains: make, mode: 'insensitive' } }),
    ...(model && { model: { contains: model, mode: 'insensitive' } }),
    ...(minYear && { year: { gte: minYear } }),
    ...(maxYear && { year: { lte: maxYear } }),
    ...(maxMileage && { mileage: { lte: maxMileage } }),
    ...(condition && { condition }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    ...(bikeType && { bikeType }),
    ...(engineSize && { engineSize: { contains: engineSize } }),
    ...(power && { power: { contains: power, mode: 'insensitive' } }),
  };

  // Determine sort order
  let orderBy;
  switch (sortBy) {
    case 'price-low':
      orderBy = { price: 'asc' };
      break;
    case 'price-high':
      orderBy = { price: 'desc' };
      break;
    case 'year-new':
      orderBy = { year: 'desc' };
      break;
    case 'year-old':
      orderBy = { year: 'asc' };
      break;
    case 'mileage-low':
      orderBy = { mileage: 'asc' };
      break;
    case 'mileage-high':
      orderBy = { mileage: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
  }

  const products = await prisma.product.findMany({
    where: filters,
    orderBy,
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      initialQuery: { search, make, model, minYear, maxYear, maxMileage, condition, minPrice, maxPrice, location, bikeType, engineSize, power, sortBy },
    },
  };
}

export default function Listings({ products, initialQuery }) {
  const [search, setSearch] = useState(initialQuery.search || '');
  const [make, setMake] = useState(initialQuery.make || '');
  const [model, setModel] = useState(initialQuery.model || '');
  const [minYear, setMinYear] = useState(initialQuery.minYear || '');
  const [maxYear, setMaxYear] = useState(initialQuery.maxYear || '');
  const [maxMileage, setMaxMileage] = useState(initialQuery.maxMileage || '');
  const [condition, setCondition] = useState(initialQuery.condition || '');
  const [location, setLocation] = useState(initialQuery.location || '');
  const [minPrice, setMinPrice] = useState(initialQuery.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialQuery.maxPrice || '');
  const [bikeType, setBikeType] = useState(initialQuery.bikeType || '');
  const [engineSize, setEngineSize] = useState(initialQuery.engineSize || '');
  const [power, setPower] = useState(initialQuery.power || '');
  const [sortBy, setSortBy] = useState(initialQuery.sortBy || 'newest');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (make) params.append('make', make);
    if (model) params.append('model', model);
    if (minYear) params.append('minYear', minYear);
    if (maxYear) params.append('maxYear', maxYear);
    if (maxMileage) params.append('maxMileage', maxMileage);
    if (condition) params.append('condition', condition);
    if (location) params.append('location', location);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (bikeType) params.append('bikeType', bikeType);
    if (engineSize) params.append('engineSize', engineSize);
    if (power) params.append('power', power);
    if (sortBy) params.append('sortBy', sortBy);

    window.location.href = `/listings?${params.toString()}`;
  };

  const clearFilters = () => {
    setSearch('');
    setMake('');
    setModel('');
    setMinYear('');
    setMaxYear('');
    setMaxMileage('');
    setCondition('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setBikeType('');
    setEngineSize('');
    setPower('');
    setSortBy('newest');
    window.location.href = '/listings';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Motorcycles
            </h1>
            <p className="text-xl text-blue-100">
              {products.length} {products.length === 1 ? 'motorcycle' : 'motorcycles'} available
            </p>
          </div>
          {/* Sort and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const params = new URLSearchParams(window.location.search);
                params.set('sortBy', e.target.value);
                window.location.href = `/listings?${params.toString()}`;
              }}
              className="px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
              <option value="mileage-low">Mileage: Low to High</option>
              <option value="mileage-high">Mileage: High to Low</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="bg-white border-b py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categoryCards.map((category) => (
              <Link
                key={category.type}
                href={`/listings?bikeType=${category.type}`}
                className="group"
              >
                <div className="bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-all duration-200 overflow-hidden">
                  <div className={`bg-gradient-to-br ${category.color} p-4 text-center`}>
                    <div className="text-3xl mb-1">{category.icon}</div>
                  </div>
                  <div className="p-2 text-center min-h-[2.5rem] flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition break-words leading-tight">
                      {category.type}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
            >
              View All Categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white shadow-md py-8">
        <div className="max-w-6xl mx-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search (title, description)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Make (e.g., Honda)"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Model (e.g., CBR600RR)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="number"
                placeholder="Min Year"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Year"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Mileage (km)"
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input
                type="number"
                placeholder="Min Price (€)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Price (€)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Engine Size (e.g., 600)"
                value={engineSize}
                onChange={(e) => setEngineSize(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Power (BHP/kW)"
                value={power}
                onChange={(e) => setPower(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={bikeType}
                onChange={(e) => setBikeType(e.target.value)}
                className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {bikeTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/listings/${product.id}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition">
                      {product.title}
                    </h2>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Make:</span> {product.make}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Model:</span> {product.model}
                    </p>
                    {product.year && product.year !== 'Unknown' && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Year:</span> {product.year}
                      </p>
                    )}
                    {product.mileage && product.mileage !== 'Unknown' && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Mileage:</span> {parseInt(product.mileage).toLocaleString()} km
                      </p>
                    )}
                    {product.condition && product.condition !== 'Unknown' && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Condition:</span> {product.condition}
                      </p>
                    )}
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Type:</span> {product.bikeType}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Engine:</span> {product.engineSize}cc
                    </p>
                    {product.power && product.power !== 'Unknown' && (
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Power:</span> {product.power}
                      </p>
                    )}
                    <p className="text-gray-600 mb-3">
                      <span className="font-medium">Location:</span> {product.location}
                    </p>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-2xl font-bold text-blue-600">
                        €{product.price.toLocaleString()}
                      </span>
                      <span className="text-blue-600 font-semibold group-hover:text-blue-800 transition">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No motorcycles found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or browse all listings
            </p>
            <Link
              href="/listings"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

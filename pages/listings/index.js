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
  'Vintage/Classic',
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

const engineSizes = ['125', '250', '500', '600', '750', '1000', '1200'];

export async function getServerSideProps(context) {
  const { query } = context;
  const {
    search = '',
    minPrice = '',
    maxPrice = '',
    location = '',
    bikeType = '',
    engineSize = '',
  } = query;

  const filters = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { makeModel: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    ...(bikeType && { bikeType }),
    ...(engineSize && { engineSize: parseInt(engineSize) }),
  };

  const products = await prisma.product.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      initialQuery: { search, minPrice, maxPrice, location, bikeType, engineSize },
    },
  };
}

export default function Listings({ products, initialQuery }) {
  const [search, setSearch] = useState(initialQuery.search || '');
  const [location, setLocation] = useState(initialQuery.location || '');
  const [minPrice, setMinPrice] = useState(initialQuery.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialQuery.maxPrice || '');
  const [bikeType, setBikeType] = useState(initialQuery.bikeType || '');
  const [engineSize, setEngineSize] = useState(initialQuery.engineSize || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (bikeType) params.append('bikeType', bikeType);
    if (engineSize) params.append('engineSize', engineSize);

    window.location.href = `/listings?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Browse Motorcycles
          </h1>
          <p className="text-xl text-blue-100">
            {products.length} {products.length === 1 ? 'motorcycle' : 'motorcycles'} available
          </p>
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search title or model"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
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
            <select
              value={engineSize}
              onChange={(e) => setEngineSize(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Engine Sizes</option>
              {engineSizes.map((size) => (
                <option key={size} value={size}>
                  {size}cc
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="col-span-1 md:col-span-3 lg:col-span-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
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
                      <span className="font-medium">Make & Model:</span> {product.makeModel}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Type:</span> {product.bikeType}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Engine:</span> {product.engineSize}cc
                    </p>
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

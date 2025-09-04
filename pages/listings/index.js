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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Motorcycle Listings</h1>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search title or model"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={bikeType}
          onChange={(e) => setBikeType(e.target.value)}
          className="border px-3 py-2 rounded"
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
          className="border px-3 py-2 rounded"
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
          className="col-span-1 md:col-span-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded shadow-sm p-4">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-48 object-cover mb-4 rounded"
              />
            )}
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <p className="text-sm text-gray-600">Make & Model: {product.makeModel}</p>
            <p className="text-sm text-gray-600">Location: {product.location}</p>
            <p className="text-sm text-gray-600">Engine Size: {product.engineSize}cc</p>
            <p className="text-sm text-gray-600">Type: {product.bikeType}</p>
            <p className="text-gray-800 font-medium mb-2">€{product.price}</p>
            <Link href={`/listings/${product.id}`} className="text-blue-600 hover:underline">
              View details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

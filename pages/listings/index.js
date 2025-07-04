// pages/listings/index.js
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { query } = context;
  const { search = '', minPrice = '', maxPrice = '', location = '', make = '' } = query;

  const filters = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { makeModel: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(location && { location: { equals: location } }),
    ...(make && { makeModel: { equals: make } }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
  };

  const [products, makes, locations] = await Promise.all([
    prisma.product.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      distinct: ['makeModel'],
      select: { makeModel: true },
    }),
    prisma.product.findMany({
      distinct: ['location'],
      select: { location: true },
    }),
  ]);

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      initialQuery: { search, minPrice, maxPrice, location, make },
      allMakes: makes.map((m) => m.makeModel),
      allLocations: locations.map((l) => l.location),
    },
  };
}

export default function Listings({ products, initialQuery, allMakes, allLocations }) {
  const [search, setSearch] = useState(initialQuery.search || '');
  const [location, setLocation] = useState(initialQuery.location || '');
  const [make, setMake] = useState(initialQuery.make || '');
  const [minPrice, setMinPrice] = useState(initialQuery.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialQuery.maxPrice || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    if (make) params.append('make', make);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    window.location.href = `/listings?${params.toString()}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Motorcycle Listings</h1>

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search title or model"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Makes</option>
          {allMakes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Counties</option>
          {allLocations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
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
        <button
          type="submit"
          className="col-span-1 md:col-span-5 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
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
            <p className="text-sm text-gray-600 mb-1">Make & Model: {product.makeModel}</p>
            <p className="text-sm text-gray-600 mb-1">Location: {product.location}</p>
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
